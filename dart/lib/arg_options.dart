import 'package:args/args.dart';
import 'dart:io';

void addArgOptions(ArgParser parser) {
  parser.addFlag('host',
      negatable: false,
      help:
          'Decide wheter to host or join a session; if not given client asks for session to join');
  parser.addFlag('log',
      negatable: false, help: 'Wheter the lean client should log game data');
  parser.addOption('game-count',
      help:
          'How many games should be played (game ends after all lives lost or all levels played)',
      defaultsTo: '1',
      callback: (ng) => int.tryParse(ng));
  parser.addOption('level-count',
      help: 'How many levels should be played',
      defaultsTo: '5',
      callback: (nl) => int.tryParse(nl));
  parser.addOption('playername',
      help: 'The name with which you will participate at a pactheman game');
  parser.addOption('port',
      help: 'Port to use',
      defaultsTo: '5387',
      callback: (port) => int.tryParse(port));
  parser.addOption('ip',
      help: 'Ip address to use',
      defaultsTo: '127.0.0.1',
      callback: (ip) => InternetAddress(ip));
}
