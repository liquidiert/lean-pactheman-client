import GameState from '../classes/gameState';
import { NewLevelMsg } from '../models/pactheman.models';
import BebopHandler from './bebopHandler';

export default class NewLevelMsgHandler implements BebopHandler {
    handleMessage(sender: any, message: any): void {
        message = NewLevelMsg.decode(message);
        GameState.Instance.setResetCount();
        GameState.Instance.signalNewLevel(message);
        console.log('Starting new level');
    }
}