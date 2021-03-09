import 'dart:typed_data';
import 'package:meta/meta.dart';
import 'package:bebop_dart/bebop_dart.dart';

class SessionMsg {
  String sessionId;
  String clientId;
  SessionMsg();

  static const int opcode = 0x2;

  static Uint8List encode(SessionMsg message) {
    final writer = BebopWriter();
    SessionMsg.encodeInto(message, writer);
    return writer.toList();
  }

  static void encodeInto(SessionMsg message, BebopWriter view) {
    final pos = view.reserveMessageLength();
    final start = view.length;
    if (message.sessionId != null) {
      view.writeByte(1);
      view.writeString(message.sessionId);
    }
    if (message.clientId != null) {
      view.writeByte(2);
      view.writeGuid(message.clientId);
    }
    view.writeByte(0);
    final end = view.length;
    view.fillMessageLength(pos, end - start);
  }

  static SessionMsg decode(Uint8List buffer) => SessionMsg.readFrom(BebopReader(buffer));

  static SessionMsg readFrom(BebopReader view) {
    var message = SessionMsg();
    final length = view.readMessageLength();
    final end = view.index + length;
    while (true) {
      switch (view.readByte()) {
        case 0:
          return message;
        case 1:
          message.sessionId = view.readString();
          break;
        case 2:
          message.clientId = view.readGuid();
          break;
        default:
          view.index = end;
          return message;
      }
    }
  }
}

class NetworkMessage {
  int incomingOpCode;
  Uint8List incomingRecord;
  NetworkMessage();

  static Uint8List encode(NetworkMessage message) {
    final writer = BebopWriter();
    NetworkMessage.encodeInto(message, writer);
    return writer.toList();
  }

  static void encodeInto(NetworkMessage message, BebopWriter view) {
    final pos = view.reserveMessageLength();
    final start = view.length;
    if (message.incomingOpCode != null) {
      view.writeByte(1);
      view.writeUint32(message.incomingOpCode);
    }
    if (message.incomingRecord != null) {
      view.writeByte(2);
      view.writeBytes(message.incomingRecord);
    }
    view.writeByte(0);
    final end = view.length;
    view.fillMessageLength(pos, end - start);
  }

  static NetworkMessage decode(Uint8List buffer) => NetworkMessage.readFrom(BebopReader(buffer));

  static NetworkMessage readFrom(BebopReader view) {
    var message = NetworkMessage();
    final length = view.readMessageLength();
    final end = view.index + length;
    while (true) {
      switch (view.readByte()) {
        case 0:
          return message;
        case 1:
          message.incomingOpCode = view.readUint32();
          break;
        case 2:
          message.incomingRecord = view.readBytes();
          break;
        default:
          view.index = end;
          return message;
      }
    }
  }
}

class GhostAlgorithms {
  String blinky;
  String clyde;
  String inky;
  String pinky;
  GhostAlgorithms({
    @required this.blinky,
    @required this.clyde,
    @required this.inky,
    @required this.pinky,
  });

  static Uint8List encode(GhostAlgorithms message) {
    final writer = BebopWriter();
    GhostAlgorithms.encodeInto(message, writer);
    return writer.toList();
  }

  static void encodeInto(GhostAlgorithms message, BebopWriter view) {
    view.writeString(message.blinky);
    view.writeString(message.clyde);
    view.writeString(message.inky);
    view.writeString(message.pinky);
  }

  static GhostAlgorithms decode(Uint8List buffer) => GhostAlgorithms.readFrom(BebopReader(buffer));

  static GhostAlgorithms readFrom(BebopReader view) {
    String field0;
    field0 = view.readString();
    String field1;
    field1 = view.readString();
    String field2;
    field2 = view.readString();
    String field3;
    field3 = view.readString();
    return GhostAlgorithms(blinky: field0, clyde: field1, inky: field2, pinky: field3);
  }
}

class PlayerState {
  SessionMsg session;
  MovingState direction;
  Map<String, int> scores;
  Map<String, int> lives;
  Map<String, Position> playerPositions;
  List<Position> scorePositions;
  PlayerState({
    @required this.session,
    @required this.direction,
    @required this.scores,
    @required this.lives,
    @required this.playerPositions,
    @required this.scorePositions,
  });

  static const int opcode = 0x5;

  static Uint8List encode(PlayerState message) {
    final writer = BebopWriter();
    PlayerState.encodeInto(message, writer);
    return writer.toList();
  }

