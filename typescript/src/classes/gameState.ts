import { IExitMsg, IGameOverMsg, INewGameMsg, INewLevelMsg, IPlayerState, IPosition, IResetMsg, IRewardMsg, ISessionMsg, MovingState } from "../models/pactheman.models";
import { SimpleEventDispatcher } from "strongly-typed-events";
import Completer from "async-completer";

export default class GameState {
    private static _instance: GameState;
    playerState: IPlayerState;
    ghostPositions: Map<string, IPosition>;
    gainedRewardAndNewState: IRewardMsg;
    session: ISessionMsg;
    strikeCount: number = 0;
    gameOver: boolean = false;
    resetCounter: number = 0;

    get scorePointPositions(): IPosition[] {
        return this.playerState.scorePositions;
    }

    set scorePointPositions(val: IPosition[]) {
        this.playerState.scorePositions = val;
    }

    private constructor() {
        this.session = {};
        this.gainedRewardAndNewState = {};
        this.ghostPositions = new Map<string, IPosition>();
        this.playerState = {
            session: this.session,
            scorePositions: [],
            scores: new Map<string, bigint>(),
            lives: new Map<string, bigint>(),
            playerPositions: new Map<string, IPosition>(),
            direction: MovingState.Up
        }
    }

    static get Instance(): GameState {
        if (GameState._instance === undefined) {
            GameState._instance = new GameState();
        }
        return GameState._instance;
    }

    // init future
    initWaitFuture: Promise<void> | null = null;
    initCompleter: Completer<void> | null = null;
    waitInitFuture(): Promise<void> {
        this.initCompleter = new Completer();
        this.initWaitFuture = this.initCompleter.promise;
        return this.initWaitFuture;
    }
    completeInitFuture() {
        this.initCompleter?.complete();
        this.initWaitFuture = null;
    }

    // events
    private _onReset = new SimpleEventDispatcher<IResetMsg>();
    get onReset() {
        return this._onReset.asEvent();
    }
    signalReset(msg: IResetMsg) {
        this._onReset.dispatch(msg);
    }

    private _onExit = new SimpleEventDispatcher<IExitMsg>();
    get onExit() {
        return this._onExit.asEvent();
    }
    signalExit(msg: IExitMsg) {
        this._onExit.dispatch(msg);
    }

    private _onReward = new SimpleEventDispatcher<IRewardMsg>();
    get onReward() {
        return this._onReward.asEvent();
    }
    signalReward(msg: IRewardMsg) {
        this._onReward.dispatch(msg);
    }

    private _onNewLevel = new SimpleEventDispatcher<INewLevelMsg>();
    get onNewLevel() {
        return this._onNewLevel.asEvent();
    }
    signalNewLevel(msg: INewLevelMsg) {
        this._onNewLevel.dispatch(msg);
    }

    private _onNewGame = new SimpleEventDispatcher<INewGameMsg>();
    get onNewGame() {
        return this._onNewGame.asEvent();
    }
    signalNewGame(msg: INewGameMsg) {
        this._onNewGame.dispatch(msg);
    }

    private _onGameOver = new SimpleEventDispatcher<IGameOverMsg>();
    get onGameOver() {
        return this._onGameOver.asEvent();
    }
    signalGameOver(msg: IGameOverMsg) {
        this._onGameOver.dispatch(msg);
    }

    get sendablePlayerState(): IPlayerState {
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