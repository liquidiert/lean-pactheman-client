import 'bebop_handler.dart';
import 'package:lean_dart_client/classes/player.dart';
import 'package:lean_dart_client/schemas.g.dart';

class PlayerJoinedMsgHandler extends BebopHandler {
  static String opponentName;
  @override
  void handleMessage(sender, message) {
    message = PlayerJoinedMsg.decode(message);
    print('${message.playerName} joined');
    PlayerJoinedMsgHandler.opponentName = message.playerName;
    (sender as Player).setReady();
  }
}
