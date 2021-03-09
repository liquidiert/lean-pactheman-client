import { BebopView, BebopRuntimeError } from "bebop";

export interface ISessionMsg {
  sessionId?: string;
  clientId?: string;
}

export const SessionMsg = {
  opcode: 0x2,
  encode(message: ISessionMsg): Uint8Array {
    const view = BebopView.getInstance();
    view.startWriting();
    this.encodeInto(message, view);
    return view.toArray();
  },

  encodeInto(message: ISessionMsg, view: BebopView): void {
      const pos = view.reserveMessageLength();
      const start = view.length;
      if (message.sessionId != null) {
        view.writeByte(1);
        view.writeString(message.sessionId);
      }
      if (message.clientId != null) {
        view.writeByte(2);
        view.writeGuid(message.clientId);
      }
      view.writeByte(0);
      const end = view.length;
      view.fillMessageLength(pos, end - start);
  },

  decode(buffer: Uint8Array): ISessionMsg {
    const view = BebopView.getInstance();
    view.startReading(buffer);
    return this.readFrom(view);
  },

  readFrom(view: BebopView): ISessionMsg {
    let message: ISessionMsg = {};
    const length = view.readMessageLength();
    const end = view.index + length;
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
  },
};

export interface INetworkMessage {
  incomingOpCode?: number;
  incomingRecord?: Uint8Array;
}

export const NetworkMessage = {
  encode(message: INetworkMessage): Uint8Array {
    const view = BebopView.getInstance();
    view.startWriting();
    this.encodeInto(message, view);
    return view.toArray();
  },

  encodeInto(message: INetworkMessage, view: BebopView): void {
      const pos = view.reserveMessageLength();
      const start = view.length;
      if (message.incomingOpCode != null) {
        view.writeByte(1);
        view.writeUint32(message.incomingOpCode);
      }
      if (message.incomingRecord != null) {
        view.writeByte(2);
        view.writeBytes(message.incomingRecord);
      }
      view.writeByte(0);
      const end = view.length;
      view.fillMessageLength(pos, end - start);
  },

  decode(buffer: Uint8Array): INetworkMessage {
    const view = BebopView.getInstance();
    view.startReading(buffer);
    return this.readFrom(view);
  },

  readFrom(view: BebopView): INetworkMessage {
    let message: INetworkMessage = {};
    const length = view.readMessageLength();
    const end = view.index + length;
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
  },
};

export interface IGhostAlgorithms {
  blinky: string;
  clyde: string;
  inky: string;
  pinky: string;
}

export const GhostAlgorithms = {
  encode(message: IGhostAlgorithms): Uint8Array {
    const view = BebopView.getInstance();
    view.startWriting();
    this.encodeInto(message, view);
    return view.toArray();
  },

  encodeInto(message: IGhostAlgorithms, view: BebopView): void {
      view.writeString(message.blinky);
      view.writeString(message.clyde);
      view.writeString(message.inky);
      view.writeString(message.pinky);
  },

  decode(buffer: Uint8Array): IGhostAlgorithms {
    const view = BebopView.getInstance();
    view.startReading(buffer);
    return this.readFrom(view);
  },

  readFrom(view: BebopView): IGhostAlgorithms {
    let field0: string;
    field0 = view.readString();
    let field1: string;
    field1 = view.readString();
    let field2: string;
    field2 = view.readString();
    let field3: string;
    field3 = view.readString();
    let message: IGhostAlgorithms = {
      blinky: field0,
      clyde: field1,
      inky: field2,
      pinky: field3,
    };
    return message;
  },
};

export interface IPlayerState {
  session: ISessionMsg;
  direction: MovingState;
  scores: Map<string, bigint>;
  lives: Map<string, bigint>;
  playerPositions: Map<string, IPosition>;
  scorePositions: Array<IPosition>;
}

