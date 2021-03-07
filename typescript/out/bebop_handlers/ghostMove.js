"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gameState_1 = __importDefault(require("../classes/gameState"));
const pactheman_models_1 = require("../models/pactheman.models");
class GhostMoveMsgHandler {
    handleMessage(sender, message) {
        message = pactheman_models_1.GhostMoveMsg.decode(message);
        for (var pos of message.ghostPositions.entries()) {
            gameState_1.default.Instance.ghostPositions.set(pos[0], pos[1]);
        }
    }
}
exports.default = GhostMoveMsgHandler;
