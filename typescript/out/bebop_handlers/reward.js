"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gameState_1 = __importDefault(require("../classes/gameState"));
const playerMediator_1 = __importDefault(require("../classes/playerMediator"));
const pactheman_models_1 = require("../models/pactheman.models");
class RewardMsgHandler {
    handleMessage(sender, message) {
        message = pactheman_models_1.RewardMsg.decode(message);
        gameState_1.default.Instance.gainedRewardAndNewState = message;
        playerMediator_1.default.completeInitFuture();
        gameState_1.default.Instance.signalReward(message);
    }
}
exports.default = RewardMsgHandler;
