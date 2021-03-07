"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gameState_1 = __importDefault(require("../classes/gameState"));
const pactheman_models_1 = require("../models/pactheman.models");
const positionExtensions_1 = __importDefault(require("../utils/extensions/positionExtensions"));
class PlayerStateMsgHandler {
    handleMessage(sender, message) {
        message = pactheman_models_1.PlayerState.decode(message);
        for (var clientId of message.playerPositions.keys()) {
            gameState_1.default.Instance.playerState.lives.set(clientId, message.lives.get(clientId) ?? BigInt(0));
            gameState_1.default.Instance.playerState.scores.set(clientId, message.scores.get(clientId) ?? BigInt(0));
            if (clientId != gameState_1.default.Instance.session.clientId) {
                var oppPos = message.playerPositions.get(clientId) ?? { x: 0, y: 0 };
                if (oppPos.x > 70 && oppPos.x < 1145) {
                    gameState_1.default.Instance.playerState.playerPositions.set(clientId, positionExtensions_1.default.fromPosition(gameState_1.default
                        .Instance.playerState.playerPositions.get(clientId) ?? { x: 0, y: 0 }).interpolatedIPos(oppPos));
                }
                else {
                    gameState_1.default.Instance.playerState.playerPositions.set(clientId, oppPos);
                }
            }
        }
        gameState_1.default.Instance.scorePointPositions = message.scorePositions;
    }
}
exports.default = PlayerStateMsgHandler;
