"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const err_1 = __importDefault(require("./err"));
const exit_1 = __importDefault(require("./exit"));
const gameOver_1 = __importDefault(require("./gameOver"));
const ghostMove_1 = __importDefault(require("./ghostMove"));
const initState_1 = __importDefault(require("./initState"));
const newGame_1 = __importDefault(require("./newGame"));
const newLevel_1 = __importDefault(require("./newLevel"));
const playerJoined_1 = __importDefault(require("./playerJoined"));
const playerState_1 = __importDefault(require("./playerState"));
const ready_1 = __importDefault(require("./ready"));
const reset_1 = __importDefault(require("./reset"));
const reward_1 = __importDefault(require("./reward"));
const session_1 = __importDefault(require("./session"));
const strikeMsg_1 = __importDefault(require("./strikeMsg"));
class BebopHandler {
    static fromClassName(className) {
        switch (className) {
            case 'ErrorMsg':
                return new err_1.default();
            case 'StrikeMsg':
                return new strikeMsg_1.default();
            case 'SessionMsg':
                return new session_1.default();
            case 'ExitMsg':
                return new exit_1.default();
            case 'JoinMsg':
                return null; // not used by client
            case 'PlayerState':
                return new playerState_1.default();
            case 'GhostMoveMsg':
                return new ghostMove_1.default();
            case 'PlayerJoinedMsg':
                return new playerJoined_1.default();
            case 'ReadyMsg':
                return new ready_1.default();
            case 'InitState':
                return new initState_1.default();
            case 'ResetMsg':
                return new reset_1.default();
            case 'ReconnectMsg':
                return null; // not used by client
            case 'GameOverMsg':
                return new gameOver_1.default();
            case 'NewLevelMsg':
                return new newLevel_1.default();
            case 'NewGameMsg':
                return new newGame_1.default();
            case 'RewardMsg':
                return new reward_1.default();
            default:
                throw new Error('Unknown bebop schema class $className');
        }
    }
    handleMessage(sender, message) {
        throw new Error("BebopHandler must be extended!");
    }
}
exports.default = BebopHandler;
