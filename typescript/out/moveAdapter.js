"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const velocity_1 = __importDefault(require("./classes/velocity"));
const PGN_1 = __importDefault(require("./interfaces/PGN/PGN"));
class MoveAdapter {
    constructor() {
        this.moveInstructor = { performMove: (info) => { return { sendMove: false, updateVelocity: velocity_1.default.Zero }; }, performMoveAsync: (info) => { } };
        this.moveInstructor = new PGN_1.default();
    }
    getMove(info) {
        return this.moveInstructor.performMove(info);
    }
}
exports.default = MoveAdapter;
