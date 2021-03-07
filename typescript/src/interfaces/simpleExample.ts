import { PlayerInfo } from "../classes/player";
import Velocity from "../classes/velocity";
import IMove, { MoveResult } from "../iMove";
import { sample } from "lodash";

export default class SimpleMoveExample extends IMove {
    performMove(info: PlayerInfo): MoveResult {
        let velocities = [
            new Velocity(-64, 0), // left
            new Velocity(64, 0),  // right
            new Velocity(0, 64),  // up
            new Velocity(0, -64), // down
        ];
        return { sendMove: true, updateVelocity: sample(velocities) ?? Velocity.Zero };
    }
}