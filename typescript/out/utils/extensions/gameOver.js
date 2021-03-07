"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pactheman_models_1 = require("../../models/pactheman.models");
function gameOverMsgToHumanReadable(msg) {
    if (msg.reason == pactheman_models_1.GameOverReason.ExceededGameCount) {
        return 'maximum number of Games has been played';
    }
    else if (msg.reason == pactheman_models_1.GameOverReason.ExceededStrikes) {
        return `${msg.playerId} has exceeded the maximum strike count`;
    }
    else if (msg.reason == pactheman_models_1.GameOverReason.ExceededLevelCount) {
        return 'maximum number of levels has been played';
    }
    else {
        return 'Unknown GameOver cause';
    }
}
exports.default = gameOverMsgToHumanReadable;
