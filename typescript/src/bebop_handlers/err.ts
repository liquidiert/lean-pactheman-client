import GameState from '../classes/gameState';
import { ErrorMsg } from '../models/pactheman.models';
import { Constants } from '..';
import BebopHandler from './bebopHandler';

export default class ErrorMsgHandler implements BebopHandler {
    handleMessage(sender: any, message: any): void {
        message = ErrorMsg.decode(message);
        console.log(`Received ${message.errorMessage} violation`)
        GameState.Instance.strikeCount++;
        console.log(`Watch out this is your ${GameState.Instance.strikeCount} strike.`);
        console.log(`Only ${Constants.MAX_STRIKE_COUNT - GameState.Instance.strikeCount} strike(s) left.`);
    }
}