  static void encodeInto(PlayerState message, BebopWriter view) {
    SessionMsg.encodeInto(message.session, view);
    view.writeEnum(message.direction);
    view.writeUint32(message.scores.length);
    for (final e0 in message.scores.entries) {
      view.writeGuid(e0.key);
      view.writeInt64(e0.value);
    }
    view.writeUint32(message.lives.length);
    for (final e0 in message.lives.entries) {
      view.writeGuid(e0.key);
      view.writeInt64(e0.value);
    }
    view.writeUint32(message.playerPositions.length);
    for (final e0 in message.playerPositions.entries) {
      view.writeGuid(e0.key);
      Position.encodeInto(e0.value, view);
    }
    {
      final length0 = message.scorePositions.length;
      view.writeUint32(length0);
      for (var i0 = 0; i0 < length0; i0++) {
        Position.encodeInto(message.scorePositions[i0], view);
      }
    }
  }

  static PlayerState decode(Uint8List buffer) => PlayerState.readFrom(BebopReader(buffer));

  static PlayerState readFrom(BebopReader view) {
    SessionMsg field0;
    field0 = SessionMsg.readFrom(view);
    MovingState field1;
    field1 = MovingState.fromRawValue(view.readUint32());
    Map<String, int> field2;
    {
      var length0 = view.readUint32();
      field2 = Map<String, int>();
      for (var i0 = 0; i0 < length0; i0++) {
        String k0;
        int v0;
        k0 = view.readGuid();
        v0 = view.readInt64();
        field2[k0] = v0;
      }
    }
    Map<String, int> field3;
    {
      var length0 = view.readUint32();
      field3 = Map<String, int>();
      for (var i0 = 0; i0 < length0; i0++) {
        String k0;
        int v0;
        k0 = view.readGuid();
        v0 = view.readInt64();
        field3[k0] = v0;
      }
    }
    Map<String, Position> field4;
    {
      var length0 = view.readUint32();
      field4 = Map<String, Position>();
      for (var i0 = 0; i0 < length0; i0++) {
        String k0;
        Position v0;
        k0 = view.readGuid();
        v0 = Position.readFrom(view);
        field4[k0] = v0;
      }
    }
    List<Position> field5;
    {
      var length0 = view.readUint32();
      field5 = List<Position>(length0);
      for (var i0 = 0; i0 < length0; i0++) {
        Position x0;
        x0 = Position.readFrom(view);
        field5[i0] = x0;
      }
    }
    return PlayerState(session: field0, direction: field1, scores: field2, lives: field3, playerPositions: field4, scorePositions: field5);
  }
}

class InitState {
  Map<String, Position> ghostInitPositions;
  Map<String, Position> playerInitPositions;
  List<Position> scorePointInitPositions;
  Map<String, int> playerInitScores;
  Map<String, int> playerInitLives;
  InitState({
    @required this.ghostInitPositions,
    @required this.playerInitPositions,
    @required this.scorePointInitPositions,
    @required this.playerInitScores,
    @required this.playerInitLives,
  });

  static const int opcode = 0x9;

  static Uint8List encode(InitState message) {
    final writer = BebopWriter();
    InitState.encodeInto(message, writer);
    return writer.toList();
  }

  static void encodeInto(InitState message, BebopWriter view) {
    view.writeUint32(message.ghostInitPositions.length);
    for (final e0 in message.ghostInitPositions.entries) {
      view.writeString(e0.key);
      Position.encodeInto(e0.value, view);
    }
    view.writeUint32(message.playerInitPositions.length);
    for (final e0 in message.playerInitPositions.entries) {
      view.writeGuid(e0.key);
      Position.encodeInto(e0.value, view);
    }
    {
      final length0 = message.scorePointInitPositions.length;
      view.writeUint32(length0);
      for (var i0 = 0; i0 < length0; i0++) {
        Position.encodeInto(message.scorePointInitPositions[i0], view);
      }
    }
    view.writeUint32(message.playerInitScores.length);
    for (final e0 in message.playerInitScores.entries) {
      view.writeGuid(e0.key);
      view.writeInt64(e0.value);
    }
    view.writeUint32(message.playerInitLives.length);
    for (final e0 in message.playerInitLives.entries) {
      view.writeGuid(e0.key);
      view.writeInt64(e0.value);
    }
  }

  static InitState decode(Uint8List buffer) => InitState.readFrom(BebopReader(buffer));

