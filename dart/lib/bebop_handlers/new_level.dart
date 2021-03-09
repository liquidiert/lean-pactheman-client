import 'package:lean_dart_client/classes/game_state.dart';

import 'bebop_handler.dart';
import 'package:lean_dart_client/schemas.g.dart';

class NewLevelMsgHandler extends BebopHandler {
  @override
  void handleMessage(sender, message) {
    message = NewLevelMsg.decode(message);
    GameState.instance.setResetCounter();
    GameState.instance.signalNewLevel(message);
    print('Starting new level');
  }
}
