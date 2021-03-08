import IMove, { MoveResult } from "./iMove";
import { PlayerInfo } from "./classes/player";
import Velocity from "./classes/velocity";
import SimpleMoveExample from "./interfaces/simpleExample";
import DQN from "./interfaces/DQN/DQN";
import PGN from "./interfaces/PGN/PGN";

export default class MoveAdapter {
    moveInstructor: IMove = {performMove: (info: PlayerInfo) => { return { sendMove: false, updateVelocity: Velocity.Zero };}, performMoveAsync: (info: PlayerInfo) => {}};

    constructor() {
        this.moveInstructor = new PGN();
    }

    getMove(info: PlayerInfo): MoveResult {
        return this.moveInstructor.performMove(info);
    }
}