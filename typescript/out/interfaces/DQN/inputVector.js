"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gameState_1 = __importDefault(require("../../classes/gameState"));
const positionExtensions_1 = __importDefault(require("../../utils/extensions/positionExtensions"));
const tfjs_node_1 = require("@tensorflow/tfjs-node");
class InputVector {
    constructor() {
        let selfDownscaled = positionExtensions_1.default.fromPosition(gameState_1.default.Instance.playerState.playerPositions.get(gameState_1.default.Instance.session.clientId ?? "")
            ?? { x: 0, y: 0 }).downscaled();
        this.selfPosition_x = selfDownscaled.x;
        this.selfPosition_y = selfDownscaled.y;
        let blinky = positionExtensions_1.default.fromPosition(gameState_1.default.Instance.ghostPositions.get("blinky") ?? { x: 0, y: 0 }).downscaled();
        this.blinkyPosition_x = blinky.x;
        this.blinkyPosition_y = blinky.y;
        let inky = positionExtensions_1.default.fromPosition(gameState_1.default.Instance.ghostPositions.get("blinky") ?? { x: 0, y: 0 }).downscaled();
        this.inkyPosition_x = inky.x;
        this.inkyPosition_y = inky.y;
        let pinky = positionExtensions_1.default.fromPosition(gameState_1.default.Instance.ghostPositions.get("blinky") ?? { x: 0, y: 0 }).downscaled();
        this.pinkyPosition_x = pinky.x;
        this.pinkyPosition_y = pinky.y;
        let clyde = positionExtensions_1.default.fromPosition(gameState_1.default.Instance.ghostPositions.get("blinky") ?? { x: 0, y: 0 }).downscaled();
        this.clydePosition_x = clyde.x;
        this.clydePosition_y = clyde.y;
    }
    get asTensor() {
        return tfjs_node_1.tensor([this.selfPosition_x, this.selfPosition_y, this.blinkyPosition_x, this.blinkyPosition_y,
            this.inkyPosition_x, this.inkyPosition_y, this.pinkyPosition_x, this.pinkyPosition_y,
            this.clydePosition_x, this.clydePosition_y], [1, 10]);
    }
    get tensorlike() {
        return [this.selfPosition_x, this.selfPosition_y, this.blinkyPosition_x, this.blinkyPosition_y,
            this.inkyPosition_x, this.inkyPosition_y, this.pinkyPosition_x, this.pinkyPosition_y,
            this.clydePosition_x, this.clydePosition_y];
    }
    get shape() {
        return [10];
    }
    static fromStateUpdate(selfPos, ghostPositions) {
        let vector = new InputVector();
        let selfDownscaled = positionExtensions_1.default.fromPosition(selfPos).downscaled();
        vector.selfPosition_x = selfDownscaled.x;
        vector.selfPosition_y = selfDownscaled.y;
        let blinky = positionExtensions_1.default.fromPosition(ghostPositions.get("blinky") ?? { x: 0, y: 0 }).downscaled();
        vector.blinkyPosition_x = blinky.x;
        vector.blinkyPosition_y = blinky.y;
        let inky = positionExtensions_1.default.fromPosition(ghostPositions.get("blinky") ?? { x: 0, y: 0 }).downscaled();
        vector.inkyPosition_x = inky.x;
        vector.inkyPosition_y = inky.y;
        let pinky = positionExtensions_1.default.fromPosition(ghostPositions.get("blinky") ?? { x: 0, y: 0 }).downscaled();
        vector.pinkyPosition_x = pinky.x;
        vector.pinkyPosition_y = pinky.y;
        let clyde = positionExtensions_1.default.fromPosition(ghostPositions.get("blinky") ?? { x: 0, y: 0 }).downscaled();
        vector.clydePosition_x = clyde.x;
        vector.clydePosition_y = clyde.y;
        return vector;
    }
}
exports.default = InputVector;