export const PlayerState = {
  opcode: 0x5,
  encode(message: IPlayerState): Uint8Array {
    const view = BebopView.getInstance();
    view.startWriting();
    this.encodeInto(message, view);
    return view.toArray();
  },

  encodeInto(message: IPlayerState, view: BebopView): void {
      SessionMsg.encodeInto(message.session, view)
      view.writeEnum(message.direction);
      view.writeUint32(message.scores.size);
      for (const [k0, v0] of message.scores) {
        view.writeGuid(k0);
        view.writeInt64(v0);
      }
      view.writeUint32(message.lives.size);
      for (const [k0, v0] of message.lives) {
        view.writeGuid(k0);
        view.writeInt64(v0);
      }
      view.writeUint32(message.playerPositions.size);
      for (const [k0, v0] of message.playerPositions) {
        view.writeGuid(k0);
        Position.encodeInto(v0, view)
      }
      {
        const length0 = message.scorePositions.length;
        view.writeUint32(length0);
        for (let i0 = 0; i0 < length0; i0++) {
          Position.encodeInto(message.scorePositions[i0], view)
        }
      }
  },

  decode(buffer: Uint8Array): IPlayerState {
    const view = BebopView.getInstance();
    view.startReading(buffer);
    return this.readFrom(view);
  },

  readFrom(view: BebopView): IPlayerState {
    let field0: ISessionMsg;
    field0 = SessionMsg.readFrom(view);
    let field1: MovingState;
    field1 = view.readUint32() as MovingState;
    let field2: Map<string, bigint>;
    {
      let length0 = view.readUint32();
      field2 = new Map<string, bigint>();
      for (let i0 = 0; i0 < length0; i0++) {
        let k0: string;
        let v0: bigint;
        k0 = view.readGuid();
        v0 = view.readInt64();
        field2.set(k0, v0);
      }
    }
    let field3: Map<string, bigint>;
    {
      let length0 = view.readUint32();
      field3 = new Map<string, bigint>();
      for (let i0 = 0; i0 < length0; i0++) {
        let k0: string;
        let v0: bigint;
        k0 = view.readGuid();
        v0 = view.readInt64();
        field3.set(k0, v0);
      }
    }
    let field4: Map<string, IPosition>;
    {
      let length0 = view.readUint32();
      field4 = new Map<string, IPosition>();
      for (let i0 = 0; i0 < length0; i0++) {
        let k0: string;
        let v0: IPosition;
        k0 = view.readGuid();
        v0 = Position.readFrom(view);
        field4.set(k0, v0);
      }
    }
    let field5: Array<IPosition>;
    {
      let length0 = view.readUint32();
      field5 = new Array<IPosition>(length0);
      for (let i0 = 0; i0 < length0; i0++) {
        let x0: IPosition;
        x0 = Position.readFrom(view);
        field5[i0] = x0;
      }
    }
    let message: IPlayerState = {
      session: field0,
      direction: field1,
      scores: field2,
      lives: field3,
      playerPositions: field4,
      scorePositions: field5,
    };
    return message;
  },
};

export interface IInitState {
  ghostInitPositions: Map<string, IPosition>;
  playerInitPositions: Map<string, IPosition>;
  scorePointInitPositions: Array<IPosition>;
  playerInitScores: Map<string, bigint>;
  playerInitLives: Map<string, bigint>;
}

export const InitState = {
  opcode: 0x9,
  encode(message: IInitState): Uint8Array {
    const view = BebopView.getInstance();
    view.startWriting();
    this.encodeInto(message, view);
    return view.toArray();
  },

  encodeInto(message: IInitState, view: BebopView): void {
      view.writeUint32(message.ghostInitPositions.size);
      for (const [k0, v0] of message.ghostInitPositions) {
        view.writeString(k0);
        Position.encodeInto(v0, view)
      }
      view.writeUint32(message.playerInitPositions.size);
      for (const [k0, v0] of message.playerInitPositions) {
        view.writeGuid(k0);
        Position.encodeInto(v0, view)
      }
      {
        const length0 = message.scorePointInitPositions.length;
        view.writeUint32(length0);
        for (let i0 = 0; i0 < length0; i0++) {
          Position.encodeInto(message.scorePointInitPositions[i0], view)
        }
      }
      view.writeUint32(message.playerInitScores.size);
      for (const [k0, v0] of message.playerInitScores) {
        view.writeGuid(k0);
        view.writeInt64(v0);
      }
      view.writeUint32(message.playerInitLives.size);
      for (const [k0, v0] of message.playerInitLives) {
        view.writeGuid(k0);
        view.writeInt64(v0);
      }
  },

  decode(buffer: Uint8Array): IInitState {
    const view = BebopView.getInstance();
    view.startReading(buffer);
    return this.readFrom(view);
  },

  readFrom(view: BebopView): IInitState {
    let field0: Map<string, IPosition>;
    {
      let length0 = view.readUint32();
      field0 = new Map<string, IPosition>();
      for (let i0 = 0; i0 < length0; i0++) {
        let k0: string;
        let v0: IPosition;
        k0 = view.readString();
        v0 = Position.readFrom(view);
        field0.set(k0, v0);
      }
    }
    let field1: Map<string, IPosition>;
    {
      let length0 = view.readUint32();
      field1 = new Map<string, IPosition>();
      for (let i0 = 0; i0 < length0; i0++) {
        let k0: string;
        let v0: IPosition;
        k0 = view.readGuid();
        v0 = Position.readFrom(view);
        field1.set(k0, v0);
      }
    }
    let field2: Array<IPosition>;
    {
      let length0 = view.readUint32();
      field2 = new Array<IPosition>(length0);
      for (let i0 = 0; i0 < length0; i0++) {
        let x0: IPosition;
        x0 = Position.readFrom(view);
        field2[i0] = x0;
      }
    }
    let field3: Map<string, bigint>;
    {
      let length0 = view.readUint32();
      field3 = new Map<string, bigint>();
      for (let i0 = 0; i0 < length0; i0++) {
        let k0: string;
        let v0: bigint;
        k0 = view.readGuid();
        v0 = view.readInt64();
        field3.set(k0, v0);
      }
    }
    let field4: Map<string, bigint>;
    {
      let length0 = view.readUint32();
      field4 = new Map<string, bigint>();
      for (let i0 = 0; i0 < length0; i0++) {
        let k0: string;
        let v0: bigint;
        k0 = view.readGuid();
        v0 = view.readInt64();
        field4.set(k0, v0);
      }
    }
    let message: IInitState = {
      ghostInitPositions: field0,
      playerInitPositions: field1,
      scorePointInitPositions: field2,
      playerInitScores: field3,
      playerInitLives: field4,
    };
    return message;
  },
};

