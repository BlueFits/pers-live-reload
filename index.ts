import PuppeteerBrowser from "./components/Puppeteer";
import chokidar from "chokidar";
import path from "path";
import "log-timestamp";

type config = { url: string };

class Index {

    private config: config;

    constructor(config: config) {
        this.config = config
        this.launch();
    };

    async launch() {
        let browserInstance = await PuppeteerBrowser.build(this.config.url);
    
        await browserInstance.start();
    
        const watcher = chokidar.watch(path.resolve(process.cwd() + "/dist/"), {ignored: /^\./, persistent: true});
        watcher
        .on('change', function(path: any) {
            browserInstance.reloadTab();
            console.log('File', path, 'has been updated');
        })
        .on('error', function(error: any) {console.error('Error happened', error);})
        // .on('unlink', function(path) {console.log('File', path, 'has been removed');})
        // .on('add', function(path) {console.log('File', path, 'has been added');})
    }
}

export default Index;