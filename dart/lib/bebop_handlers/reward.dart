import 'package:lean_dart_client/classes/game_state.dart';

import 'bebop_handler.dart';
import 'package:lean_dart_client/schemas.g.dart';

class RewardMsgHandler extends BebopHandler {
  @override
  void handleMessage(sender, message) {
    message = RewardMsg.decode(message);
    GameState.instance.gainedRewardAndNewState = message;
    GameState.instance.signalReward(true);
  }
}
