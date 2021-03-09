import GameState from '../classes/gameState';
import { ResetMsg } from '../models/pactheman.models';
import BebopHandler from './bebopHandler';

export default class ResetMsgHandler implements BebopHandler {
    handleMessage(sender: any, message: any): void {
        message = ResetMsg.decode(message);
        GameState.Instance.setResetCount();
        GameState.Instance.signalReset(message);
    }
}