  static InitState readFrom(BebopReader view) {
    Map<String, Position> field0;
    {
      var length0 = view.readUint32();
      field0 = Map<String, Position>();
      for (var i0 = 0; i0 < length0; i0++) {
        String k0;
        Position v0;
        k0 = view.readString();
        v0 = Position.readFrom(view);
        field0[k0] = v0;
      }
    }
    Map<String, Position> field1;
    {
      var length0 = view.readUint32();
      field1 = Map<String, Position>();
      for (var i0 = 0; i0 < length0; i0++) {
        String k0;
        Position v0;
        k0 = view.readGuid();
        v0 = Position.readFrom(view);
        field1[k0] = v0;
      }
    }
    List<Position> field2;
    {
      var length0 = view.readUint32();
      field2 = List<Position>(length0);
      for (var i0 = 0; i0 < length0; i0++) {
        Position x0;
        x0 = Position.readFrom(view);
        field2[i0] = x0;
      }
    }
    Map<String, int> field3;
    {
      var length0 = view.readUint32();
      field3 = Map<String, int>();
      for (var i0 = 0; i0 < length0; i0++) {
        String k0;
        int v0;
        k0 = view.readGuid();
        v0 = view.readInt64();
        field3[k0] = v0;
      }
    }
    Map<String, int> field4;
    {
      var length0 = view.readUint32();
      field4 = Map<String, int>();
      for (var i0 = 0; i0 < length0; i0++) {
        String k0;
        int v0;
        k0 = view.readGuid();
        v0 = view.readInt64();
        field4[k0] = v0;
      }
    }
    return InitState(ghostInitPositions: field0, playerInitPositions: field1, scorePointInitPositions: field2, playerInitScores: field3, playerInitLives: field4);
  }
}

class ModelSave {
  List<TensorSave> tensors;
  ModelSave({
    @required this.tensors,
  });

  static Uint8List encode(ModelSave message) {
    final writer = BebopWriter();
    ModelSave.encodeInto(message, writer);
    return writer.toList();
  }

  static void encodeInto(ModelSave message, BebopWriter view) {
    {
      final length0 = message.tensors.length;
      view.writeUint32(length0);
      for (var i0 = 0; i0 < length0; i0++) {
        TensorSave.encodeInto(message.tensors[i0], view);
      }
    }
  }

  static ModelSave decode(Uint8List buffer) => ModelSave.readFrom(BebopReader(buffer));

  static ModelSave readFrom(BebopReader view) {
    List<TensorSave> field0;
    {
      var length0 = view.readUint32();
      field0 = List<TensorSave>(length0);
      for (var i0 = 0; i0 < length0; i0++) {
        TensorSave x0;
        x0 = TensorSave.readFrom(view);
        field0[i0] = x0;
      }
    }
    return ModelSave(tensors: field0);
  }
}

class LevelData {
  List<TimeStepData> timeSteps;
  String winner;
  LevelData({
    @required this.timeSteps,
    @required this.winner,
  });

  static Uint8List encode(LevelData message) {
    final writer = BebopWriter();
    LevelData.encodeInto(message, writer);
    return writer.toList();
  }

  static void encodeInto(LevelData message, BebopWriter view) {
    {
      final length0 = message.timeSteps.length;
      view.writeUint32(length0);
      for (var i0 = 0; i0 < length0; i0++) {
        TimeStepData.encodeInto(message.timeSteps[i0], view);
      }
    }
    view.writeString(message.winner);
  }

  static LevelData decode(Uint8List buffer) => LevelData.readFrom(BebopReader(buffer));

  static LevelData readFrom(BebopReader view) {
    List<TimeStepData> field0;
    {
      var length0 = view.readUint32();
      field0 = List<TimeStepData>(length0);
      for (var i0 = 0; i0 < length0; i0++) {
        TimeStepData x0;
        x0 = TimeStepData.readFrom(view);
        field0[i0] = x0;
      }
    }
    String field1;
    field1 = view.readString();
    return LevelData(timeSteps: field0, winner: field1);
  }
}

class TimeStepData {
  double timestamp;
  PlayerState playerState;
  Map<String, Position> ghostPositions;
  TimeStepData();

  static Uint8List encode(TimeStepData message) {
    final writer = BebopWriter();
    TimeStepData.encodeInto(message, writer);
    return writer.toList();
  }

