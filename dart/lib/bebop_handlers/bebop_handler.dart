import './err_msg.dart';
import './session.dart';
import './exit.dart';
import './player_state.dart';
import './ghost_move.dart';
import './player_joined.dart';
import './ready.dart';
import './init_state.dart';
import './reset.dart';
import './reward.dart';
import './game_over.dart';
import './new_level.dart';
import './new_game.dart';

abstract class BebopHandler {
  BebopHandler();

  factory BebopHandler.fromClassName(String className) {
    switch (className) {
      case 'ErrorMsg':
        return ErrorMsgHandler();
      case 'SessionMsg':
        return SessionMsgHandler();
      case 'ExitMsg':
        return ExitMsgHandler();
      case 'JoinMsg':
        return null; // not used by client
      case 'PlayerState':
        return PlayerStateMsgHandler();
      case 'GhostMoveMsg':
        return GhostMoveMsgHandler();
      case 'PlayerJoinedMsg':
        return PlayerJoinedMsgHandler();
      case 'ReadyMsg':
        return ReadyMsgHandler();
      case 'InitState':
        return InitStateMsgHandler();
      case 'ResetMsg':
        return ResetMsgHandler();
      case 'ReconnectMsg':
        return null; // not used by client
      case 'GameOverMsg':
        return GameOverMsgHandler();
      case 'NewLevelMsg':
        return NewLevelMsgHandler();
      case 'NewGameMsg':
        return NewGameMsgHandler();
      case 'RewardMsg':
        return RewardMsgHandler();
      default:
        throw UnimplementedError('Unknown bebop schema class $className');
    }
  }

  void handleMessage(dynamic sender, dynamic message) {
    throw UnsupportedError('BebopHandler must be extended!');
  }
}
