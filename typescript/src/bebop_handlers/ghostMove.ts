import GameState from '../classes/gameState';
import { GhostMoveMsg } from '../models/pactheman.models';
import BebopHandler from './bebopHandler';

export default class GhostMoveMsgHandler implements BebopHandler {
    handleMessage(sender: any, message: any): void {
        message = GhostMoveMsg.decode(message);
        for (var pos of message.ghostPositions.entries()) {
            GameState.Instance.ghostPositions.set(pos[0], pos[1]);
        }
    }
}