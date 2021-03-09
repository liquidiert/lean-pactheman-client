import { Constants } from '..';
import GameState from '../classes/gameState';
import { StrikeMsg } from '../models/pactheman.models';
import BebopHandler from './bebopHandler';

export default class StrikeMsgHandler implements BebopHandler {
    handleMessage(sender: any, message: any): void {
        message = StrikeMsg.decode(message);
        GameState.Instance.strikeCount++;
        console.log(`Watch out this is your ${GameState.Instance.strikeCount} strike.`);
        console.log(`Only ${Constants.MAX_STRIKE_COUNT - GameState.Instance.strikeCount} strike(s) left.`);
    }
}