  static void encodeInto(TimeStepData message, BebopWriter view) {
    final pos = view.reserveMessageLength();
    final start = view.length;
    if (message.timestamp != null) {
      view.writeByte(1);
      view.writeFloat64(message.timestamp);
    }
    if (message.playerState != null) {
      view.writeByte(2);
      PlayerState.encodeInto(message.playerState, view);
    }
    if (message.ghostPositions != null) {
      view.writeByte(3);
      view.writeUint32(message.ghostPositions.length);
    for (final e0 in message.ghostPositions.entries) {
      view.writeString(e0.key);
      Position.encodeInto(e0.value, view);
    }
    }
    view.writeByte(0);
    final end = view.length;
    view.fillMessageLength(pos, end - start);
  }

  static TimeStepData decode(Uint8List buffer) => TimeStepData.readFrom(BebopReader(buffer));

  static TimeStepData readFrom(BebopReader view) {
    var message = TimeStepData();
    final length = view.readMessageLength();
    final end = view.index + length;
    while (true) {
      switch (view.readByte()) {
        case 0:
          return message;
        case 1:
          message.timestamp = view.readFloat64();
          break;
        case 2:
          message.playerState = PlayerState.readFrom(view);
          break;
        case 3:
          {
        var length0 = view.readUint32();
        message.ghostPositions = Map<String, Position>();
        for (var i0 = 0; i0 < length0; i0++) {
          String k0;
          Position v0;
          k0 = view.readString();
          v0 = Position.readFrom(view);
          message.ghostPositions[k0] = v0;
        }
      }
          break;
        default:
          view.index = end;
          return message;
      }
    }
  }
}

class TensorSave {
  String name;
  List<double> values;
  List<int> shape;
  TensorSave({
    @required this.name,
    @required this.values,
    @required this.shape,
  });

  static Uint8List encode(TensorSave message) {
    final writer = BebopWriter();
    TensorSave.encodeInto(message, writer);
    return writer.toList();
  }

  static void encodeInto(TensorSave message, BebopWriter view) {
    view.writeString(message.name);
    {
      final length0 = message.values.length;
      view.writeUint32(length0);
      for (var i0 = 0; i0 < length0; i0++) {
        view.writeFloat32(message.values[i0]);
      }
    }
    {
      final length0 = message.shape.length;
      view.writeUint32(length0);
      for (var i0 = 0; i0 < length0; i0++) {
        view.writeInt32(message.shape[i0]);
      }
    }
  }

  static TensorSave decode(Uint8List buffer) => TensorSave.readFrom(BebopReader(buffer));

  static TensorSave readFrom(BebopReader view) {
    String field0;
    field0 = view.readString();
    List<double> field1;
    {
      var length0 = view.readUint32();
      field1 = List<double>(length0);
      for (var i0 = 0; i0 < length0; i0++) {
        double x0;
        x0 = view.readFloat32();
        field1[i0] = x0;
      }
    }
    List<int> field2;
    {
      var length0 = view.readUint32();
      field2 = List<int>(length0);
      for (var i0 = 0; i0 < length0; i0++) {
        int x0;
        x0 = view.readInt32();
        field2[i0] = x0;
      }
    }
    return TensorSave(name: field0, values: field1, shape: field2);
  }
}

class GameData {
  List<LevelData> levelData;
  String myId;
  GameData({
    @required this.levelData,
    @required this.myId,
  });

  static Uint8List encode(GameData message) {
    final writer = BebopWriter();
    GameData.encodeInto(message, writer);
    return writer.toList();
  }

  static void encodeInto(GameData message, BebopWriter view) {
    {
      final length0 = message.levelData.length;
      view.writeUint32(length0);
      for (var i0 = 0; i0 < length0; i0++) {
        LevelData.encodeInto(message.levelData[i0], view);
      }
    }
    view.writeGuid(message.myId);
  }

  static GameData decode(Uint8List buffer) => GameData.readFrom(BebopReader(buffer));

  static GameData readFrom(BebopReader view) {
    List<LevelData> field0;
    {
      var length0 = view.readUint32();
      field0 = List<LevelData>(length0);
      for (var i0 = 0; i0 < length0; i0++) {
        LevelData x0;
        x0 = LevelData.readFrom(view);
        field0[i0] = x0;
      }
    }
    String field1;
    field1 = view.readGuid();
    return GameData(levelData: field0, myId: field1);
  }
}

