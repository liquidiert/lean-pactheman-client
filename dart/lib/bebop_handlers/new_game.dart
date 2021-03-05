import 'package:lean_dart_client/classes/game_state.dart';

import 'bebop_handler.dart';
import 'package:lean_dart_client/schemas.g.dart';

class NewGameMsgHandler extends BebopHandler {
  @override
  void handleMessage(sender, message) {
    message = NewGameMsg.decode(message);
    GameState.instance.setResetCounter();
    GameState.instance.signalNewGame(message);
    print('Starting new game');
  }
}
