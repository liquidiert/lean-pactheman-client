import { ISessionMsg, NetworkMessage, JoinMsg, ReadyMsg, PlayerState, INewGameMsg } from "../models/pactheman.models";
import MoveAdapter from "../moveAdapter";
import WebSocket from "ws";
import GameState from "./gameState";
import BebopDispatcher from "./bebopDispatcher";
import Velocity from "./velocity";
import { Constants } from "..";
import PositionExtended from "../utils/extensions/positionExtensions";
import MapReader from "../utils/mapReader";
import { MoveResult } from "../iMove";
import { cloneDeep } from "lodash";

export class PlayerInfo {

    session: ISessionMsg | null = null;
    movementSpeed: number = 0.0;
    startPosition: PositionExtended | null = null;
    position: PositionExtended | null = null;

    get downscaledPosition(): PositionExtended {
        return new PositionExtended(Math.floor(this.position?.x ?? 0 / 64),
            Math.floor(this.position?.y ?? 0 / 64));
    }

    constructor(part: Partial<PlayerInfo> = {}) {
        Object.assign(this, part);
    }
}

export default class Player {
    private _socket: WebSocket | null = null;
    private _moveAdapter: MoveAdapter | null = null;
    private _connected: boolean = false;
    name: string;

    movementSpeed: number = 1350.0; // 350
    startPosition: PositionExtended | null = null;

    get position(): PositionExtended {
        return PositionExtended.fromPosition(GameState.Instance.playerState.playerPositions
            .get(GameState.Instance.session.clientId ?? "") ?? { x: 0, y: 0 });
    }

    set position(pos: PositionExtended) {
        GameState.Instance.playerState.playerPositions.set(GameState.Instance.session.clientId ?? "", pos.toIPosition());
    }

    constructor(name: string) {
        this.name = name;
        this._moveAdapter = new MoveAdapter();

        GameState.Instance.onReset.subscribe((resetMsg) => {
            this.position = this.startPosition ?? new PositionExtended(0, 0);
        });
        GameState.Instance.onNewLevel.subscribe(() => {
            this.position = this.startPosition ?? new PositionExtended(0, 0);
        });
        GameState.Instance.onNewGame.subscribe((newGameMsg: INewGameMsg) => {
            this.startPosition = this.position = PositionExtended.fromPosition(newGameMsg.resetMsg?.playerResetPoints.get(GameState.Instance.session.clientId ?? "") ?? { x: 0, y: 0 });
        });
    }

    updatePosition({ x = 0, xFactor = 1, y = 0, yFactor = 1 }: { x?: number, xFactor?: number, y?: number, yFactor?: number }): PositionExtended {
        return new PositionExtended((this.position.x + x) * xFactor, (this.position.y + y) * yFactor);
    }

    async connect(address: string, port: number) {
        if (this._connected) return;
        this._socket = new WebSocket(`ws://${address}:${port}`);

        this._socket.on("message", (incomingData: Buffer) => this.listen(incomingData, this));
        this._socket.on("close", (_:number, reason: string) => { console.log(`websocket was closed due to: ${reason}`); });

        return new Promise(resolve => this._socket?.on("open", resolve));
    }

    disconnect() {
        if (!this._connected) return;
        this._socket?.close();
        this._connected = false;
    }

    listen(data: Buffer, sender: Player): any {
        let netMessage = NetworkMessage.decode(data);
        BebopDispatcher.Instance.dispatch(netMessage.incomingOpCode ?? 0,
            netMessage.incomingRecord ?? new Uint8Array(), { sender: sender });
    }

    host(levelCount: number, gameCount: number) {
        let joinMsg = JoinMsg.encode({
            playerName: this.name,
            levelCount: levelCount,
            gameCount: gameCount
        });

        this.send(JoinMsg.opcode, joinMsg);
    }

    join() {
        let joinMsg = JoinMsg.encode({
            playerName: this.name,
            session: GameState.Instance.session
        });

        this.send(JoinMsg.opcode, joinMsg);
    }

    setReady() {
        let rdyMsg = ReadyMsg.encode({
            session: GameState.Instance.session,
            ready: true
        });

        this.send(ReadyMsg.opcode, rdyMsg);
    }

    updateState(update: Velocity) {
        update.normalize();

        GameState.Instance.playerState.direction = update.toMovingState();

        var updatedPosition = this.position.copy().addOther(update
            .multiplyBy(this.movementSpeed)
            .multiplyBy(Constants.FRAME_DELTA_APPROX)
            .toPosition());

        if (!MapReader.Instance
            .isValidPosition(updatedPosition.copy().downscaled())) return;

        // teleport if entering either left or right gate
        if (updatedPosition.y <= 38 || updatedPosition.x >= 1177) {
            this.position = this.updatePosition({ x: -1215, xFactor: -1 });
        } else {
            this.position = updatedPosition;
        }
    }

    sendState() {
        this.send(PlayerState.opcode,
            PlayerState.encode(GameState.Instance.sendablePlayerState));
    }

    move() {
        let updateVelocity: Velocity;
    
        let move: MoveResult = { sendMove: false, updateVelocity: Velocity.Zero };
    
        try {
          move = this._moveAdapter?.getMove(new PlayerInfo(this)) ?? { sendMove: false, updateVelocity: Velocity.Zero };
        } catch (ex) {
          console.error(ex);
        } finally {
          updateVelocity = move.updateVelocity.normalize();
        }
    
        if (!move.sendMove) return;
    
        this.updateState(updateVelocity);
    
        this.sendState();
      }

    send(opCode: number, toSend: Uint8Array) {
        let netMessage = NetworkMessage.encode({
            incomingOpCode: opCode,
            incomingRecord: cloneDeep(toSend)
        });

        this._socket?.send(netMessage);
    }

}