import Velocity from "./classes/velocity";
import { PlayerInfo } from "./classes/player";

export type MoveResult = { sendMove: boolean, updateVelocity: Velocity };

export default abstract class IMove {
    performMove(info: PlayerInfo): MoveResult {
        this.performMoveAsync(info);
        return { sendMove: false, updateVelocity: Velocity.Zero };
    }
    performMoveAsync(info: PlayerInfo): void {}
}