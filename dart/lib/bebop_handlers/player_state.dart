import 'package:lean_dart_client/classes/game_state.dart';
import 'package:lean_dart_client/extensions/position.dart';
import 'bebop_handler.dart';
import 'package:lean_dart_client/schemas.g.dart';

class PlayerStateMsgHandler extends BebopHandler {
  @override
  void handleMessage(sender, message) {
    var decodedMessage = PlayerState.decode(message);

    for (var clientId in decodedMessage.playerPositions.keys) {
      GameState.instance.playerState.lives[clientId] =
          decodedMessage.lives[clientId];
      GameState.instance.playerState.scores[clientId] =
          decodedMessage.scores[clientId];

      if (clientId != GameState.instance.session.clientId) {
        var oppPos = decodedMessage.playerPositions[clientId];
        if (oppPos.x > 70 && oppPos.x < 1145) {
          GameState.instance.playerState.playerPositions[clientId] = GameState
              .instance.playerState.playerPositions[clientId]
              .interpolated(oppPos);
        } else {
          GameState.instance.playerState.playerPositions[clientId] = oppPos;
        }
      }
    }

    GameState.instance.scorePointPositions = decodedMessage.scorePositions;
  }
}
