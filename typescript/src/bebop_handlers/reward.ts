import GameState from '../classes/gameState';
import PlayerMediator from '../classes/playerMediator';
import { RewardMsg } from '../models/pactheman.models';
import BebopHandler from './bebopHandler';

export default class RewardMsgHandler implements BebopHandler {
    handleMessage(sender: any, message: any): void {
        message = RewardMsg.decode(message);
        GameState.Instance.gainedRewardAndNewState = message;
        PlayerMediator.completeInitFuture();
        GameState.Instance.signalReward(message);
    }
}