export interface IModelSave {
  tensors: Array<ITensorSave>;
}

export const ModelSave = {
  encode(message: IModelSave): Uint8Array {
    const view = BebopView.getInstance();
    view.startWriting();
    this.encodeInto(message, view);
    return view.toArray();
  },

  encodeInto(message: IModelSave, view: BebopView): void {
      {
        const length0 = message.tensors.length;
        view.writeUint32(length0);
        for (let i0 = 0; i0 < length0; i0++) {
          TensorSave.encodeInto(message.tensors[i0], view)
        }
      }
  },

  decode(buffer: Uint8Array): IModelSave {
    const view = BebopView.getInstance();
    view.startReading(buffer);
    return this.readFrom(view);
  },

  readFrom(view: BebopView): IModelSave {
    let field0: Array<ITensorSave>;
    {
      let length0 = view.readUint32();
      field0 = new Array<ITensorSave>(length0);
      for (let i0 = 0; i0 < length0; i0++) {
        let x0: ITensorSave;
        x0 = TensorSave.readFrom(view);
        field0[i0] = x0;
      }
    }
    let message: IModelSave = {
      tensors: field0,
    };
    return message;
  },
};

export interface ILevelData {
  timeSteps: Array<ITimeStepData>;
  winner: string;
}

export const LevelData = {
  encode(message: ILevelData): Uint8Array {
    const view = BebopView.getInstance();
    view.startWriting();
    this.encodeInto(message, view);
    return view.toArray();
  },

  encodeInto(message: ILevelData, view: BebopView): void {
      {
        const length0 = message.timeSteps.length;
        view.writeUint32(length0);
        for (let i0 = 0; i0 < length0; i0++) {
          TimeStepData.encodeInto(message.timeSteps[i0], view)
        }
      }
      view.writeString(message.winner);
  },

  decode(buffer: Uint8Array): ILevelData {
    const view = BebopView.getInstance();
    view.startReading(buffer);
    return this.readFrom(view);
  },

  readFrom(view: BebopView): ILevelData {
    let field0: Array<ITimeStepData>;
    {
      let length0 = view.readUint32();
      field0 = new Array<ITimeStepData>(length0);
      for (let i0 = 0; i0 < length0; i0++) {
        let x0: ITimeStepData;
        x0 = TimeStepData.readFrom(view);
        field0[i0] = x0;
      }
    }
    let field1: string;
    field1 = view.readString();
    let message: ILevelData = {
      timeSteps: field0,
      winner: field1,
    };
    return message;
  },
};

export interface ITimeStepData {
  timestamp?: number;
  playerState?: IPlayerState;
  ghostPositions?: Map<string, IPosition>;
}

