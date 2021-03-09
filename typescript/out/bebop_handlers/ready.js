"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pactheman_models_1 = require("../models/pactheman.models");
const playerJoined_1 = __importDefault(require("./playerJoined"));
class ReadyMsgHandler {
    handleMessage(sender, message) {
        message = pactheman_models_1.ReadyMsg.decode(message);
        console.log(`${playerJoined_1.default.opponentName} is ready. Game will start soon.`);
    }
}
exports.default = ReadyMsgHandler;
