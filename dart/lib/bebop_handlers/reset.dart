import 'package:lean_dart_client/classes/game_state.dart';

import 'bebop_handler.dart';
import 'package:lean_dart_client/schemas.g.dart';

class ResetMsgHandler extends BebopHandler {
  @override
  void handleMessage(sender, message) {
    message = ResetMsg.decode(message);
    GameState.instance.setResetCounter();
    GameState.instance.signalReset(message);
  }
}
