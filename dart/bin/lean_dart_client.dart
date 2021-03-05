import 'dart:io';
import 'package:lean_dart_client/arg_options.dart';
import 'package:lean_dart_client/classes/bebop_dispatcher.dart';
import 'package:args/args.dart';
import 'package:lean_dart_client/classes/game_state.dart';
import 'package:lean_dart_client/classes/player.dart';
import 'package:lean_dart_client/classes/player_mediator.dart';
import 'package:lean_dart_client/schemas.g.dart';
import 'package:lean_dart_client/utils/map_reader.dart';

void main(List<String> arguments) async {
  // init bebop handlers
  await BebopDispatcher.instance.initialize();

  var t = MapReader.instance;

  // parse args
  var parser = ArgParser();
  addArgOptions(parser);
  var parseResults = parser.parse(arguments);

  if (parseResults['playername'] == null) {
    print('Playername argument must be given!');
    exit(0);
  }

  var player = Player(parseResults['playername']);

  PlayerMediator.setPlayer(player);
  player.connect(parseResults['ip'], int.parse(parseResults['port']));

  if (!parseResults['host']) {
    print('Enter session id:');
    var sessionId = stdin.readLineSync();
    var session = SessionMsg();
    session.sessionId = sessionId;
    GameState.instance.session = session;
    player.join();
  } else {
    player.host(int.parse(parseResults['level-count']),
        int.parse(parseResults['game-count']));
  }

  await GameState.instance.waitInitFuture();

  while (!GameState.instance.gameOver) {
    await Future.delayed(Duration(milliseconds: 50));
    if (GameState.instance.resetCounter > 0) {
      GameState.instance.resetCounter -= 0.05;
      if (GameState.instance.resetCounter > 0) {
        continue;
      }
    }
    player.move();
  }
}