export const TimeStepData = {
  encode(message: ITimeStepData): Uint8Array {
    const view = BebopView.getInstance();
    view.startWriting();
    this.encodeInto(message, view);
    return view.toArray();
  },

  encodeInto(message: ITimeStepData, view: BebopView): void {
      const pos = view.reserveMessageLength();
      const start = view.length;
      if (message.timestamp != null) {
        view.writeByte(1);
        view.writeFloat64(message.timestamp);
      }
      if (message.playerState != null) {
        view.writeByte(2);
        PlayerState.encodeInto(message.playerState, view)
      }
      if (message.ghostPositions != null) {
        view.writeByte(3);
        view.writeUint32(message.ghostPositions.size);
      for (const [k0, v0] of message.ghostPositions) {
        view.writeString(k0);
        Position.encodeInto(v0, view)
      }
      }
      view.writeByte(0);
      const end = view.length;
      view.fillMessageLength(pos, end - start);
  },

  decode(buffer: Uint8Array): ITimeStepData {
    const view = BebopView.getInstance();
    view.startReading(buffer);
    return this.readFrom(view);
  },

  readFrom(view: BebopView): ITimeStepData {
    let message: ITimeStepData = {};
    const length = view.readMessageLength();
    const end = view.index + length;
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
        let length0 = view.readUint32();
        message.ghostPositions = new Map<string, IPosition>();
        for (let i0 = 0; i0 < length0; i0++) {
          let k0: string;
          let v0: IPosition;
          k0 = view.readString();
          v0 = Position.readFrom(view);
          message.ghostPositions.set(k0, v0);
        }
      }
          break;

        default:
          view.index = end;
          return message;
      }
    }
  },
};

export interface ITensorSave {
  name: string;
  values: Array<number>;
  shape: Array<number>;
}

export const TensorSave = {
  encode(message: ITensorSave): Uint8Array {
    const view = BebopView.getInstance();
    view.startWriting();
    this.encodeInto(message, view);
    return view.toArray();
  },

  encodeInto(message: ITensorSave, view: BebopView): void {
      view.writeString(message.name);
      {
        const length0 = message.values.length;
        view.writeUint32(length0);
        for (let i0 = 0; i0 < length0; i0++) {
          view.writeFloat32(message.values[i0]);
        }
      }
      {
        const length0 = message.shape.length;
        view.writeUint32(length0);
        for (let i0 = 0; i0 < length0; i0++) {
          view.writeInt32(message.shape[i0]);
        }
      }
  },

  decode(buffer: Uint8Array): ITensorSave {
    const view = BebopView.getInstance();
    view.startReading(buffer);
    return this.readFrom(view);
  },

  readFrom(view: BebopView): ITensorSave {
    let field0: string;
    field0 = view.readString();
    let field1: Array<number>;
    {
      let length0 = view.readUint32();
      field1 = new Array<number>(length0);
      for (let i0 = 0; i0 < length0; i0++) {
        let x0: number;
        x0 = view.readFloat32();
        field1[i0] = x0;
      }
    }
    let field2: Array<number>;
    {
      let length0 = view.readUint32();
      field2 = new Array<number>(length0);
      for (let i0 = 0; i0 < length0; i0++) {
        let x0: number;
        x0 = view.readInt32();
        field2[i0] = x0;
      }
    }
    let message: ITensorSave = {
      name: field0,
      values: field1,
      shape: field2,
    };
    return message;
  },
};

export interface IGameData {
  levelData: Array<ILevelData>;
  myId: string;
}

export const GameData = {
  encode(message: IGameData): Uint8Array {
    const view = BebopView.getInstance();
    view.startWriting();
    this.encodeInto(message, view);
    return view.toArray();
  },

  encodeInto(message: IGameData, view: BebopView): void {
      {
        const length0 = message.levelData.length;
        view.writeUint32(length0);
        for (let i0 = 0; i0 < length0; i0++) {
          LevelData.encodeInto(message.levelData[i0], view)
        }
      }
      view.writeGuid(message.myId);
  },

  decode(buffer: Uint8Array): IGameData {
    const view = BebopView.getInstance();
    view.startReading(buffer);
    return this.readFrom(view);
  },

  readFrom(view: BebopView): IGameData {
    let field0: Array<ILevelData>;
    {
      let length0 = view.readUint32();
      field0 = new Array<ILevelData>(length0);
      for (let i0 = 0; i0 < length0; i0++) {
        let x0: ILevelData;
        x0 = LevelData.readFrom(view);
        field0[i0] = x0;
      }
    }
    let field1: string;
    field1 = view.readGuid();
    let message: IGameData = {
      levelData: field0,
      myId: field1,
    };
    return message;
  },
};

