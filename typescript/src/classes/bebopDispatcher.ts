import * as fs from "fs/promises";
import BebopHandler from "../bebop_handlers/bebopHandler";

export default class BebopDispatcher {
    private static _instance: BebopDispatcher;

    private constructor() { }

    static get Instance(): BebopDispatcher {
        if (BebopDispatcher._instance === undefined) {
            BebopDispatcher._instance = new BebopDispatcher();
        }
        return BebopDispatcher._instance;
    }

    private async _analyzeDir(entityPath: string) {
        if ((await fs.lstat(entityPath)).isDirectory()) {
            for (var child of await fs.readdir(entityPath)) {
                await this._analyzeDir(`${entityPath}/${child}`);
            }
        } else {
            var inputFile = await fs.readFile(entityPath, 'utf8');
            var content = inputFile.split(/\r?\n/);
            if (!content[0].includes('opcode')) return;
            var className = content[1].split(' ')[1];
            var opCodeString = (content[0].match(/(\d+)/g) ?? [])[1];
            // IMPORTANT: bebop opcodes are stored as hex vals
            var opCode = parseInt(opCodeString, 16);
            var handler = BebopHandler.fromClassName(className);
            if (handler != null) {
                this.registerHandler(opCode, handler);
            }
        }
    }

    async initialize() {
        let schemaDir = "./bebop_schemas";
        await this._analyzeDir(schemaDir);
    }

    handlers: Map<number, BebopHandler> = new Map();

    registerHandler(opCode: number, handler: BebopHandler) {
        this.handlers.set(opCode, handler);
    }

    removeHandler(opCode: number) {
        this.handlers.delete(opCode);
    }

    dispatch(opCode: number, message: Uint8Array, {sender = null}: { sender: null | any }) {
        this.handlers.get(opCode)?.handleMessage(sender, message);
    }

    toString(): string {
        return `registered opcodes: ${Array.from(this.handlers.keys()).join(', ')}`;
    }
}