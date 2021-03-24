import IMove, { MoveResult } from "./iMove";
import { PlayerInfo } from "./classes/player";
import Velocity from "./classes/velocity";
import SimpleMoveExample from "./interfaces/simpleExample";
import DQN from "./interfaces/DQN/DQN";
import PGN from "./interfaces/PGN/PGN";

export default class MoveAdapter {
    moveInstructor: IMove;

    constructor() {
        this.moveInstructor = new DQN();
    }

    getMove(info: PlayerInfo): MoveResult {
        return this.moveInstructor.performMove(info);
    }
}
