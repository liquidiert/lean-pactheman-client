"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gameState_1 = __importDefault(require("../classes/gameState"));
const pactheman_models_1 = require("../models/pactheman.models");
class NewLevelMsgHandler {
    handleMessage(sender, message) {
        message = pactheman_models_1.NewLevelMsg.decode(message);
        gameState_1.default.Instance.setResetCount();
        gameState_1.default.Instance.signalNewLevel(message);
        console.log('Starting new level');
    }
}
exports.default = NewLevelMsgHandler;
