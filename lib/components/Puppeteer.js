"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../helpers/utils");
const puppeteer_1 = __importDefault(require("puppeteer"));
const path_1 = __importDefault(require("path"));
const process_1 = __importDefault(require("process"));
class PuppeteerBrowser {
    constructor(page, jsPath) {
        if (typeof page === 'undefined') {
            throw new Error('Cannot be called directly');
        }
        else {
            this.page = page;
            this.jsPath = jsPath;
        }
    }
    ;
    static build(url) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.instance)
                return this.instance;
            const pathToChrome = (0, utils_1.getPathToChrome)();
            const jsPath = path_1.default.resolve(process_1.default.cwd() + "/dist/bundle.js");
            if (!pathToChrome || !(0, utils_1.existsSync)(pathToChrome)) {
                throw new Error('Chrome was not found. Chrome must be installed for this extension to function. If you have Chrome installed at a custom location you can specify it in the \'chromePath\' setting.');
            }
            else if (!(0, utils_1.existsSync)(jsPath)) {
                throw new Error("No viable bundle.js");
            }
            ;
            let browser = yield puppeteer_1.default.launch({
                executablePath: pathToChrome,
                headless: false,
                devtools: true,
                defaultViewport: null,
            });
            //Event Listeners
            browser.on("targetcreated", (target) => __awaiter(this, void 0, void 0, function* () {
                const page = yield target.page();
                if (page) {
                    page.close();
                }
                ;
            }));
            browser.on("disconnected", () => __awaiter(this, void 0, void 0, function* () {
                process_1.default.exit();
            }));
            //Target first tab
            const pages = yield browser.pages();
            const page = pages[0];
            yield page.goto(url, { waitUntil: 'load', timeout: 0 });
            this.instance = new PuppeteerBrowser(page, jsPath);
            return this.instance;
        });
    }
    ;
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.render();
        });
    }
    ;
    render() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Read the file
                let bundleScript = yield (0, utils_1.readFile)(this.jsPath);
                yield this.page.$eval("head", (elem, scriptTxt, styleTxt) => {
                    let script = document.createElement("script");
                    let style = document.createElement("style");
                    style.id = "inject_style_id";
                    style.innerHTML = styleTxt;
                    script.id = "inject_script_id";
                    script.type = "text/javascript";
                    script.text = scriptTxt;
                    elem.appendChild(style);
                    elem.appendChild(script);
                }, bundleScript, "");
                yield this.page.$eval("head", () => console.log('%c $$$JS_INJECT: Changes are live', 'background: #222; color: #bada55'));
            }
            catch (err) {
                throw err;
            }
        });
    }
    ;
    reloadTab() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.reload({ waitUntil: 'load' });
            yield this.render();
        });
    }
    ;
    //Used in render to create network fetching scripts or links
    createAsyncTag(tag, prop, block) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.$eval("head", (elem) => {
                for (let val of tag) {
                    let createdTag = document.createElement(block);
                    if (val.id) {
                        createdTag.id = val.id;
                    }
                    ;
                    if (block === "link") {
                        createdTag.rel = "stylesheet";
                        createdTag.type = 'text/css';
                    }
                    else if (block === "script") {
                        createdTag.type = "text/javascript";
                    }
                    createdTag[prop] = val[prop];
                    elem.appendChild(createdTag);
                }
            }, tag, prop, block);
            if (tag[tag.length - 1].id) {
                yield this.page.waitForSelector(`#${tag[tag.length - 1].id}`);
            }
            ;
        });
    }
    ;
    get getJsPath() {
        return this.jsPath;
    }
}
exports.default = PuppeteerBrowser;