export interface INewLevelMsg {
  levelCount: number;
}

export const NewLevelMsg = {
  opcode: 0x13,
  encode(message: INewLevelMsg): Uint8Array {
    const view = BebopView.getInstance();
    view.startWriting();
    this.encodeInto(message, view);
    return view.toArray();
  },

  encodeInto(message: INewLevelMsg, view: BebopView): void {
      view.writeInt32(message.levelCount);
  },

  decode(buffer: Uint8Array): INewLevelMsg {
    const view = BebopView.getInstance();
    view.startReading(buffer);
    return this.readFrom(view);
  },

  readFrom(view: BebopView): INewLevelMsg {
    let field0: number;
    field0 = view.readInt32();
    let message: INewLevelMsg = {
      levelCount: field0,
    };
    return message;
  },
};

export interface IResetMsg {
  ghostResetPoints: Map<string, IPosition>;
  playerResetPoints: Map<string, IPosition>;
  playerLives: Map<string, bigint>;
}

export const ResetMsg = {
  opcode: 0x10,
  encode(message: IResetMsg): Uint8Array {
    const view = BebopView.getInstance();
    view.startWriting();
    this.encodeInto(message, view);
    return view.toArray();
  },

  encodeInto(message: IResetMsg, view: BebopView): void {
      view.writeUint32(message.ghostResetPoints.size);
      for (const [k0, v0] of message.ghostResetPoints) {
        view.writeString(k0);
        Position.encodeInto(v0, view)
      }
      view.writeUint32(message.playerResetPoints.size);
      for (const [k0, v0] of message.playerResetPoints) {
        view.writeGuid(k0);
        Position.encodeInto(v0, view)
      }
      view.writeUint32(message.playerLives.size);
      for (const [k0, v0] of message.playerLives) {
        view.writeGuid(k0);
        view.writeInt64(v0);
      }
  },

  decode(buffer: Uint8Array): IResetMsg {
    const view = BebopView.getInstance();
    view.startReading(buffer);
    return this.readFrom(view);
  },

  readFrom(view: BebopView): IResetMsg {
    let field0: Map<string, IPosition>;
    {
      let length0 = view.readUint32();
      field0 = new Map<string, IPosition>();
      for (let i0 = 0; i0 < length0; i0++) {
        let k0: string;
        let v0: IPosition;
        k0 = view.readString();
        v0 = Position.readFrom(view);
        field0.set(k0, v0);
      }
    }
    let field1: Map<string, IPosition>;
    {
      let length0 = view.readUint32();
      field1 = new Map<string, IPosition>();
      for (let i0 = 0; i0 < length0; i0++) {
        let k0: string;
        let v0: IPosition;
        k0 = view.readGuid();
        v0 = Position.readFrom(view);
        field1.set(k0, v0);
      }
    }
    let field2: Map<string, bigint>;
    {
      let length0 = view.readUint32();
      field2 = new Map<string, bigint>();
      for (let i0 = 0; i0 < length0; i0++) {
        let k0: string;
        let v0: bigint;
        k0 = view.readGuid();
        v0 = view.readInt64();
        field2.set(k0, v0);
      }
    }
    let message: IResetMsg = {
      ghostResetPoints: field0,
      playerResetPoints: field1,
      playerLives: field2,
    };
    return message;
  },
};

export interface IGhostMoveMsg {
  ghostPositions: Map<string, IPosition>;
}

export const GhostMoveMsg = {
  opcode: 0x6,
  encode(message: IGhostMoveMsg): Uint8Array {
    const view = BebopView.getInstance();
    view.startWriting();
    this.encodeInto(message, view);
    return view.toArray();
  },

  encodeInto(message: IGhostMoveMsg, view: BebopView): void {
      view.writeUint32(message.ghostPositions.size);
      for (const [k0, v0] of message.ghostPositions) {
        view.writeString(k0);
        Position.encodeInto(v0, view)
      }
  },

  decode(buffer: Uint8Array): IGhostMoveMsg {
    const view = BebopView.getInstance();
    view.startReading(buffer);
    return this.readFrom(view);
  },

  readFrom(view: BebopView): IGhostMoveMsg {
    let field0: Map<string, IPosition>;
    {
      let length0 = view.readUint32();
      field0 = new Map<string, IPosition>();
      for (let i0 = 0; i0 < length0; i0++) {
        let k0: string;
        let v0: IPosition;
        k0 = view.readString();
        v0 = Position.readFrom(view);
        field0.set(k0, v0);
      }
    }
    let message: IGhostMoveMsg = {
      ghostPositions: field0,
    };
    return message;
  },
};

