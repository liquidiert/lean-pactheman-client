import { ReadyMsg } from '../models/pactheman.models';
import BebopHandler from './bebopHandler';
import PlayerJoinedMsgHandler from './playerJoined';

export default class ReadyMsgHandler implements BebopHandler {
    handleMessage(sender: any, message: any): void {
        message = ReadyMsg.decode(message);
        console.log(`${PlayerJoinedMsgHandler.opponentName} is ready. Game will start soon.`);
    }
}