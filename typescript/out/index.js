"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Constants = void 0;
const bebopDispatcher_1 = __importDefault(require("./classes/bebopDispatcher"));
const player_1 = __importDefault(require("./classes/player"));
const playerMediator_1 = __importDefault(require("./classes/playerMediator"));
const options_1 = __importDefault(require("./options"));
const readline_1 = __importDefault(require("readline"));
const gameState_1 = __importDefault(require("./classes/gameState"));
const pactheman_models_1 = require("./models/pactheman.models");
class Constants {
}
exports.Constants = Constants;
Constants.FRAME_DELTA_APPROX = 0.0167;
Constants.MAX_STRIKE_COUNT = 3;
Constants.ACTION_SPACE = [
    pactheman_models_1.MovingState.Up,
    pactheman_models_1.MovingState.Down,
    pactheman_models_1.MovingState.Left,
    pactheman_models_1.MovingState.Right
];
function validateIPaddress(ipaddress) {
    return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress);
}
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
class Program {
    static async main() {
        // init bebop handlers
        await bebopDispatcher_1.default.Instance.initialize();
        Program.player = new player_1.default(options_1.default.playername);
        playerMediator_1.default.setPlayer(Program.player);
        if (options_1.default.ip === "localhost")
            options_1.default.ip = "127.0.0.1";
        if (!validateIPaddress(options_1.default.ip)) {
            console.error("Invalid IP address!");
            process.exit(-2);
        }
        await Program.player.connect(options_1.default.ip, options_1.default.port);
        console.log("connected");
        if (!options_1.default.host) {
            rl.question("Enter session id:\n", (sessionId) => {
                let session = { sessionId: sessionId };
                gameState_1.default.Instance.session = session;
                Program.player.join();
                this.gameLoop();
            });
        }
        else {
            Program.player.host(options_1.default["level-count"], options_1.default["game-count"]);
            this.gameLoop();
        }
    }
    static async gameLoop() {
        await gameState_1.default.Instance.waitInitFuture();
        while (!gameState_1.default.Instance.gameOver) {
            await sleep(50);
            if (gameState_1.default.Instance.resetCounter > 0) {
                gameState_1.default.Instance.resetCounter -= 0.05;
                if (gameState_1.default.Instance.resetCounter > 0) {
                    continue;
                }
            }
            Program.player.move();
        }
    }
}
Program.main();
