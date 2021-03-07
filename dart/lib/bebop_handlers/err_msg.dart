import 'package:lean_dart_client/classes/game_state.dart';
import 'package:lean_dart_client/classes/constants.dart';
import 'bebop_handler.dart';
import 'package:lean_dart_client/schemas.g.dart';

class ErrorMsgHandler extends BebopHandler {
  @override
  void handleMessage(sender, message) {
    message = ErrorMsg.decode(message);
    print('Received ${message.errorMessage} violation. ');
    GameState.instance.strikeCount++;
    print('Watch out this is your ${GameState.instance.strikeCount} strike. ');
    print(
        'Only ${Constants.MAX_STRIKE_COUNT - GameState.instance.strikeCount} strike(s) left.');
  }
}
