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
const Puppeteer_1 = __importDefault(require("./components/Puppeteer"));
const chokidar_1 = __importDefault(require("chokidar"));
const path_1 = __importDefault(require("path"));
const config_json_1 = __importDefault(require("./config.json"));
require("log-timestamp");
const launch = () => __awaiter(void 0, void 0, void 0, function* () {
    let browserInstance = yield Puppeteer_1.default.build(config_json_1.default.url);
    yield browserInstance.start();
    const watcher = chokidar_1.default.watch(path_1.default.resolve(process.cwd() + "/dist/"), { ignored: /^\./, persistent: true });
    watcher
        .on('change', function (path) {
        browserInstance.reloadTab();
        console.log('File', path, 'has been updated');
    })
        .on('error', function (error) { console.error('Error happened', error); });
    // .on('unlink', function(path) {console.log('File', path, 'has been removed');})
    // .on('add', function(path) {console.log('File', path, 'has been added');})
});
launch();
