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
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
class MapReader {
    constructor() {
        this.map = [];
        try {
            var text = fs.readFileSync("../map.txt", 'utf8').split(/\r?\n/);
            for (var h = 0; h < text.length; h++) {
                this.map.push([]);
                for (var w = 0; w < text[h].length; w++) {
                    this.map[h].push(parseInt(text[h][w]));
                }
            }
            this.map.splice(this.map.length - 1);
        }
        catch (ex) {
            console.error(`Map file parsing failed! ${ex}`);
            process.exit(-1);
        }
    }
    static get Instance() {
        if (MapReader._instance === undefined) {
            MapReader._instance = new MapReader();
        }
        return MapReader._instance;
    }
    isValidPosition(position) {
        if (position.x > 19 || position.y > 22) {
            throw new Error(`Position must be down scaled ${position}`);
        }
        try {
            return this.map[position.y][position.x] == 0;
        }
        catch (ex) {
            return false;
        }
    }
}
exports.default = MapReader;