class NewLevelMsg {
  int levelCount;
  NewLevelMsg({
    @required this.levelCount,
  });

  static const int opcode = 0x13;

  static Uint8List encode(NewLevelMsg message) {
    final writer = BebopWriter();
    NewLevelMsg.encodeInto(message, writer);
    return writer.toList();
  }

  static void encodeInto(NewLevelMsg message, BebopWriter view) {
    view.writeInt32(message.levelCount);
  }

  static NewLevelMsg decode(Uint8List buffer) => NewLevelMsg.readFrom(BebopReader(buffer));

  static NewLevelMsg readFrom(BebopReader view) {
    int field0;
    field0 = view.readInt32();
    return NewLevelMsg(levelCount: field0);
  }
}

class ResetMsg {
  Map<String, Position> ghostResetPoints;
  Map<String, Position> playerResetPoints;
  Map<String, int> playerLives;
  ResetMsg({
    @required this.ghostResetPoints,
    @required this.playerResetPoints,
    @required this.playerLives,
  });

  static const int opcode = 0x10;

  static Uint8List encode(ResetMsg message) {
    final writer = BebopWriter();
    ResetMsg.encodeInto(message, writer);
    return writer.toList();
  }

  static void encodeInto(ResetMsg message, BebopWriter view) {
    view.writeUint32(message.ghostResetPoints.length);
    for (final e0 in message.ghostResetPoints.entries) {
      view.writeString(e0.key);
      Position.encodeInto(e0.value, view);
    }
    view.writeUint32(message.playerResetPoints.length);
    for (final e0 in message.playerResetPoints.entries) {
      view.writeGuid(e0.key);
      Position.encodeInto(e0.value, view);
    }
    view.writeUint32(message.playerLives.length);
    for (final e0 in message.playerLives.entries) {
      view.writeGuid(e0.key);
      view.writeInt64(e0.value);
    }
  }

  static ResetMsg decode(Uint8List buffer) => ResetMsg.readFrom(BebopReader(buffer));

  static ResetMsg readFrom(BebopReader view) {
    Map<String, Position> field0;
    {
      var length0 = view.readUint32();
      field0 = Map<String, Position>();
      for (var i0 = 0; i0 < length0; i0++) {
        String k0;
        Position v0;
        k0 = view.readString();
        v0 = Position.readFrom(view);
        field0[k0] = v0;
      }
    }
    Map<String, Position> field1;
    {
      var length0 = view.readUint32();
      field1 = Map<String, Position>();
      for (var i0 = 0; i0 < length0; i0++) {
        String k0;
        Position v0;
        k0 = view.readGuid();
        v0 = Position.readFrom(view);
        field1[k0] = v0;
      }
    }
    Map<String, int> field2;
    {
      var length0 = view.readUint32();
      field2 = Map<String, int>();
      for (var i0 = 0; i0 < length0; i0++) {
        String k0;
        int v0;
        k0 = view.readGuid();
        v0 = view.readInt64();
        field2[k0] = v0;
      }
    }
    return ResetMsg(ghostResetPoints: field0, playerResetPoints: field1, playerLives: field2);
  }
}

class GhostMoveMsg {
  Map<String, Position> ghostPositions;
  GhostMoveMsg({
    @required this.ghostPositions,
  });

  static const int opcode = 0x6;

  static Uint8List encode(GhostMoveMsg message) {
    final writer = BebopWriter();
    GhostMoveMsg.encodeInto(message, writer);
    return writer.toList();
  }

  static void encodeInto(GhostMoveMsg message, BebopWriter view) {
    view.writeUint32(message.ghostPositions.length);
    for (final e0 in message.ghostPositions.entries) {
      view.writeString(e0.key);
      Position.encodeInto(e0.value, view);
    }
  }

  static GhostMoveMsg decode(Uint8List buffer) => GhostMoveMsg.readFrom(BebopReader(buffer));

  static GhostMoveMsg readFrom(BebopReader view) {
    Map<String, Position> field0;
    {
      var length0 = view.readUint32();
      field0 = Map<String, Position>();
      for (var i0 = 0; i0 < length0; i0++) {
        String k0;
        Position v0;
        k0 = view.readString();
        v0 = Position.readFrom(view);
        field0[k0] = v0;
      }
    }
    return GhostMoveMsg(ghostPositions: field0);
  }
}

class GameOverMsg {
  GameOverReason reason;
  String playerId;
  GameOverMsg();

