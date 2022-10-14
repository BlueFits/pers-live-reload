import { readHTML, getPathToChrome, existsSync, readFile, readFilePath } from "../helpers/utils";
import pupeteer from 'puppeteer';
import path from 'path';
import process from "process";
import { PathLike } from "fs";

export default class PuppeteerBrowser {
	private page: pupeteer.Page;
	private jsPath: PathLike;
	//Singleton Pattern
	private static instance: PuppeteerBrowser;

    constructor (page: pupeteer.Page, jsPath: PathLike) {
        if (typeof page === 'undefined') {
            throw new Error('Cannot be called directly');
        } else {
			this.page = page;
			this.jsPath = jsPath;
		}
    };

	static async build(url: string) {
		if (this.instance) return this.instance;

        const pathToChrome =  getPathToChrome();
		const jsPath: PathLike = path.resolve(process.cwd() + "/dist/bundle.js");

		if (!pathToChrome || !existsSync(pathToChrome)) {
            throw new Error('Chrome was not found. Chrome must be installed for this extension to function. If you have Chrome installed at a custom location you can specify it in the \'chromePath\' setting.');
        } else if (!existsSync(jsPath)) {
			throw new Error("No viable bundle.js")
		};

        let browser = await pupeteer.launch({
			executablePath: pathToChrome,
			headless: false,
			devtools: true,
			defaultViewport: null,
		});

		//Event Listeners
		browser.on("targetcreated", async (target: any)=>{ 
			const page: pupeteer.Page = await target.page();
			if(page) {page.close();};
		 });

		 browser.on("disconnected", async () => {
			process.exit();
		 });

		//Target first tab

		const pages = await browser.pages();
		const page = pages[0];
		await page.goto(url, { waitUntil: 'load' });

        this.instance = new PuppeteerBrowser(page, jsPath);
		return this.instance;
    };

	public async start() {
		await this.render();
	};

	public async render() {
		try {
			//Read the file
			let bundleScript: string = await readFile(this.jsPath)! as string;

			await this.page.$eval("head", (elem: any, scriptTxt: any, styleTxt: any) => { 
				let script = document.createElement("script");
				let style = document.createElement("style");
				style.id = "inject_style_id";
				style.innerHTML = styleTxt;
				script.id="inject_script_id";
				script.type = "text/javascript";	
				script.text = scriptTxt;
				elem.appendChild(style);
				elem.appendChild(script);
			}, bundleScript, "");

			await this.page.$eval("head", () => console.log('%c $$$JS_INJECT: Changes are live', 'background: #222; color: #bada55'));
		} catch(err) {
			throw err;
		}
	};

	public async reloadTab(): Promise<void> {
		await this.page.reload({ waitUntil: 'load' });
		await this.render();
	};
	//Used in render to create network fetching scripts or links
	public async createAsyncTag (tag: any, prop: string, block: string) {
		await this.page.$eval("head", (elem: any) => {
			for (let val of tag) {
				let createdTag: any = document.createElement(block);
				if (val.id) {createdTag.id = val.id;};
				if (block === "link") { 
					createdTag.rel = "stylesheet"; 
					createdTag.type = 'text/css'; 
				} else if (block === "script") {
					createdTag.type = "text/javascript";
				}
				createdTag[prop] = val[prop];
				elem.appendChild(createdTag);
			}
		}, tag, prop, block);
		if (tag[tag.length - 1].id) {await this.page.waitForSelector(`#${tag[tag.length - 1].id}`)};
	};

	public get getJsPath() {
		return this.jsPath;
	}
}