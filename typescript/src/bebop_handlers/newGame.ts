import GameState from '../classes/gameState';
import { NewGameMsg } from '../models/pactheman.models';
import BebopHandler from './bebopHandler';

export default class NewGameMsgHandler implements BebopHandler {
    handleMessage(sender: any, message: any): void {
        message = NewGameMsg.decode(message);
        GameState.Instance.setResetCount();
        GameState.Instance.signalNewGame(message);
        console.log('Starting new game');
    }
}