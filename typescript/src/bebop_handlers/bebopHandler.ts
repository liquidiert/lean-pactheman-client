import ErrorMsgHandler from "./err";
import ExitMsgHandler from "./exit";
import GameOverMsgHandler from "./gameOver";
import GhostMoveMsgHandler from "./ghostMove";
import InitStateMsgHandler from "./initState";
import NewGameMsgHandler from "./newGame";
import NewLevelMsgHandler from "./newLevel";
import PlayerJoinedMsgHandler from "./playerJoined";
import PlayerStateMsgHandler from "./playerState";
import ReadyMsgHandler from "./ready";
import ResetMsgHandler from "./reset";
import RewardMsgHandler from "./reward";
import SessionMsgHandler from "./session";
import StrikeMsgHandler from "./strikeMsg";

export default abstract class BebopHandler {

    static fromClassName(className: string): BebopHandler | null {
        switch (className) {
            case 'ErrorMsg':
              return new ErrorMsgHandler();
            case 'StrikeMsg':
              return new StrikeMsgHandler();
            case 'SessionMsg':
              return new SessionMsgHandler();
            case 'ExitMsg':
              return new ExitMsgHandler();
            case 'JoinMsg':
              return null; // not used by client
            case 'PlayerState':
              return new PlayerStateMsgHandler();
            case 'GhostMoveMsg':
              return new GhostMoveMsgHandler();
            case 'PlayerJoinedMsg':
              return new PlayerJoinedMsgHandler();
            case 'ReadyMsg':
              return new ReadyMsgHandler();
            case 'InitState':
              return new InitStateMsgHandler();
            case 'ResetMsg':
              return new ResetMsgHandler();
            case 'ReconnectMsg':
              return null; // not used by client
            case 'GameOverMsg':
              return new GameOverMsgHandler();
            case 'NewLevelMsg':
              return new NewLevelMsgHandler();
            case 'NewGameMsg':
              return new NewGameMsgHandler();
            case 'RewardMsg':
              return new RewardMsgHandler();
            default:
              throw new Error('Unknown bebop schema class $className');
          }
    }

    handleMessage(sender: any, message: any) {
        throw new Error("BebopHandler must be extended!");
    }
}