  static const int opcode = 0x12;

  static Uint8List encode(GameOverMsg message) {
    final writer = BebopWriter();
    GameOverMsg.encodeInto(message, writer);
    return writer.toList();
  }

  static void encodeInto(GameOverMsg message, BebopWriter view) {
    final pos = view.reserveMessageLength();
    final start = view.length;
    if (message.reason != null) {
      view.writeByte(1);
      view.writeEnum(message.reason);
    }
    if (message.playerId != null) {
      view.writeByte(2);
      view.writeGuid(message.playerId);
    }
    view.writeByte(0);
    final end = view.length;
    view.fillMessageLength(pos, end - start);
  }

  static GameOverMsg decode(Uint8List buffer) => GameOverMsg.readFrom(BebopReader(buffer));

  static GameOverMsg readFrom(BebopReader view) {
    var message = GameOverMsg();
    final length = view.readMessageLength();
    final end = view.index + length;
    while (true) {
      switch (view.readByte()) {
        case 0:
          return message;
        case 1:
          message.reason = GameOverReason.fromRawValue(view.readUint32());
          break;
        case 2:
          message.playerId = view.readGuid();
          break;
        default:
          view.index = end;
          return message;
      }
    }
  }
}

class JoinMsg {
  SessionMsg session;
  GhostAlgorithms algorithms;
  String playerName;
  int levelCount;
  int gameCount;
  JoinMsg();

  static const int opcode = 0x4;

  static Uint8List encode(JoinMsg message) {
    final writer = BebopWriter();
    JoinMsg.encodeInto(message, writer);
    return writer.toList();
  }

  static void encodeInto(JoinMsg message, BebopWriter view) {
    final pos = view.reserveMessageLength();
    final start = view.length;
    if (message.session != null) {
      view.writeByte(1);
      SessionMsg.encodeInto(message.session, view);
    }
    if (message.algorithms != null) {
      view.writeByte(2);
      GhostAlgorithms.encodeInto(message.algorithms, view);
    }
    if (message.playerName != null) {
      view.writeByte(3);
      view.writeString(message.playerName);
    }
    if (message.levelCount != null) {
      view.writeByte(4);
      view.writeInt32(message.levelCount);
    }
    if (message.gameCount != null) {
      view.writeByte(5);
      view.writeInt32(message.gameCount);
    }
    view.writeByte(0);
    final end = view.length;
    view.fillMessageLength(pos, end - start);
  }

  static JoinMsg decode(Uint8List buffer) => JoinMsg.readFrom(BebopReader(buffer));

  static JoinMsg readFrom(BebopReader view) {
    var message = JoinMsg();
    final length = view.readMessageLength();
    final end = view.index + length;
    while (true) {
      switch (view.readByte()) {
        case 0:
          return message;
        case 1:
          message.session = SessionMsg.readFrom(view);
          break;
        case 2:
          message.algorithms = GhostAlgorithms.readFrom(view);
          break;
        case 3:
          message.playerName = view.readString();
          break;
        case 4:
          message.levelCount = view.readInt32();
          break;
        case 5:
          message.gameCount = view.readInt32();
          break;
        default:
          view.index = end;
          return message;
      }
    }
  }
}

class RewardMsg {
  double reward;
  bool done;
  Position newSelfState;
  Map<String, Position> newGhostState;
  RewardMsg();

  static const int opcode = 0x15;

  static Uint8List encode(RewardMsg message) {
    final writer = BebopWriter();
    RewardMsg.encodeInto(message, writer);
    return writer.toList();
  }

  static void encodeInto(RewardMsg message, BebopWriter view) {
    final pos = view.reserveMessageLength();
    final start = view.length;
    if (message.reward != null) {
      view.writeByte(1);
      view.writeFloat32(message.reward);
    }
    if (message.done != null) {
      view.writeByte(2);
      view.writeBool(message.done);
    }
    if (message.newSelfState != null) {
      view.writeByte(3);
      Position.encodeInto(message.newSelfState, view);
    }
    if (message.newGhostState != null) {
      view.writeByte(4);
      view.writeUint32(message.newGhostState.length);
    for (final e0 in message.newGhostState.entries) {
      view.writeString(e0.key);
      Position.encodeInto(e0.value, view);
    }
    }
    view.writeByte(0);
    final end = view.length;
    view.fillMessageLength(pos, end - start);
  }

