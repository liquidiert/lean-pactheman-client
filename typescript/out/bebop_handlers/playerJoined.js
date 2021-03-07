"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pactheman_models_1 = require("../models/pactheman.models");
class PlayerJoinedMsgHandler {
    handleMessage(sender, message) {
        message = pactheman_models_1.PlayerJoinedMsg.decode(message);
        console.log(`${message.playerName} joined`);
        PlayerJoinedMsgHandler.opponentName = message.playerName ?? "";
        sender.setReady();
    }
}
exports.default = PlayerJoinedMsgHandler;
