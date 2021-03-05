import 'package:lean_dart_client/classes/game_state.dart';
import 'package:lean_dart_client/classes/player.dart';
import 'bebop_handler.dart';
import 'package:lean_dart_client/schemas.g.dart';

class InitStateMsgHandler extends BebopHandler {
  @override
  void handleMessage(sender, message) {
    var player = sender as Player;
    var decodedMessage = InitState.decode(message);

    for (var pos in decodedMessage.playerInitPositions.entries) {
      GameState.instance.playerState.playerPositions
          .update(pos.key, (value) => pos.value, ifAbsent: () => pos.value);
    }

    for (var lives in decodedMessage.playerInitLives.entries) {
      GameState.instance.playerState.lives.update(
          lives.key, (value) => lives.value,
          ifAbsent: () => lives.value);
    }

    for (var score in decodedMessage.playerInitLives.entries) {
      GameState.instance.playerState.scores.update(
          score.key, (value) => score.value,
          ifAbsent: () => score.value);
    }

    for (var ghost in decodedMessage.ghostInitPositions.entries) {
      GameState.instance.ghostPositions.update(
          ghost.key, (value) => ghost.value,
          ifAbsent: () => ghost.value);
    }

    player.position = player.startPosition =
        decodedMessage.playerInitPositions[GameState.instance.session.clientId];

    GameState.instance.scorePointPositions =
        decodedMessage.scorePointInitPositions;

    GameState.instance.completeInitFuture();
  }
}
