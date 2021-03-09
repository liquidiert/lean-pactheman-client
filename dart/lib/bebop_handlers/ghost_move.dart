import 'package:lean_dart_client/classes/game_state.dart';

import 'bebop_handler.dart';
import 'package:lean_dart_client/schemas.g.dart';

class GhostMoveMsgHandler extends BebopHandler {
  @override
  void handleMessage(sender, message) {
    var decodedMessage = GhostMoveMsg.decode(message);
    for (var pos in decodedMessage.ghostPositions.entries) {
      GameState.instance.ghostPositions
          .update(pos.key, (value) => pos.value, ifAbsent: () => pos.value);
    }
  }
}
