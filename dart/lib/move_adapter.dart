import 'package:lean_dart_client/classes/player.dart';
import 'package:lean_dart_client/classes/velocity.dart';
import 'package:lean_dart_client/move_interface.dart';
import 'package:tuple/tuple.dart';
import 'package:lean_dart_client/interfaces/simple_example.dart';

class MoveAdapter {
  IMove moveInstructor;

  MoveAdapter() {
    moveInstructor = SimpleExample();
  }

  Tuple2<bool, Velocity> GetMove(PlayerInfo info) =>
      moveInstructor.performMove(info);
}
