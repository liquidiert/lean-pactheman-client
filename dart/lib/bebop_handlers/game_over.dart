import 'package:lean_dart_client/classes/game_state.dart';

import 'bebop_handler.dart';
import 'package:lean_dart_client/schemas.g.dart';

class GameOverMsgHandler extends BebopHandler {
  @override
  void handleMessage(sender, message) {
    message = GameOverMsg.decode(message);
    print(
        'Received GameOver because ${message.toHumanReadable()}. Ending lean client now.');
    GameState.instance.signalGameOver(message);
  }
}
