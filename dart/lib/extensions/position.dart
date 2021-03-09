import 'package:lean_dart_client/schemas.g.dart';

extension PositionExtensions on Position {
  Position copy() {
    return Position(x: x, y: y);
  }

  Position addOther(Position other) {
    x += other.x;
    y += other.y;
    return this;
  }

  Position downscaled() {
    return Position(x: (x / 64).floorToDouble(), y: (y / 64).floorToDouble());
  }

  Position interpolated(Position other) {
    return Position(x: (x + other.x) / 2, y: (y + other.y) / 2);
  }
}
