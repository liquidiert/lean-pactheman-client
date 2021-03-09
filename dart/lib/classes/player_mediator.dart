import 'package:lean_dart_client/classes/player.dart';
import 'package:lean_dart_client/classes/velocity.dart';
import 'package:lean_dart_client/classes/game_state.dart';

class PlayerMediator {
  static Player _playerInstance;

  static void setPlayer(Player p) => _playerInstance = p;

  static Future<bool> receivePlayerStateUpdate(Velocity update) async {
    try {
      _playerInstance.updateState(update);
      _playerInstance.sendState();
      return await GameState.instance.rewardAvailableStream.first;
    } catch (ex) {
      print(ex.message);
      return false;
    }
  }
}
