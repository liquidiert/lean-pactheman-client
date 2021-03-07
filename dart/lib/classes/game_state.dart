import 'dart:async';
import 'package:lean_dart_client/schemas.g.dart';

class GameState {
  GameState._privateConstructor() {
    session = SessionMsg();
    ghostPositions = <String, Position>{};
    playerState = PlayerState(
        session: session,
        scorePositions: [],
        scores: {},
        lives: {},
        playerPositions: {},
        direction: null);
  }
  static final GameState instance = GameState._privateConstructor();

  PlayerState playerState;
  Map<String, Position> ghostPositions;
  List<Position> get scorePointPositions => playerState.scorePositions;
  set scorePointPositions(List<Position> positions) =>
      playerState.scorePositions = positions;
  RewardMsg gainedRewardAndNewState;
  SessionMsg session;
  int strikeCount = 0;
  bool gameOver = false;
  double resetCounter = 0;

  Future<Null> initWaitFuture;
  Completer<Null> initCompleter;
  Future waitInitFuture() {
    initCompleter = Completer();
    initWaitFuture = initCompleter.future;
    return initWaitFuture;
  }

  void completeInitFuture() {
    initCompleter.complete();
    initWaitFuture = null;
  }

  // evetn streams

  StreamController<ResetMsg> resetStreamController =
      StreamController<ResetMsg>();
  Stream<ResetMsg> get resetStream => resetStreamController.stream;
  void signalReset(ResetMsg msg) {
    if (!resetStreamController.hasListener) return;
    resetStreamController.add(msg);
  }

  StreamController<ExitMsg> exitStreamController = StreamController<ExitMsg>();
  Stream<ExitMsg> get exitStream => exitStreamController.stream;
  void signalExit(ExitMsg msg) {
    if (!exitStreamController.hasListener) return;
    exitStreamController.add(msg);
  }

  StreamController<bool> rewardStreamController = StreamController<bool>();
  Stream<bool> get rewardAvailableStream => rewardStreamController.stream;
  void signalReward(bool msg) {
    if (!rewardStreamController.hasListener) return;
    rewardStreamController.add(msg);
  }

  StreamController<NewLevelMsg> newLevelStreamController =
      StreamController<NewLevelMsg>();
  Stream<NewLevelMsg> get newLevelStream => newLevelStreamController.stream;
  void signalNewLevel(NewLevelMsg msg) {
    if (!newLevelStreamController.hasListener) return;
    newLevelStreamController.add(msg);
  }

  StreamController<NewGameMsg> newGameStreamController =
      StreamController<NewGameMsg>();
  Stream<NewGameMsg> get newGameStream => newGameStreamController.stream;
  void signalNewGame(NewGameMsg msg) {
    if (!newGameStreamController.hasListener) return;
    newGameStreamController.add(msg);
  }

  StreamController<GameOverMsg> gameOverStreamController =
      StreamController<GameOverMsg>();
  Stream<GameOverMsg> get gameOverStream => gameOverStreamController.stream;
  void signalGameOver(GameOverMsg msg) {
    if (!gameOverStreamController.hasListener) return;
    gameOverStreamController.add(msg);
  }

  PlayerState get sendablePlayerState {
    var res = playerState;
    res.session = session;
    return res;
  }

  void setResetCounter() {
    resetCounter = 4;
  }
}