  static RewardMsg decode(Uint8List buffer) => RewardMsg.readFrom(BebopReader(buffer));

  static RewardMsg readFrom(BebopReader view) {
    var message = RewardMsg();
    final length = view.readMessageLength();
    final end = view.index + length;
    while (true) {
      switch (view.readByte()) {
        case 0:
          return message;
        case 1:
          message.reward = view.readFloat32();
          break;
        case 2:
          message.done = view.readBool();
          break;
        case 3:
          message.newSelfState = Position.readFrom(view);
          break;
        case 4:
          {
        var length0 = view.readUint32();
        message.newGhostState = Map<String, Position>();
        for (var i0 = 0; i0 < length0; i0++) {
          String k0;
          Position v0;
          k0 = view.readString();
          v0 = Position.readFrom(view);
          message.newGhostState[k0] = v0;
        }
      }
          break;
        default:
          view.index = end;
          return message;
      }
    }
  }
}

class ErrorMsg {
  String errorMessage;
  ErrorMsg({
    @required this.errorMessage,
  });

  static const int opcode = 0x1;

  static Uint8List encode(ErrorMsg message) {
    final writer = BebopWriter();
    ErrorMsg.encodeInto(message, writer);
    return writer.toList();
  }

  static void encodeInto(ErrorMsg message, BebopWriter view) {
    view.writeString(message.errorMessage);
  }

  static ErrorMsg decode(Uint8List buffer) => ErrorMsg.readFrom(BebopReader(buffer));

  static ErrorMsg readFrom(BebopReader view) {
    String field0;
    field0 = view.readString();
    return ErrorMsg(errorMessage: field0);
  }
}

class NewGameMsg {
  ResetMsg resetMsg;
  NewGameMsg();

  static const int opcode = 0x14;

  static Uint8List encode(NewGameMsg message) {
    final writer = BebopWriter();
    NewGameMsg.encodeInto(message, writer);
    return writer.toList();
  }

  static void encodeInto(NewGameMsg message, BebopWriter view) {
    final pos = view.reserveMessageLength();
    final start = view.length;
    if (message.resetMsg != null) {
      view.writeByte(1);
      ResetMsg.encodeInto(message.resetMsg, view);
    }
    view.writeByte(0);
    final end = view.length;
    view.fillMessageLength(pos, end - start);
  }

  static NewGameMsg decode(Uint8List buffer) => NewGameMsg.readFrom(BebopReader(buffer));

  static NewGameMsg readFrom(BebopReader view) {
    var message = NewGameMsg();
    final length = view.readMessageLength();
    final end = view.index + length;
    while (true) {
      switch (view.readByte()) {
        case 0:
          return message;
        case 1:
          message.resetMsg = ResetMsg.readFrom(view);
          break;
        default:
          view.index = end;
          return message;
      }
    }
  }
}

class ExitMsg {
  SessionMsg session;
  ExitMsg({
    @required this.session,
  });

  static const int opcode = 0x3;

  static Uint8List encode(ExitMsg message) {
    final writer = BebopWriter();
    ExitMsg.encodeInto(message, writer);
    return writer.toList();
  }

  static void encodeInto(ExitMsg message, BebopWriter view) {
    SessionMsg.encodeInto(message.session, view);
  }

  static ExitMsg decode(Uint8List buffer) => ExitMsg.readFrom(BebopReader(buffer));

  static ExitMsg readFrom(BebopReader view) {
    SessionMsg field0;
    field0 = SessionMsg.readFrom(view);
    return ExitMsg(session: field0);
  }
}

class ReconnectMsg {
  SessionMsg session;
  ReconnectMsg();

  static const int opcode = 0x11;

  static Uint8List encode(ReconnectMsg message) {
    final writer = BebopWriter();
    ReconnectMsg.encodeInto(message, writer);
    return writer.toList();
  }

  static void encodeInto(ReconnectMsg message, BebopWriter view) {
    final pos = view.reserveMessageLength();
    final start = view.length;
    if (message.session != null) {
      view.writeByte(1);
      SessionMsg.encodeInto(message.session, view);
    }
    view.writeByte(0);
    final end = view.length;
    view.fillMessageLength(pos, end - start);
  }

  static ReconnectMsg decode(Uint8List buffer) => ReconnectMsg.readFrom(BebopReader(buffer));

