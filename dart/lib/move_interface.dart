import 'package:lean_dart_client/classes/player.dart';
import 'package:tuple/tuple.dart';
import 'package:lean_dart_client/classes/velocity.dart';

abstract class IMove {
  Tuple2<bool, Velocity> performMove(PlayerInfo info) {
    performMoveAsync(info);
    return Tuple2<bool, Velocity>(false, Velocity());
  }

  void performMoveAsync(PlayerInfo info) {}
}
