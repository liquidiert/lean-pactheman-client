import 'package:lean_dart_client/schemas.g.dart';
import 'dart:math' as math;

class Velocity {
  double x;
  double y;

  Velocity() {
    x = 0;
    y = 0;
  }

  Velocity.fromXY(double newX, double newY) {
    x = newX;
    y = newY;
  }

  Velocity.single(double single) {
    x = single;
    y = single;
  }

  Velocity.fromPosition(Position position) {
    x = position.x;
    y = position.y;
  }

  Velocity copy() {
    return Velocity.fromXY(x, y);
  }

  MovingState toMovingState() {
    if (this == Velocity.fromXY(-1, 0)) {
      return MovingState.Left;
    } else if (this == Velocity.fromXY(1, 0)) {
      return MovingState.Right;
    } else if (this == Velocity.fromXY(0, -1)) {
      return MovingState.Up;
    } else if (this == Velocity.fromXY(0, 1)) {
      return MovingState.Down;
    } else {
      return MovingState.Up;
    }
  }

  Position toPosition() {
    return Position(x: x, y: y);
  }

  Velocity round() {
    x = x.roundToDouble();
    y = y.roundToDouble();
    return this;
  }

  Velocity normalize() {
    return divideBy(math.sqrt(math.pow(x, 2) + math.pow(y, 2)));
  }

  // operators
  Velocity operator +(Velocity other) {
    x += other.x;
    y += other.y;
    return this;
  }

  Velocity operator -(Velocity other) {
    x -= other.x;
    y -= other.y;
    return this;
  }

  Velocity operator *(Velocity other) {
    x *= other.x;
    y *= other.y;
    return this;
  }

  Velocity operator /(Velocity other) {
    x /= other.x;
    y /= other.y;
    return this;
  }

  // operator functions
  Velocity addBy(double val) {
    x += val;
    y += val;
    return this;
  }

  Velocity subBy(double val) {
    x -= val;
    y -= val;
    return this;
  }

  Velocity multiplyBy(double val) {
    x *= val;
    y *= val;
    return this;
  }

  Velocity divideBy(double val) {
    x /= val;
    y /= val;
    return this;
  }
}