  static ReconnectMsg readFrom(BebopReader view) {
    var message = ReconnectMsg();
    final length = view.readMessageLength();
    final end = view.index + length;
    while (true) {
      switch (view.readByte()) {
        case 0:
          return message;
        case 1:
          message.session = SessionMsg.readFrom(view);
          break;
        default:
          view.index = end;
          return message;
      }
    }
  }
}

class ReadyMsg {
  SessionMsg session;
  bool ready;
  ReadyMsg();

  static const int opcode = 0x8;

  static Uint8List encode(ReadyMsg message) {
    final writer = BebopWriter();
    ReadyMsg.encodeInto(message, writer);
    return writer.toList();
  }

  static void encodeInto(ReadyMsg message, BebopWriter view) {
    final pos = view.reserveMessageLength();
    final start = view.length;
    if (message.session != null) {
      view.writeByte(1);
      SessionMsg.encodeInto(message.session, view);
    }
    if (message.ready != null) {
      view.writeByte(2);
      view.writeBool(message.ready);
    }
    view.writeByte(0);
    final end = view.length;
    view.fillMessageLength(pos, end - start);
  }

  static ReadyMsg decode(Uint8List buffer) => ReadyMsg.readFrom(BebopReader(buffer));

  static ReadyMsg readFrom(BebopReader view) {
    var message = ReadyMsg();
    final length = view.readMessageLength();
    final end = view.index + length;
    while (true) {
      switch (view.readByte()) {
        case 0:
          return message;
        case 1:
          message.session = SessionMsg.readFrom(view);
          break;
        case 2:
          message.ready = view.readBool();
          break;
        default:
          view.index = end;
          return message;
      }
    }
  }
}

class PlayerJoinedMsg {
  String playerName;
  SessionMsg session;
  PlayerJoinedMsg();

  static const int opcode = 0x7;

  static Uint8List encode(PlayerJoinedMsg message) {
    final writer = BebopWriter();
    PlayerJoinedMsg.encodeInto(message, writer);
    return writer.toList();
  }

  static void encodeInto(PlayerJoinedMsg message, BebopWriter view) {
    final pos = view.reserveMessageLength();
    final start = view.length;
    if (message.playerName != null) {
      view.writeByte(1);
      view.writeString(message.playerName);
    }
    if (message.session != null) {
      view.writeByte(2);
      SessionMsg.encodeInto(message.session, view);
    }
    view.writeByte(0);
    final end = view.length;
    view.fillMessageLength(pos, end - start);
  }

  static PlayerJoinedMsg decode(Uint8List buffer) => PlayerJoinedMsg.readFrom(BebopReader(buffer));

  static PlayerJoinedMsg readFrom(BebopReader view) {
    var message = PlayerJoinedMsg();
    final length = view.readMessageLength();
    final end = view.index + length;
    while (true) {
      switch (view.readByte()) {
        case 0:
          return message;
        case 1:
          message.playerName = view.readString();
          break;
        case 2:
          message.session = SessionMsg.readFrom(view);
          break;
        default:
          view.index = end;
          return message;
      }
    }
  }
}

class GameOverReason {
  final int value;
  const GameOverReason.fromRawValue(this.value);
  @override bool operator ==(o) => o is GameOverReason && o.value == value;
  static const ExceededStrikes = GameOverReason.fromRawValue(0);
  static const ExceededGameCount = GameOverReason.fromRawValue(1);
  static const ExceededLevelCount = GameOverReason.fromRawValue(2);
}
class MovingState {
  final int value;
  const MovingState.fromRawValue(this.value);
  @override bool operator ==(o) => o is MovingState && o.value == value;
  static const Up = MovingState.fromRawValue(0);
  static const Down = MovingState.fromRawValue(1);
  static const Left = MovingState.fromRawValue(2);
  static const Right = MovingState.fromRawValue(3);
}
class Position {
  double x;
  double y;
  Position({
    @required this.x,
    @required this.y,
  });

  static Uint8List encode(Position message) {
    final writer = BebopWriter();
    Position.encodeInto(message, writer);
    return writer.toList();
  }

  static void encodeInto(Position message, BebopWriter view) {
    view.writeFloat32(message.x);
    view.writeFloat32(message.y);
  }

  static Position decode(Uint8List buffer) => Position.readFrom(BebopReader(buffer));

  static Position readFrom(BebopReader view) {
    double field0;
    field0 = view.readFloat32();
    double field1;
    field1 = view.readFloat32();
    return Position(x: field0, y: field1);
  }
}

