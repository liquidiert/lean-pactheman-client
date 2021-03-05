import 'package:lean_dart_client/classes/game_state.dart';

import 'bebop_handler.dart';
import 'package:lean_dart_client/schemas.g.dart';

class SessionMsgHandler extends BebopHandler {
  @override
  void handleMessage(sender, message) {
    message = SessionMsg.decode(message);
    GameState.instance.session = message;
    print(message.clientId);
    print(message.sessionId);
  }
}
