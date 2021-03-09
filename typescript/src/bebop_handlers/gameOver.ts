import GameState from '../classes/gameState';
import { GameOverMsg } from '../models/pactheman.models';
import gameOverMsgToHumanReadable from '../utils/extensions/gameOver';
import BebopHandler from './bebopHandler';

export default class GameOverMsgHandler implements BebopHandler {
    handleMessage(sender: any, message: any): void {
        message = GameOverMsg.decode(message)
        console.log(
            `Received GameOver because ${gameOverMsgToHumanReadable(message)}. Ending lean client now.`);
        GameState.Instance.setGameOver();
        GameState.Instance.signalGameOver(message);
    }
}