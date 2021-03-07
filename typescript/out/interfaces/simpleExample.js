"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const velocity_1 = __importDefault(require("../classes/velocity"));
const iMove_1 = __importDefault(require("../iMove"));
const lodash_1 = require("lodash");
class SimpleMoveExample extends iMove_1.default {
    performMove(info) {
        let velocities = [
            new velocity_1.default(-64, 0),
            new velocity_1.default(64, 0),
            new velocity_1.default(0, 64),
            new velocity_1.default(0, -64), // down
        ];
        return { sendMove: true, updateVelocity: lodash_1.sample(velocities) ?? velocity_1.default.Zero };
    }
}
exports.default = SimpleMoveExample;