export interface IGameOverMsg {
  reason?: GameOverReason;
  playerId?: string;
}

export const GameOverMsg = {
  opcode: 0x12,
  encode(message: IGameOverMsg): Uint8Array {
    const view = BebopView.getInstance();
    view.startWriting();
    this.encodeInto(message, view);
    return view.toArray();
  },

  encodeInto(message: IGameOverMsg, view: BebopView): void {
      const pos = view.reserveMessageLength();
      const start = view.length;
      if (message.reason != null) {
        view.writeByte(1);
        view.writeEnum(message.reason);
      }
      if (message.playerId != null) {
        view.writeByte(2);
        view.writeGuid(message.playerId);
      }
      view.writeByte(0);
      const end = view.length;
      view.fillMessageLength(pos, end - start);
  },

  decode(buffer: Uint8Array): IGameOverMsg {
    const view = BebopView.getInstance();
    view.startReading(buffer);
    return this.readFrom(view);
  },

  readFrom(view: BebopView): IGameOverMsg {
    let message: IGameOverMsg = {};
    const length = view.readMessageLength();
    const end = view.index + length;
    while (true) {
      switch (view.readByte()) {
        case 0:
          return message;

        case 1:
          message.reason = view.readUint32() as GameOverReason;
          break;

        case 2:
          message.playerId = view.readGuid();
          break;

        default:
          view.index = end;
          return message;
      }
    }
  },
};

export interface IJoinMsg {
  session?: ISessionMsg;
  algorithms?: IGhostAlgorithms;
  playerName?: string;
  levelCount?: number;
  gameCount?: number;
}

