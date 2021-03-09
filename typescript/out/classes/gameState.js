"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pactheman_models_1 = require("../models/pactheman.models");
const strongly_typed_events_1 = require("strongly-typed-events");
const async_completer_1 = __importDefault(require("async-completer"));
class GameState {
    constructor() {
        this.strikeCount = 0;
        this.gameOver = false;
        this.resetCounter = 0;
        // init future
        this.initWaitFuture = null;
        this.initCompleter = null;
        // events
        this._onReset = new strongly_typed_events_1.SimpleEventDispatcher();
        this._onExit = new strongly_typed_events_1.SimpleEventDispatcher();
        this._onReward = new strongly_typed_events_1.SimpleEventDispatcher();
        this._onNewLevel = new strongly_typed_events_1.SimpleEventDispatcher();
        this._onNewGame = new strongly_typed_events_1.SimpleEventDispatcher();
        this._onGameOver = new strongly_typed_events_1.SimpleEventDispatcher();
        this.session = {};
        this.gainedRewardAndNewState = {};
        this.ghostPositions = new Map();
        this.playerState = {
            session: this.session,
            scorePositions: [],
            scores: new Map(),
            lives: new Map(),
            playerPositions: new Map(),
            direction: pactheman_models_1.MovingState.Up
        };
    }
    get scorePointPositions() {
        return this.playerState.scorePositions;
    }
    set scorePointPositions(val) {
        this.playerState.scorePositions = val;
    }
    static get Instance() {
        if (GameState._instance === undefined) {
            GameState._instance = new GameState();
        }
        return GameState._instance;
    }
    waitInitFuture() {
        this.initCompleter = new async_completer_1.default();
        this.initWaitFuture = this.initCompleter.promise;
        return this.initWaitFuture;
    }
    completeInitFuture() {
        this.initCompleter?.complete();
        this.initWaitFuture = null;
    }
    get onReset() {
        return this._onReset.asEvent();
    }
    signalReset(msg) {
        this._onReset.dispatch(msg);
    }
    get onExit() {
        return this._onExit.asEvent();
    }
    signalExit(msg) {
        this._onExit.dispatch(msg);
    }
    get onReward() {
        return this._onReward.asEvent();
    }
    signalReward(msg) {
        this._onReward.dispatch(msg);
    }
    get onNewLevel() {
        return this._onNewLevel.asEvent();
    }
    signalNewLevel(msg) {
        this._onNewLevel.dispatch(msg);
    }
    get onNewGame() {
        return this._onNewGame.asEvent();
    }
    signalNewGame(msg) {
        GameState.Instance.strikeCount = 0;
        this._onNewGame.dispatch(msg);
    }
    get onGameOver() {
        return this._onGameOver.asEvent();
    }
    signalGameOver(msg) {
        this._onGameOver.dispatch(msg);
    }
    get sendablePlayerState() {
        var res = this.playerState;
        res.session = this.session;
        return res;
    }
    setResetCount() {
        this.resetCounter = 4;
    }
    setGameOver() {
        this.gameOver = true;
    }
}
exports.default = GameState;
