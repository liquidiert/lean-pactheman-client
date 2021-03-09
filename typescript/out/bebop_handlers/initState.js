"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gameState_1 = __importDefault(require("../classes/gameState"));
const pactheman_models_1 = require("../models/pactheman.models");
const positionExtensions_1 = __importDefault(require("../utils/extensions/positionExtensions"));
class InitStateMsgHandler {
    handleMessage(sender, message) {
        let player = sender;
        message = pactheman_models_1.InitState.decode(message);
        for (var pos of message.playerInitPositions.entries()) {
            gameState_1.default.Instance.playerState.playerPositions.set(pos[0], pos[1]);
        }
        for (var lives of message.playerInitLives.entries()) {
            gameState_1.default.Instance.playerState.lives.set(lives[0], lives[1]);
        }
        for (var score of message.playerInitLives.entries()) {
            gameState_1.default.Instance.playerState.scores.set(score[0], score[1]);
        }
        for (var ghost of message.ghostInitPositions.entries()) {
            gameState_1.default.Instance.ghostPositions.set(ghost[0], ghost[1]);
        }
        player.position = player.startPosition =
            positionExtensions_1.default.fromPosition(message.playerInitPositions.get(gameState_1.default.Instance.session.clientId ?? "") ?? { x: 0, y: 0 });
        gameState_1.default.Instance.scorePointPositions =
            message.scorePointInitPositions;
        gameState_1.default.Instance.completeInitFuture();
    }
}
exports.default = InitStateMsgHandler;
