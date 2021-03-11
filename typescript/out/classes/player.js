"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerInfo = void 0;
const pactheman_models_1 = require("../models/pactheman.models");
const moveAdapter_1 = __importDefault(require("../moveAdapter"));
const ws_1 = __importDefault(require("ws"));
const gameState_1 = __importDefault(require("./gameState"));
const bebopDispatcher_1 = __importDefault(require("./bebopDispatcher"));
const velocity_1 = __importDefault(require("./velocity"));
const __1 = require("..");
const positionExtensions_1 = __importDefault(require("../utils/extensions/positionExtensions"));
const mapReader_1 = __importDefault(require("../utils/mapReader"));
const lodash_1 = require("lodash");
class PlayerInfo {
    constructor(part = {}) {
        this.session = null;
        this.movementSpeed = 0.0;
        this.startPosition = null;
        this.position = null;
        Object.assign(this, part);
    }
    get downscaledPosition() {
        return new positionExtensions_1.default(Math.floor(this.position?.x ?? 0 / 64), Math.floor(this.position?.y ?? 0 / 64));
    }
}
exports.PlayerInfo = PlayerInfo;
class Player {
    constructor(name) {
        this._socket = null;
        this._moveAdapter = null;
        this._connected = false;
        this.movementSpeed = 1350.0; // 350
        this.startPosition = null;
        this.name = name;
        this._moveAdapter = new moveAdapter_1.default();
        gameState_1.default.Instance.onReset.subscribe((resetMsg) => {
            this.position = this.startPosition ?? new positionExtensions_1.default(0, 0);
        });
        gameState_1.default.Instance.onNewLevel.subscribe(() => {
            this.position = this.startPosition ?? new positionExtensions_1.default(0, 0);
        });
        gameState_1.default.Instance.onNewGame.subscribe((newGameMsg) => {
            this.startPosition = this.position = positionExtensions_1.default.fromPosition(newGameMsg.resetMsg?.playerResetPoints.get(gameState_1.default.Instance.session.clientId ?? "") ?? { x: 0, y: 0 });
        });
    }
    get position() {
        return positionExtensions_1.default.fromPosition(gameState_1.default.Instance.playerState.playerPositions
            .get(gameState_1.default.Instance.session.clientId ?? "") ?? { x: 0, y: 0 });
    }
    set position(pos) {
        gameState_1.default.Instance.playerState.playerPositions.set(gameState_1.default.Instance.session.clientId ?? "", pos.toIPosition());
    }
    updatePosition({ x = 0, xFactor = 1, y = 0, yFactor = 1 }) {
        return new positionExtensions_1.default((this.position.x + x) * xFactor, (this.position.y + y) * yFactor);
    }
    async connect(address, port) {
        if (this._connected)
            return;
        this._socket = new ws_1.default(`ws://${address}:${port}`);
        this._socket.on("message", (incomingData) => this.listen(incomingData, this));
        this._socket.on("close", (_, reason) => { console.log(`websocket was closed due to: ${reason}`); });
        this._connected = true;
        return new Promise(resolve => this._socket?.on("open", resolve));
    }
    disconnect() {
        if (!this._connected)
            return;
        this._socket?.close();
        this._connected = false;
    }
    listen(data, sender) {
        let netMessage = pactheman_models_1.NetworkMessage.decode(data);
        bebopDispatcher_1.default.Instance.dispatch(netMessage.incomingOpCode ?? 0, netMessage.incomingRecord ?? new Uint8Array(), { sender: sender });
    }
    host(levelCount, gameCount) {
        let joinMsg = pactheman_models_1.JoinMsg.encode({
            playerName: this.name,
            levelCount: levelCount,
            gameCount: gameCount
        });
        this.send(pactheman_models_1.JoinMsg.opcode, joinMsg);
    }
    join() {
        let joinMsg = pactheman_models_1.JoinMsg.encode({
            playerName: this.name,
            session: gameState_1.default.Instance.session
        });
        this.send(pactheman_models_1.JoinMsg.opcode, joinMsg);
    }
    setReady() {
        let rdyMsg = pactheman_models_1.ReadyMsg.encode({
            session: gameState_1.default.Instance.session,
            ready: true
        });
        this.send(pactheman_models_1.ReadyMsg.opcode, rdyMsg);
    }
    updateState(update) {
        update.normalize();
        gameState_1.default.Instance.playerState.direction = update.toMovingState();
        var updatedPosition = this.position.copy().addOther(update
            .multiplyBy(this.movementSpeed)
            .multiplyBy(__1.Constants.FRAME_DELTA_APPROX)
            .toPosition());
        if (!mapReader_1.default.Instance
            .isValidPosition(updatedPosition.copy().downscaled()))
            return;
        // teleport if entering either left or right gate
        if (updatedPosition.y <= 38 || updatedPosition.x >= 1177) {
            this.position = this.updatePosition({ x: -1215, xFactor: -1 });
        }
        else {
            this.position = updatedPosition;
        }
    }
    sendState() {
        this.send(pactheman_models_1.PlayerState.opcode, pactheman_models_1.PlayerState.encode(gameState_1.default.Instance.sendablePlayerState));
    }
    move() {
        let updateVelocity;
        let move = { sendMove: false, updateVelocity: velocity_1.default.Zero };
        try {
            move = this._moveAdapter?.getMove(new PlayerInfo(this)) ?? { sendMove: false, updateVelocity: velocity_1.default.Zero };
        }
        catch (ex) {
            console.error(ex);
        }
        finally {
            updateVelocity = move.updateVelocity.normalize();
        }
        if (!move.sendMove)
            return;
        this.updateState(updateVelocity);
        this.sendState();
    }
    send(opCode, toSend) {
        let netMessage = pactheman_models_1.NetworkMessage.encode({
            incomingOpCode: opCode,
            incomingRecord: lodash_1.cloneDeep(toSend)
        });
        this._socket?.send(netMessage);
    }
}
exports.default = Player;
