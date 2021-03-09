import GameState from '../classes/gameState';
import { PlayerState } from '../models/pactheman.models';
import PositionExtended from '../utils/extensions/positionExtensions';
import BebopHandler from './bebopHandler';

export default class PlayerStateMsgHandler implements BebopHandler {
    handleMessage(sender: any, message: any): void {
        message = PlayerState.decode(message);
        for (var clientId of message.playerPositions.keys()) {
            GameState.Instance.playerState.lives.set(clientId, message.lives.get(clientId) ?? BigInt(0));
            GameState.Instance.playerState.scores.set(clientId, message.scores.get(clientId) ?? BigInt(0));

            if (clientId != GameState.Instance.session.clientId) {
                var oppPos = message.playerPositions.get(clientId) ?? { x: 0, y: 0 };
                if (oppPos.x > 70 && oppPos.x < 1145) {
                    GameState.Instance.playerState.playerPositions.set(clientId, PositionExtended.fromPosition(GameState
                        .Instance.playerState.playerPositions.get(clientId) ?? { x: 0, y: 0 }).interpolatedIPos(oppPos));
                } else {
                    GameState.Instance.playerState.playerPositions.set(clientId, oppPos);
                }
            }
        }

        GameState.Instance.scorePointPositions = message.scorePositions;
    }
}