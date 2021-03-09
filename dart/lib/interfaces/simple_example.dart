import 'package:lean_dart_client/classes/player.dart';
import 'package:lean_dart_client/classes/velocity.dart';
import 'package:lean_dart_client/move_interface.dart';
import 'package:tuple/tuple.dart';
import 'dart:math';

class SimpleExample extends IMove {
  @override
  Tuple2<bool, Velocity> performMove(PlayerInfo info) {
    var velocities = <Velocity>[
      Velocity.fromXY(-64, 0), // left
      Velocity.fromXY(64, 0), // right
      Velocity.fromXY(0, 64), // up
      Velocity.fromXY(0, -64) // down
    ];
    return Tuple2<bool, Velocity>(
        true, velocities[Random().nextInt(velocities.length - 1)]);
  }
}
