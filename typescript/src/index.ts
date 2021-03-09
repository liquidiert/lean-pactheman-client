import BebopDispatcher from "./classes/bebopDispatcher";
import Player from "./classes/player";
import PlayerMediator from "./classes/playerMediator";
import args from "./options";
import readline from "readline";
import GameState from "./classes/gameState";
import { MovingState } from "./models/pactheman.models";
import * as tf from "@tensorflow/tfjs-node-gpu";
import model from "./interfaces/DQN/model";

export class Constants {
    static FRAME_DELTA_APPROX: number = 0.0167;
    static MAX_STRIKE_COUNT: number = 3;
    static ACTION_SPACE = [
        MovingState.Up,
        MovingState.Down,
        MovingState.Left,
        MovingState.Right
    ];
}

function validateIPaddress(ipaddress: string): boolean {
    return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress);
}

function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

class Program {

    static player: Player;

    static async main() {

        // init bebop handlers
        await BebopDispatcher.Instance.initialize();

        Program.player = new Player(args.playername);
        PlayerMediator.setPlayer(Program.player);

        if (args.ip === "localhost") args.ip = "127.0.0.1";
        if (!validateIPaddress(args.ip)) {
            console.error("Invalid IP address!");
            process.exit(-2);
        }

        await Program.player.connect(args.ip, args.port);
        console.log("connected");

        if (!args.host) {
            rl.question("Enter session id:\n", (sessionId) => {
                let session = { sessionId: sessionId };
                GameState.Instance.session = session;
                Program.player.join();
                this.gameLoop();
            });
        } else {
            Program.player.host(args["level-count"], args["game-count"]);
            this.gameLoop();
        }

    }

    static async gameLoop() {
        await GameState.Instance.waitInitFuture();

        while (!GameState.Instance.gameOver) {
            await sleep(50);
            if (GameState.Instance.resetCounter > 0) {
                GameState.Instance.resetCounter -= 0.05;
                if (GameState.Instance.resetCounter > 0) {
                    continue;
                }
            }
            Program.player.move();
        }
    }
}

Program.main();