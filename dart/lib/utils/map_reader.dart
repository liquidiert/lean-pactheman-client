import 'dart:io';
import 'package:lean_dart_client/schemas.g.dart';

class MapReader {
  List<List<int>> map;

  static final MapReader instance = MapReader._privateConstructor();

  MapReader._privateConstructor() {
    map = <List<int>>[];
    try {
      var text = File.fromUri(Uri.parse('../map.txt')).readAsLinesSync();
      for (var h = 0; h < text.length; h++) {
        map.add([]);
        for (var w = 0; w < text[h].length; w++) {
          map[h].add(int.parse(text[h][w]));
        }
      }
    } catch (ex) {
      print('Map file could not be found! $ex');
      exit(-1);
    }
  }

  bool isValidPosition(Position position) {
    if (position.x > 19 || position.y > 22) {
      throw ArgumentError('Position must be down scaled $position');
    }
    try {
      return map[position.y.toInt()][position.x.toInt()] == 0;
    } on IndexError {
      return false;
    }
  }
}