export const JoinMsg = {
  opcode: 0x4,
  encode(message: IJoinMsg): Uint8Array {
    const view = BebopView.getInstance();
    view.startWriting();
    this.encodeInto(message, view);
    return view.toArray();
  },

  encodeInto(message: IJoinMsg, view: BebopView): void {
      const pos = view.reserveMessageLength();
      const start = view.length;
      if (message.session != null) {
        view.writeByte(1);
        SessionMsg.encodeInto(message.session, view)
      }
      if (message.algorithms != null) {
        view.writeByte(2);
        GhostAlgorithms.encodeInto(message.algorithms, view)
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
      const end = view.length;
      view.fillMessageLength(pos, end - start);
  },

  decode(buffer: Uint8Array): IJoinMsg {
    const view = BebopView.getInstance();
    view.startReading(buffer);
    return this.readFrom(view);
  },

  readFrom(view: BebopView): IJoinMsg {
    let message: IJoinMsg = {};
    const length = view.readMessageLength();
    const end = view.index + length;
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
  },
};

export interface IStrikeMsg {
  playerId: string;
  reason: string;
  strikeCount: number;
}

export const StrikeMsg = {
  opcode: 0x16,
  encode(message: IStrikeMsg): Uint8Array {
    const view = BebopView.getInstance();
    view.startWriting();
    this.encodeInto(message, view);
    return view.toArray();
  },

  encodeInto(message: IStrikeMsg, view: BebopView): void {
      view.writeGuid(message.playerId);
      view.writeString(message.reason);
      view.writeInt32(message.strikeCount);
  },

  decode(buffer: Uint8Array): IStrikeMsg {
    const view = BebopView.getInstance();
    view.startReading(buffer);
    return this.readFrom(view);
  },

  readFrom(view: BebopView): IStrikeMsg {
    let field0: string;
    field0 = view.readGuid();
    let field1: string;
    field1 = view.readString();
    let field2: number;
    field2 = view.readInt32();
    let message: IStrikeMsg = {
      playerId: field0,
      reason: field1,
      strikeCount: field2,
    };
    return message;
  },
};

export interface IRewardMsg {
  reward?: number;
  done?: boolean;
  newSelfState?: IPosition;
  newGhostState?: Map<string, IPosition>;
}

export const RewardMsg = {
  opcode: 0x15,
  encode(message: IRewardMsg): Uint8Array {
    const view = BebopView.getInstance();
    view.startWriting();
    this.encodeInto(message, view);
    return view.toArray();
  },

  encodeInto(message: IRewardMsg, view: BebopView): void {
      const pos = view.reserveMessageLength();
      const start = view.length;
      if (message.reward != null) {
        view.writeByte(1);
        view.writeFloat32(message.reward);
      }
      if (message.done != null) {
        view.writeByte(2);
        view.writeByte(Number(message.done));
      }
      if (message.newSelfState != null) {
        view.writeByte(3);
        Position.encodeInto(message.newSelfState, view)
      }
      if (message.newGhostState != null) {
        view.writeByte(4);
        view.writeUint32(message.newGhostState.size);
      for (const [k0, v0] of message.newGhostState) {
        view.writeString(k0);
        Position.encodeInto(v0, view)
      }
      }
      view.writeByte(0);
      const end = view.length;
      view.fillMessageLength(pos, end - start);
  },

  decode(buffer: Uint8Array): IRewardMsg {
    const view = BebopView.getInstance();
    view.startReading(buffer);
    return this.readFrom(view);
  },

  readFrom(view: BebopView): IRewardMsg {
    let message: IRewardMsg = {};
    const length = view.readMessageLength();
    const end = view.index + length;
    while (true) {
      switch (view.readByte()) {
        case 0:
          return message;

        case 1:
          message.reward = view.readFloat32();
          break;

        case 2:
          message.done = !!view.readByte();
          break;

        case 3:
          message.newSelfState = Position.readFrom(view);
          break;

        case 4:
          {
        let length0 = view.readUint32();
        message.newGhostState = new Map<string, IPosition>();
        for (let i0 = 0; i0 < length0; i0++) {
          let k0: string;
          let v0: IPosition;
          k0 = view.readString();
          v0 = Position.readFrom(view);
          message.newGhostState.set(k0, v0);
        }
      }
          break;

        default:
          view.index = end;
          return message;
      }
    }
  },
};

export interface IErrorMsg {
  errorMessage: string;
}

export const ErrorMsg = {
  opcode: 0x1,
  encode(message: IErrorMsg): Uint8Array {
    const view = BebopView.getInstance();
    view.startWriting();
    this.encodeInto(message, view);
    return view.toArray();
  },

  encodeInto(message: IErrorMsg, view: BebopView): void {
      view.writeString(message.errorMessage);
  },

  decode(buffer: Uint8Array): IErrorMsg {
    const view = BebopView.getInstance();
    view.startReading(buffer);
    return this.readFrom(view);
  },

  readFrom(view: BebopView): IErrorMsg {
    let field0: string;
    field0 = view.readString();
    let message: IErrorMsg = {
      errorMessage: field0,
    };
    return message;
  },
};

export interface INewGameMsg {
  resetMsg?: IResetMsg;
}

export const NewGameMsg = {
  opcode: 0x14,
  encode(message: INewGameMsg): Uint8Array {
    const view = BebopView.getInstance();
    view.startWriting();
    this.encodeInto(message, view);
    return view.toArray();
  },

  encodeInto(message: INewGameMsg, view: BebopView): void {
      const pos = view.reserveMessageLength();
      const start = view.length;
      if (message.resetMsg != null) {
        view.writeByte(1);
        ResetMsg.encodeInto(message.resetMsg, view)
      }
      view.writeByte(0);
      const end = view.length;
      view.fillMessageLength(pos, end - start);
  },

  decode(buffer: Uint8Array): INewGameMsg {
    const view = BebopView.getInstance();
    view.startReading(buffer);
    return this.readFrom(view);
  },

  readFrom(view: BebopView): INewGameMsg {
    let message: INewGameMsg = {};
    const length = view.readMessageLength();
    const end = view.index + length;
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
  },
};

export interface IExitMsg {
  session: ISessionMsg;
}

export const ExitMsg = {
  opcode: 0x3,
  encode(message: IExitMsg): Uint8Array {
    const view = BebopView.getInstance();
    view.startWriting();
    this.encodeInto(message, view);
    return view.toArray();
  },

  encodeInto(message: IExitMsg, view: BebopView): void {
      SessionMsg.encodeInto(message.session, view)
  },

  decode(buffer: Uint8Array): IExitMsg {
    const view = BebopView.getInstance();
    view.startReading(buffer);
    return this.readFrom(view);
  },

  readFrom(view: BebopView): IExitMsg {
    let field0: ISessionMsg;
    field0 = SessionMsg.readFrom(view);
    let message: IExitMsg = {
      session: field0,
    };
    return message;
  },
};

export interface IReconnectMsg {
  session?: ISessionMsg;
}

export const ReconnectMsg = {
  opcode: 0x11,
  encode(message: IReconnectMsg): Uint8Array {
    const view = BebopView.getInstance();
    view.startWriting();
    this.encodeInto(message, view);
    return view.toArray();
  },

  encodeInto(message: IReconnectMsg, view: BebopView): void {
      const pos = view.reserveMessageLength();
      const start = view.length;
      if (message.session != null) {
        view.writeByte(1);
        SessionMsg.encodeInto(message.session, view)
      }
      view.writeByte(0);
      const end = view.length;
      view.fillMessageLength(pos, end - start);
  },

  decode(buffer: Uint8Array): IReconnectMsg {
    const view = BebopView.getInstance();
    view.startReading(buffer);
    return this.readFrom(view);
  },

  readFrom(view: BebopView): IReconnectMsg {
    let message: IReconnectMsg = {};
    const length = view.readMessageLength();
    const end = view.index + length;
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
  },
};

export interface IReadyMsg {
  session?: ISessionMsg;
  ready?: boolean;
}

export const ReadyMsg = {
  opcode: 0x8,
  encode(message: IReadyMsg): Uint8Array {
    const view = BebopView.getInstance();
    view.startWriting();
    this.encodeInto(message, view);
    return view.toArray();
  },

  encodeInto(message: IReadyMsg, view: BebopView): void {
      const pos = view.reserveMessageLength();
      const start = view.length;
      if (message.session != null) {
        view.writeByte(1);
        SessionMsg.encodeInto(message.session, view)
      }
      if (message.ready != null) {
        view.writeByte(2);
        view.writeByte(Number(message.ready));
      }
      view.writeByte(0);
      const end = view.length;
      view.fillMessageLength(pos, end - start);
  },

  decode(buffer: Uint8Array): IReadyMsg {
    const view = BebopView.getInstance();
    view.startReading(buffer);
    return this.readFrom(view);
  },

  readFrom(view: BebopView): IReadyMsg {
    let message: IReadyMsg = {};
    const length = view.readMessageLength();
    const end = view.index + length;
    while (true) {
      switch (view.readByte()) {
        case 0:
          return message;

        case 1:
          message.session = SessionMsg.readFrom(view);
          break;

        case 2:
          message.ready = !!view.readByte();
          break;

        default:
          view.index = end;
          return message;
      }
    }
  },
};

export interface IPlayerJoinedMsg {
  playerName?: string;
  session?: ISessionMsg;
}

export const PlayerJoinedMsg = {
  opcode: 0x7,
  encode(message: IPlayerJoinedMsg): Uint8Array {
    const view = BebopView.getInstance();
    view.startWriting();
    this.encodeInto(message, view);
    return view.toArray();
  },

  encodeInto(message: IPlayerJoinedMsg, view: BebopView): void {
      const pos = view.reserveMessageLength();
      const start = view.length;
      if (message.playerName != null) {
        view.writeByte(1);
        view.writeString(message.playerName);
      }
      if (message.session != null) {
        view.writeByte(2);
        SessionMsg.encodeInto(message.session, view)
      }
      view.writeByte(0);
      const end = view.length;
      view.fillMessageLength(pos, end - start);
  },

  decode(buffer: Uint8Array): IPlayerJoinedMsg {
    const view = BebopView.getInstance();
    view.startReading(buffer);
    return this.readFrom(view);
  },

  readFrom(view: BebopView): IPlayerJoinedMsg {
    let message: IPlayerJoinedMsg = {};
    const length = view.readMessageLength();
    const end = view.index + length;
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
  },
};

export enum GameOverReason {
  ExceededStrikes = 0,
  ExceededGameCount = 1,
  ExceededLevelCount = 2,
}

export enum MovingState {
  Up = 0,
  Down = 1,
  Left = 2,
  Right = 3,
}

export interface IPosition {
  x: number;
  y: number;
}

export const Position = {
  encode(message: IPosition): Uint8Array {
    const view = BebopView.getInstance();
    view.startWriting();
    this.encodeInto(message, view);
    return view.toArray();
  },

  encodeInto(message: IPosition, view: BebopView): void {
      view.writeFloat32(message.x);
      view.writeFloat32(message.y);
  },

  decode(buffer: Uint8Array): IPosition {
    const view = BebopView.getInstance();
    view.startReading(buffer);
    return this.readFrom(view);
  },

  readFrom(view: BebopView): IPosition {
    let field0: number;
    field0 = view.readFloat32();
    let field1: number;
    field1 = view.readFloat32();
    let message: IPosition = {
      x: field0,
      y: field1,
    };
    return message;
  },
};

