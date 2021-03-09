import GameState from '../classes/gameState';
import { SessionMsg } from '../models/pactheman.models';
import BebopHandler from './bebopHandler';

export default class SessionMsgHandler implements BebopHandler {
    handleMessage(sender: any, message: any): void {
        message = SessionMsg.decode(message);
        GameState.Instance.session = message;
        console.log(message.clientId);
        console.log(message.sessionId);
    }
}