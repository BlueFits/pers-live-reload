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
exports.readFolderPath = exports.readFilePath = exports.readFile = exports.readHTML = exports.getPathToChrome = exports.getPlatform = exports.existsSync = void 0;
const cheerio_1 = __importDefault(require("cheerio"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const WIN_APPDATA = process.env.LOCALAPPDATA || '/';
const DEFAULT_CHROME_PATH = {
    LINUX: '/usr/bin/google-chrome',
    OSX: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    WIN: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    WIN_LOCALAPPDATA: path_1.default.join(WIN_APPDATA, 'Google\\Chrome\\Application\\chrome.exe'),
    WINx86: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
};
function existsSync(path) {
    try {
        fs_1.default.statSync(path);
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.existsSync = existsSync;
function getPlatform() {
    const platform = os_1.default.platform();
    return platform === 'darwin' ? 1 /* Platform.OSX */ :
        platform === 'win32' ? 0 /* Platform.Windows */ :
            2 /* Platform.Linux */;
}
exports.getPlatform = getPlatform;
function getPathToChrome() {
    const platform = getPlatform();
    if (platform === 1 /* Platform.OSX */) {
        return existsSync(DEFAULT_CHROME_PATH.OSX) ? DEFAULT_CHROME_PATH.OSX : '';
    }
    else if (platform === 0 /* Platform.Windows */) {
        if (existsSync(DEFAULT_CHROME_PATH.WINx86)) {
            return DEFAULT_CHROME_PATH.WINx86;
        }
        else if (existsSync(DEFAULT_CHROME_PATH.WIN)) {
            return DEFAULT_CHROME_PATH.WIN;
        }
        else if (existsSync(DEFAULT_CHROME_PATH.WIN_LOCALAPPDATA)) {
            return DEFAULT_CHROME_PATH.WIN_LOCALAPPDATA;
        }
        else {
            return '';
        }
    }
    else {
        return existsSync(DEFAULT_CHROME_PATH.LINUX) ? DEFAULT_CHROME_PATH.LINUX : '';
    }
}
exports.getPathToChrome = getPathToChrome;
const readHTML = (html) => {
    const $ = cheerio_1.default.load(html);
    let scriptWithSrc = [];
    let linkTags = [];
    let scriptTags = $("script");
    let scriptTxt = null;
    for (let i = 0; i < scriptTags.length; i++) {
        if ($(scriptTags.get(i)).html()) {
            scriptTxt = $(scriptTags.get(i)).html();
            break;
        }
    }
    if ($("script[src]").length > 0) {
        $("script[src]").each((index, elem) => {
            scriptWithSrc = [...scriptWithSrc, { id: elem.attribs.id, src: elem.attribs.src }];
        });
    }
    $("link[rel=stylesheet]").each((index, elem) => {
        linkTags = [...linkTags, { id: elem.attribs.id, href: elem.attribs.href }];
    });
    return {
        linkTags,
        scriptWithSrc,
        scriptTxt,
        styleTxt: $("style").html(),
    };
};
exports.readHTML = readHTML;
const readFile = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    if (!filePath) {
        throw new Error("YOUR-EXTENSION: Working folder not found, open a folder an try again");
    }
    else {
        let file = yield fs_1.default.readFileSync(filePath).toString();
        return file;
    }
});
exports.readFile = readFile;
const readFilePath = () => __awaiter(void 0, void 0, void 0, function* () {
    let path = "File path";
    if (!path) {
        throw new Error("Must have an active window");
    }
    else {
        return path;
    }
});
exports.readFilePath = readFilePath;
const readFolderPath = () => __awaiter(void 0, void 0, void 0, function* () {
    return "folder path";
});
exports.readFolderPath = readFolderPath;
