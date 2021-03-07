"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gameState_1 = __importDefault(require("../classes/gameState"));
const pactheman_models_1 = require("../models/pactheman.models");
const gameOver_1 = __importDefault(require("../utils/extensions/gameOver"));
class GameOverMsgHandler {
    handleMessage(sender, message) {
        message = pactheman_models_1.GameOverMsg.decode(message);
        console.log(`Received GameOver because ${gameOver_1.default(message)}. Ending lean client now.`);
        gameState_1.default.Instance.setGameOver();
        gameState_1.default.Instance.signalGameOver(message);
    }
}
exports.default = GameOverMsgHandler;
