import 'bebop_handler.dart';
import './player_joined.dart';
import 'package:lean_dart_client/schemas.g.dart';

class ReadyMsgHandler extends BebopHandler {
  @override
  void handleMessage(sender, message) {
    message = ReadyMsg.decode(message);
    print(
        '${PlayerJoinedMsgHandler.opponentName} is ready. Game will start soon.');
  }
}
