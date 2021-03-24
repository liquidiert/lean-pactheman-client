import Velocity from "./classes/velocity";
import { PlayerInfo } from "./classes/player";

export type MoveResult = { sendMove: boolean, updateVelocity: Velocity };

/*
The base interface for communication with the server / player instance.
IMove must be implemented by any ai interface.
*/
export default abstract class IMove {
    /*
    A default implementation for ai interfaces that only uses PerformMoveAsync.
    Concrete implementations that don't require immediate feedback have to override this method.
    */
    performMove(info: PlayerInfo): MoveResult {
        this.performMoveAsync(info);
        return { sendMove: false, updateVelocity: Velocity.Zero };
    }
    /*
    Asynchronous version of PerformMove.
    Meant to be used if the ai interface requires immediate PlayerState updates.
    */
    performMoveAsync(info: PlayerInfo): void { }
}