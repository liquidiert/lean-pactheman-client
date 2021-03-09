import 'bebop_handler.dart';
import 'package:lean_dart_client/schemas.g.dart';

class ExitMsgHandler extends BebopHandler {
  @override
  void handleMessage(sender, message) {
    message = ExitMsg.decode(message);
    // TODO: implement handleMessage
  }
}
