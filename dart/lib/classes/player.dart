import 'package:lean_dart_client/classes/bebop_dispatcher.dart';
import 'package:lean_dart_client/classes/constants.dart';
import 'package:lean_dart_client/classes/velocity.dart';
import 'package:lean_dart_client/extensions/position.dart';
import 'package:lean_dart_client/move_adapter.dart';
import 'package:lean_dart_client/schemas.g.dart';
import 'package:lean_dart_client/classes/game_state.dart';
import 'package:web_socket_channel/io.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'dart:typed_data';
import 'package:tuple/tuple.dart';
import 'package:lean_dart_client/utils/map_reader.dart';

class PlayerInfo {
  SessionMsg session;
  double movementSpeed;
  Position startPosition;
  Position position;
  Position get downscaledPosition => Position(
      x: (position.x / 64).floor() as double,
      y: (position.y / 64).floor() as double);

  PlayerInfo(Player player) {
    session = GameState.instance.session;
    movementSpeed = player.movementSpeed;
    startPosition = player.startPosition;
    position = player.position;
  }
}

class Player {
  WebSocketChannel _websocketChannel;
  MoveAdapter _moveAdapter;
  bool _connected = false;
  String name;

  final double movementSpeed = 350;
  Position startPosition;

  Position get position => GameState.instance.playerState
      .playerPositions[GameState.instance.session.clientId];
  set position(Position pos) => GameState.instance.playerState
      .playerPositions[GameState.instance.session.clientId] = pos;

  Position get downscaledPosition => Position(
      x: (position.x / 64).floor() as double,
      y: (position.y / 64).floor() as double);

  Player(String pName) {
    name = pName;
    _moveAdapter = MoveAdapter();
  }

  Position updatePosition(
      {double x = 0, int xFactor = 1, double y = 0, int yFactor = 1}) {
    return Position(
        x: (position.x + x) * xFactor, y: (position.y + y) * yFactor);
  }

  void connect(String address, int port) {
    if (_connected) return;
    _websocketChannel =
        IOWebSocketChannel.connect(Uri.parse('ws://$address:$port'));

    _websocketChannel.stream.listen(listen,
        onDone: () => print('closed websocket connection gracefully'),
        onError: (err) => print('closed websocket channel due to $err'));
  }

  void disconnect() {
    if (!_connected) return;
    _websocketChannel.sink.close();
    _connected = false;
  }

  void listen(dynamic message) {
    var networkMessage = NetworkMessage.decode(message);
    BebopDispatcher.instance.dispatch(
        networkMessage.incomingOpCode, networkMessage.incomingRecord,
        sender: this);
  }

  void host(int levelCount, int gameCount) {
    var joinMsg = JoinMsg();
    joinMsg.playerName = name;
    joinMsg.levelCount = levelCount;
    joinMsg.gameCount = gameCount;

    send(JoinMsg.opcode, JoinMsg.encode(joinMsg));
  }

  void join() {
    var joinMsg = JoinMsg();
    joinMsg.playerName = name;
    joinMsg.session = GameState.instance.session;

    send(JoinMsg.opcode, JoinMsg.encode(joinMsg));
  }

  void setReady() {
    var rdyMsg = ReadyMsg();
    rdyMsg.session = GameState.instance.session;
    rdyMsg.ready = true;

    send(ReadyMsg.opcode, ReadyMsg.encode(rdyMsg));
  }

  void updateState(Velocity update) {
    update.normalize();

    GameState.instance.playerState.direction = update.toMovingState();

    var updatedPosition = position.copy().addOther(update
        .multiplyBy(movementSpeed)
        .multiplyBy(Constants.FRAME_DELTA_APPROX)
        .toPosition());

    if (!MapReader.instance
        .isValidPosition(updatedPosition.copy().downscaled())) return;

    // teleport if entering either left or right gate
    if (updatedPosition.y <= 38 || updatedPosition.x >= 1177) {
      position = updatePosition(x: -1215, xFactor: -1);
    } else {
      position = updatedPosition;
    }
  }

  void sendState() {
    send(PlayerState.opcode,
        PlayerState.encode(GameState.instance.sendablePlayerState));
  }

  void move() {
    Velocity updateVelocity;

    Tuple2<bool, Velocity> move;

    try {
      move = _moveAdapter.getMove(PlayerInfo(this));
    } catch (ex) {
      print(ex);
    } finally {
      updateVelocity = move.item2.normalize();
    }

    if (!move.item1) return;

    updateState(updateVelocity);

    sendState();
  }

  void send(int opcode, Uint8List toSend) {
    var networkMessage = NetworkMessage();
    networkMessage.incomingOpCode = opcode;
    networkMessage.incomingRecord = toSend;

    _websocketChannel.sink.add(NetworkMessage.encode(networkMessage));
  }
}
