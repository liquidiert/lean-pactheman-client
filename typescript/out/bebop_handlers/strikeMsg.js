"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const gameState_1 = __importDefault(require("../classes/gameState"));
const pactheman_models_1 = require("../models/pactheman.models");
class StrikeMsgHandler {
    handleMessage(sender, message) {
        message = pactheman_models_1.StrikeMsg.decode(message);
        gameState_1.default.Instance.strikeCount++;
        console.log(`Watch out this is your ${gameState_1.default.Instance.strikeCount} strike.`);
        console.log(`Only ${__1.Constants.MAX_STRIKE_COUNT - gameState_1.default.Instance.strikeCount} strike(s) left.`);
    }
}
exports.default = StrikeMsgHandler;
