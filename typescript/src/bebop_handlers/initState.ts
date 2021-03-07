import GameState from '../classes/gameState';
import Player from '../classes/player';
import { InitState } from '../models/pactheman.models';
import PositionExtended from '../utils/extensions/positionExtensions';
import BebopHandler from './bebopHandler';

export default class InitStateMsgHandler implements BebopHandler {
    handleMessage(sender: any, message: any): void {
        let player = sender as Player;
        message = InitState.decode(message);

        for (var pos of message.playerInitPositions.entries()) {
            GameState.Instance.playerState.playerPositions.set(pos[0], pos[1]);
          }
      
          for (var lives of message.playerInitLives.entries()) {
            GameState.Instance.playerState.lives.set(lives[0], lives[1]);
          }
      
          for (var score of message.playerInitLives.entries()) {
            GameState.Instance.playerState.scores.set(score[0], score[1]);
          }
      
          for (var ghost of message.ghostInitPositions.entries()) {
            GameState.Instance.ghostPositions.set(ghost[0], ghost[1]);
          }
      
          player.position = player.startPosition =
              PositionExtended.fromPosition(message.playerInitPositions.get(GameState.Instance.session.clientId ?? "") ?? { x: 0, y: 0 });
      
          GameState.Instance.scorePointPositions =
              message.scorePointInitPositions;
      
          GameState.Instance.completeInitFuture();
    }
}