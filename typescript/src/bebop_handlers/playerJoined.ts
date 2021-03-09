import Player from '../classes/player';
import { PlayerJoinedMsg } from '../models/pactheman.models';
import BebopHandler from './bebopHandler';

export default class PlayerJoinedMsgHandler implements BebopHandler {
    static opponentName: string;

    handleMessage(sender: any, message: any): void {
        message = PlayerJoinedMsg.decode(message);
        console.log(`${message.playerName} joined`);
        PlayerJoinedMsgHandler.opponentName = message.playerName ?? "";
        (sender as Player).setReady();
    }
}