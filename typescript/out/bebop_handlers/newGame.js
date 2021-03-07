"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gameState_1 = __importDefault(require("../classes/gameState"));
const pactheman_models_1 = require("../models/pactheman.models");
class NewGameMsgHandler {
    handleMessage(sender, message) {
        message = pactheman_models_1.NewGameMsg.decode(message);
        gameState_1.default.Instance.setResetCount();
        gameState_1.default.Instance.signalNewGame(message);
        console.log('Starting new game');
    }
}
exports.default = NewGameMsgHandler;
