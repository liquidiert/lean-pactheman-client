import 'package:lean_dart_client/schemas.g.dart';

extension GameOverMsgExtension on GameOverMsg {
  String toHumanReadable() {
    if (reason == GameOverReason.ExceededGameCount) {
      return 'maximum number of Games has been played';
    } else if (reason == GameOverReason.ExceededStrikes) {
      return '$playerId has exceeded the maximum strike count';
    } else if (reason == GameOverReason.ExceededLevelCount) {
      return 'maximum number of levels has been played';
    } else {
      return 'Unknown GameOver cause';
    }
  }
}
