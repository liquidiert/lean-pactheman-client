"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const velocity_1 = __importDefault(require("./classes/velocity"));
class IMove {
    performMove(info) {
        this.performMoveAsync(info);
        return { sendMove: false, updateVelocity: velocity_1.default.Zero };
    }
    performMoveAsync(info) { }
}
exports.default = IMove;
