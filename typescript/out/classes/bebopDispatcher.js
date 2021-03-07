"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs/promises"));
const bebopHandler_1 = __importDefault(require("../bebop_handlers/bebopHandler"));
class BebopDispatcher {
    constructor() {
        this.handlers = new Map();
    }
    static get Instance() {
        if (BebopDispatcher._instance === undefined) {
            BebopDispatcher._instance = new BebopDispatcher();
        }
        return BebopDispatcher._instance;
    }
    async _analyzeDir(entityPath) {
        if ((await fs.lstat(entityPath)).isDirectory()) {
            for (var child of await fs.readdir(entityPath)) {
                await this._analyzeDir(`${entityPath}/${child}`);
            }
        }
        else {
            var inputFile = await fs.readFile(entityPath, 'utf8');
            var content = inputFile.split(/\r?\n/);
            if (!content[0].includes('opcode'))
                return;
            var className = content[1].split(' ')[1];
            var opCodeString = (content[0].match(/(\d+)/g) ?? [])[1];
            // IMPORTANT: bebop opcodes are stored as hex vals
            var opCode = parseInt(opCodeString, 16);
            var handler = bebopHandler_1.default.fromClassName(className);
            if (handler != null) {
                this.registerHandler(opCode, handler);
            }
        }
    }
    async initialize() {
        let schemaDir = "./bebop_schemas";
        await this._analyzeDir(schemaDir);
    }
    registerHandler(opCode, handler) {
        this.handlers.set(opCode, handler);
    }
    removeHandler(opCode) {
        this.handlers.delete(opCode);
    }
    dispatch(opCode, message, { sender = null }) {
        this.handlers.get(opCode)?.handleMessage(sender, message);
    }
    toString() {
        return `registered opcodes: ${Array.from(this.handlers.keys()).join(', ')}`;
    }
}
exports.default = BebopDispatcher;
