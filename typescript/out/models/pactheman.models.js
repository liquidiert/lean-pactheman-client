"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Position = exports.MovingState = exports.GameOverReason = exports.PlayerJoinedMsg = exports.ReadyMsg = exports.ReconnectMsg = exports.ExitMsg = exports.NewGameMsg = exports.ErrorMsg = exports.RewardMsg = exports.JoinMsg = exports.GameOverMsg = exports.GhostMoveMsg = exports.ResetMsg = exports.NewLevelMsg = exports.GameData = exports.TensorSave = exports.TimeStepData = exports.LevelData = exports.ModelSave = exports.InitState = exports.PlayerState = exports.GhostAlgorithms = exports.NetworkMessage = exports.SessionMsg = void 0;
const bebop_1 = require("bebop");
exports.SessionMsg = {
    opcode: 0x2,
    encode(message) {
        const view = bebop_1.BebopView.getInstance();
        view.startWriting();
        this.encodeInto(message, view);
        return view.toArray();
    },
    encodeInto(message, view) {
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
    decode(buffer) {
        const view = bebop_1.BebopView.getInstance();
        view.startReading(buffer);
        return this.readFrom(view);
    },
    readFrom(view) {
        let message = {};
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
exports.NetworkMessage = {
    encode(message) {
        const view = bebop_1.BebopView.getInstance();
        view.startWriting();
        this.encodeInto(message, view);
        return view.toArray();
    },
    encodeInto(message, view) {
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
    decode(buffer) {
        const view = bebop_1.BebopView.getInstance();
        view.startReading(buffer);
        return this.readFrom(view);
    },
    readFrom(view) {
        let message = {};
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
exports.GhostAlgorithms = {
    encode(message) {
        const view = bebop_1.BebopView.getInstance();
        view.startWriting();
        this.encodeInto(message, view);
        return view.toArray();
    },
    encodeInto(message, view) {
        view.writeString(message.blinky);
        view.writeString(message.clyde);
        view.writeString(message.inky);
        view.writeString(message.pinky);
    },
    decode(buffer) {
        const view = bebop_1.BebopView.getInstance();
        view.startReading(buffer);
        return this.readFrom(view);
    },
    readFrom(view) {
        let field0;
        field0 = view.readString();
        let field1;
        field1 = view.readString();
        let field2;
        field2 = view.readString();
        let field3;
        field3 = view.readString();
        let message = {
            blinky: field0,
            clyde: field1,
            inky: field2,
            pinky: field3,
        };
        return message;
    },
};
exports.PlayerState = {
    opcode: 0x5,
    encode(message) {
        const view = bebop_1.BebopView.getInstance();
        view.startWriting();
        this.encodeInto(message, view);
        return view.toArray();
    },
    encodeInto(message, view) {
        exports.SessionMsg.encodeInto(message.session, view);
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
            exports.Position.encodeInto(v0, view);
        }
        {
            const length0 = message.scorePositions.length;
            view.writeUint32(length0);
            for (let i0 = 0; i0 < length0; i0++) {
                exports.Position.encodeInto(message.scorePositions[i0], view);
            }
        }
    },
    decode(buffer) {
        const view = bebop_1.BebopView.getInstance();
        view.startReading(buffer);
        return this.readFrom(view);
    },
    readFrom(view) {
        let field0;
        field0 = exports.SessionMsg.readFrom(view);
        let field1;
        field1 = view.readUint32();
        let field2;
        {
            let length0 = view.readUint32();
            field2 = new Map();
            for (let i0 = 0; i0 < length0; i0++) {
                let k0;
                let v0;
                k0 = view.readGuid();
                v0 = view.readInt64();
                field2.set(k0, v0);
            }
        }
        let field3;
        {
            let length0 = view.readUint32();
            field3 = new Map();
            for (let i0 = 0; i0 < length0; i0++) {
                let k0;
                let v0;
                k0 = view.readGuid();
                v0 = view.readInt64();
                field3.set(k0, v0);
            }
        }
        let field4;
        {
            let length0 = view.readUint32();
            field4 = new Map();
            for (let i0 = 0; i0 < length0; i0++) {
                let k0;
                let v0;
                k0 = view.readGuid();
                v0 = exports.Position.readFrom(view);
                field4.set(k0, v0);
            }
        }
        let field5;
        {
            let length0 = view.readUint32();
            field5 = new Array(length0);
            for (let i0 = 0; i0 < length0; i0++) {
                let x0;
                x0 = exports.Position.readFrom(view);
                field5[i0] = x0;
            }
        }
        let message = {
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
exports.InitState = {
    opcode: 0x9,
    encode(message) {
        const view = bebop_1.BebopView.getInstance();
        view.startWriting();
        this.encodeInto(message, view);
        return view.toArray();
    },
    encodeInto(message, view) {
        view.writeUint32(message.ghostInitPositions.size);
        for (const [k0, v0] of message.ghostInitPositions) {
            view.writeString(k0);
            exports.Position.encodeInto(v0, view);
        }
        view.writeUint32(message.playerInitPositions.size);
        for (const [k0, v0] of message.playerInitPositions) {
            view.writeGuid(k0);
            exports.Position.encodeInto(v0, view);
        }
        {
            const length0 = message.scorePointInitPositions.length;
            view.writeUint32(length0);
            for (let i0 = 0; i0 < length0; i0++) {
                exports.Position.encodeInto(message.scorePointInitPositions[i0], view);
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
    decode(buffer) {
        const view = bebop_1.BebopView.getInstance();
        view.startReading(buffer);
        return this.readFrom(view);
    },
    readFrom(view) {
        let field0;
        {
            let length0 = view.readUint32();
            field0 = new Map();
            for (let i0 = 0; i0 < length0; i0++) {
                let k0;
                let v0;
                k0 = view.readString();
                v0 = exports.Position.readFrom(view);
                field0.set(k0, v0);
            }
        }
        let field1;
        {
            let length0 = view.readUint32();
            field1 = new Map();
            for (let i0 = 0; i0 < length0; i0++) {
                let k0;
                let v0;
                k0 = view.readGuid();
                v0 = exports.Position.readFrom(view);
                field1.set(k0, v0);
            }
        }
        let field2;
        {
            let length0 = view.readUint32();
            field2 = new Array(length0);
            for (let i0 = 0; i0 < length0; i0++) {
                let x0;
                x0 = exports.Position.readFrom(view);
                field2[i0] = x0;
            }
        }
        let field3;
        {
            let length0 = view.readUint32();
            field3 = new Map();
            for (let i0 = 0; i0 < length0; i0++) {
                let k0;
                let v0;
                k0 = view.readGuid();
                v0 = view.readInt64();
                field3.set(k0, v0);
            }
        }
        let field4;
        {
            let length0 = view.readUint32();
            field4 = new Map();
            for (let i0 = 0; i0 < length0; i0++) {
                let k0;
                let v0;
                k0 = view.readGuid();
                v0 = view.readInt64();
                field4.set(k0, v0);
            }
        }
        let message = {
            ghostInitPositions: field0,
            playerInitPositions: field1,
            scorePointInitPositions: field2,
            playerInitScores: field3,
            playerInitLives: field4,
        };
        return message;
    },
};
exports.ModelSave = {
    encode(message) {
        const view = bebop_1.BebopView.getInstance();
        view.startWriting();
        this.encodeInto(message, view);
        return view.toArray();
    },
    encodeInto(message, view) {
        {
            const length0 = message.tensors.length;
            view.writeUint32(length0);
            for (let i0 = 0; i0 < length0; i0++) {
                exports.TensorSave.encodeInto(message.tensors[i0], view);
            }
        }
    },
    decode(buffer) {
        const view = bebop_1.BebopView.getInstance();
        view.startReading(buffer);
        return this.readFrom(view);
    },
    readFrom(view) {
        let field0;
        {
            let length0 = view.readUint32();
            field0 = new Array(length0);
            for (let i0 = 0; i0 < length0; i0++) {
                let x0;
                x0 = exports.TensorSave.readFrom(view);
                field0[i0] = x0;
            }
        }
        let message = {
            tensors: field0,
        };
        return message;
    },
};
exports.LevelData = {
    encode(message) {
        const view = bebop_1.BebopView.getInstance();
        view.startWriting();
        this.encodeInto(message, view);
        return view.toArray();
    },
    encodeInto(message, view) {
        {
            const length0 = message.timeSteps.length;
            view.writeUint32(length0);
            for (let i0 = 0; i0 < length0; i0++) {
                exports.TimeStepData.encodeInto(message.timeSteps[i0], view);
            }
        }
        view.writeString(message.winner);
    },
    decode(buffer) {
        const view = bebop_1.BebopView.getInstance();
        view.startReading(buffer);
        return this.readFrom(view);
    },
    readFrom(view) {
        let field0;
        {
            let length0 = view.readUint32();
            field0 = new Array(length0);
            for (let i0 = 0; i0 < length0; i0++) {
                let x0;
                x0 = exports.TimeStepData.readFrom(view);
                field0[i0] = x0;
            }
        }
        let field1;
        field1 = view.readString();
        let message = {
            timeSteps: field0,
            winner: field1,
        };
        return message;
    },
};
exports.TimeStepData = {
    encode(message) {
        const view = bebop_1.BebopView.getInstance();
        view.startWriting();
        this.encodeInto(message, view);
        return view.toArray();
    },
    encodeInto(message, view) {
        const pos = view.reserveMessageLength();
        const start = view.length;
        if (message.timestamp != null) {
            view.writeByte(1);
            view.writeFloat64(message.timestamp);
        }
        if (message.playerState != null) {
            view.writeByte(2);
            exports.PlayerState.encodeInto(message.playerState, view);
        }
        if (message.ghostPositions != null) {
            view.writeByte(3);
            view.writeUint32(message.ghostPositions.size);
            for (const [k0, v0] of message.ghostPositions) {
                view.writeString(k0);
                exports.Position.encodeInto(v0, view);
            }
        }
        view.writeByte(0);
        const end = view.length;
        view.fillMessageLength(pos, end - start);
    },
    decode(buffer) {
        const view = bebop_1.BebopView.getInstance();
        view.startReading(buffer);
        return this.readFrom(view);
    },
    readFrom(view) {
        let message = {};
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
                    message.playerState = exports.PlayerState.readFrom(view);
                    break;
                case 3:
                    {
                        let length0 = view.readUint32();
                        message.ghostPositions = new Map();
                        for (let i0 = 0; i0 < length0; i0++) {
                            let k0;
                            let v0;
                            k0 = view.readString();
                            v0 = exports.Position.readFrom(view);
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
exports.TensorSave = {
    encode(message) {
        const view = bebop_1.BebopView.getInstance();
        view.startWriting();
        this.encodeInto(message, view);
        return view.toArray();
    },
    encodeInto(message, view) {
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
    decode(buffer) {
        const view = bebop_1.BebopView.getInstance();
        view.startReading(buffer);
        return this.readFrom(view);
    },
    readFrom(view) {
        let field0;
        field0 = view.readString();
        let field1;
        {
            let length0 = view.readUint32();
            field1 = new Array(length0);
            for (let i0 = 0; i0 < length0; i0++) {
                let x0;
                x0 = view.readFloat32();
                field1[i0] = x0;
            }
        }
        let field2;
        {
            let length0 = view.readUint32();
            field2 = new Array(length0);
            for (let i0 = 0; i0 < length0; i0++) {
                let x0;
                x0 = view.readInt32();
                field2[i0] = x0;
            }
        }
        let message = {
            name: field0,
            values: field1,
            shape: field2,
        };
        return message;
    },
};
exports.GameData = {
    encode(message) {
        const view = bebop_1.BebopView.getInstance();
        view.startWriting();
        this.encodeInto(message, view);
        return view.toArray();
    },
    encodeInto(message, view) {
        {
            const length0 = message.levelData.length;
            view.writeUint32(length0);
            for (let i0 = 0; i0 < length0; i0++) {
                exports.LevelData.encodeInto(message.levelData[i0], view);
            }
        }
        view.writeGuid(message.myId);
    },
    decode(buffer) {
        const view = bebop_1.BebopView.getInstance();
        view.startReading(buffer);
        return this.readFrom(view);
    },
    readFrom(view) {
        let field0;
        {
            let length0 = view.readUint32();
            field0 = new Array(length0);
            for (let i0 = 0; i0 < length0; i0++) {
                let x0;
                x0 = exports.LevelData.readFrom(view);
                field0[i0] = x0;
            }
        }
        let field1;
        field1 = view.readGuid();
        let message = {
            levelData: field0,
            myId: field1,
        };
        return message;
    },
};
exports.NewLevelMsg = {
    opcode: 0x13,
    encode(message) {
        const view = bebop_1.BebopView.getInstance();
        view.startWriting();
        this.encodeInto(message, view);
        return view.toArray();
    },
    encodeInto(message, view) {
        view.writeInt32(message.levelCount);
    },
    decode(buffer) {
        const view = bebop_1.BebopView.getInstance();
        view.startReading(buffer);
        return this.readFrom(view);
    },
    readFrom(view) {
        let field0;
        field0 = view.readInt32();
        let message = {
            levelCount: field0,
        };
        return message;
    },
};
exports.ResetMsg = {
    opcode: 0x10,
    encode(message) {
        const view = bebop_1.BebopView.getInstance();
        view.startWriting();
        this.encodeInto(message, view);
        return view.toArray();
    },
    encodeInto(message, view) {
        view.writeUint32(message.ghostResetPoints.size);
        for (const [k0, v0] of message.ghostResetPoints) {
            view.writeString(k0);
            exports.Position.encodeInto(v0, view);
        }
        view.writeUint32(message.playerResetPoints.size);
        for (const [k0, v0] of message.playerResetPoints) {
            view.writeGuid(k0);
            exports.Position.encodeInto(v0, view);
        }
        view.writeUint32(message.playerLives.size);
        for (const [k0, v0] of message.playerLives) {
            view.writeGuid(k0);
            view.writeInt64(v0);
        }
    },
    decode(buffer) {
        const view = bebop_1.BebopView.getInstance();
        view.startReading(buffer);
        return this.readFrom(view);
    },
    readFrom(view) {
        let field0;
        {
            let length0 = view.readUint32();
            field0 = new Map();
            for (let i0 = 0; i0 < length0; i0++) {
                let k0;
                let v0;
                k0 = view.readString();
                v0 = exports.Position.readFrom(view);
                field0.set(k0, v0);
            }
        }
        let field1;
        {
            let length0 = view.readUint32();
            field1 = new Map();
            for (let i0 = 0; i0 < length0; i0++) {
                let k0;
                let v0;
                k0 = view.readGuid();
                v0 = exports.Position.readFrom(view);
                field1.set(k0, v0);
            }
        }
        let field2;
        {
            let length0 = view.readUint32();
            field2 = new Map();
            for (let i0 = 0; i0 < length0; i0++) {
                let k0;
                let v0;
                k0 = view.readGuid();
                v0 = view.readInt64();
                field2.set(k0, v0);
            }
        }
        let message = {
            ghostResetPoints: field0,
            playerResetPoints: field1,
            playerLives: field2,
        };
        return message;
    },
};
exports.GhostMoveMsg = {
    opcode: 0x6,
    encode(message) {
        const view = bebop_1.BebopView.getInstance();
        view.startWriting();
        this.encodeInto(message, view);
        return view.toArray();
    },
    encodeInto(message, view) {
        view.writeUint32(message.ghostPositions.size);
        for (const [k0, v0] of message.ghostPositions) {
            view.writeString(k0);
            exports.Position.encodeInto(v0, view);
        }
    },
    decode(buffer) {
        const view = bebop_1.BebopView.getInstance();
        view.startReading(buffer);
        return this.readFrom(view);
    },
    readFrom(view) {
        let field0;
        {
            let length0 = view.readUint32();
            field0 = new Map();
            for (let i0 = 0; i0 < length0; i0++) {
                let k0;
                let v0;
                k0 = view.readString();
                v0 = exports.Position.readFrom(view);
                field0.set(k0, v0);
            }
        }
        let message = {
            ghostPositions: field0,
        };
        return message;
    },
};
exports.GameOverMsg = {
    opcode: 0x12,
    encode(message) {
        const view = bebop_1.BebopView.getInstance();
        view.startWriting();
        this.encodeInto(message, view);
        return view.toArray();
    },
    encodeInto(message, view) {
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
    decode(buffer) {
        const view = bebop_1.BebopView.getInstance();
        view.startReading(buffer);
        return this.readFrom(view);
    },
    readFrom(view) {
        let message = {};
        const length = view.readMessageLength();
        const end = view.index + length;
        while (true) {
            switch (view.readByte()) {
                case 0:
                    return message;
                case 1:
                    message.reason = view.readUint32();
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
exports.JoinMsg = {
    opcode: 0x4,
    encode(message) {
        const view = bebop_1.BebopView.getInstance();
        view.startWriting();
        this.encodeInto(message, view);
        return view.toArray();
    },
    encodeInto(message, view) {
        const pos = view.reserveMessageLength();
        const start = view.length;
        if (message.session != null) {
            view.writeByte(1);
            exports.SessionMsg.encodeInto(message.session, view);
        }
        if (message.algorithms != null) {
            view.writeByte(2);
            exports.GhostAlgorithms.encodeInto(message.algorithms, view);
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
    decode(buffer) {
        const view = bebop_1.BebopView.getInstance();
        view.startReading(buffer);
        return this.readFrom(view);
    },
    readFrom(view) {
        let message = {};
        const length = view.readMessageLength();
        const end = view.index + length;
        while (true) {
            switch (view.readByte()) {
                case 0:
                    return message;
                case 1:
                    message.session = exports.SessionMsg.readFrom(view);
                    break;
                case 2:
                    message.algorithms = exports.GhostAlgorithms.readFrom(view);
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
exports.RewardMsg = {
    opcode: 0x15,
    encode(message) {
        const view = bebop_1.BebopView.getInstance();
        view.startWriting();
        this.encodeInto(message, view);
        return view.toArray();
    },
    encodeInto(message, view) {
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
            exports.Position.encodeInto(message.newSelfState, view);
        }
        if (message.newGhostState != null) {
            view.writeByte(4);
            view.writeUint32(message.newGhostState.size);
            for (const [k0, v0] of message.newGhostState) {
                view.writeString(k0);
                exports.Position.encodeInto(v0, view);
            }
        }
        view.writeByte(0);
        const end = view.length;
        view.fillMessageLength(pos, end - start);
    },
    decode(buffer) {
        const view = bebop_1.BebopView.getInstance();
        view.startReading(buffer);
        return this.readFrom(view);
    },
    readFrom(view) {
        let message = {};
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
                    message.newSelfState = exports.Position.readFrom(view);
                    break;
                case 4:
                    {
                        let length0 = view.readUint32();
                        message.newGhostState = new Map();
                        for (let i0 = 0; i0 < length0; i0++) {
                            let k0;
                            let v0;
                            k0 = view.readString();
                            v0 = exports.Position.readFrom(view);
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
exports.ErrorMsg = {
    opcode: 0x1,
    encode(message) {
        const view = bebop_1.BebopView.getInstance();
        view.startWriting();
        this.encodeInto(message, view);
        return view.toArray();
    },
    encodeInto(message, view) {
        view.writeString(message.errorMessage);
    },
    decode(buffer) {
        const view = bebop_1.BebopView.getInstance();
        view.startReading(buffer);
        return this.readFrom(view);
    },
    readFrom(view) {
        let field0;
        field0 = view.readString();
        let message = {
            errorMessage: field0,
        };
        return message;
    },
};
exports.NewGameMsg = {
    opcode: 0x14,
    encode(message) {
        const view = bebop_1.BebopView.getInstance();
        view.startWriting();
        this.encodeInto(message, view);
        return view.toArray();
    },
    encodeInto(message, view) {
        const pos = view.reserveMessageLength();
        const start = view.length;
        if (message.resetMsg != null) {
            view.writeByte(1);
            exports.ResetMsg.encodeInto(message.resetMsg, view);
        }
        view.writeByte(0);
        const end = view.length;
        view.fillMessageLength(pos, end - start);
    },
    decode(buffer) {
        const view = bebop_1.BebopView.getInstance();
        view.startReading(buffer);
        return this.readFrom(view);
    },
    readFrom(view) {
        let message = {};
        const length = view.readMessageLength();
        const end = view.index + length;
        while (true) {
            switch (view.readByte()) {
                case 0:
                    return message;
                case 1:
                    message.resetMsg = exports.ResetMsg.readFrom(view);
                    break;
                default:
                    view.index = end;
                    return message;
            }
        }
    },
};
exports.ExitMsg = {
    opcode: 0x3,
    encode(message) {
        const view = bebop_1.BebopView.getInstance();
        view.startWriting();
        this.encodeInto(message, view);
        return view.toArray();
    },
    encodeInto(message, view) {
        exports.SessionMsg.encodeInto(message.session, view);
    },
    decode(buffer) {
        const view = bebop_1.BebopView.getInstance();
        view.startReading(buffer);
        return this.readFrom(view);
    },
    readFrom(view) {
        let field0;
        field0 = exports.SessionMsg.readFrom(view);
        let message = {
            session: field0,
        };
        return message;
    },
};
exports.ReconnectMsg = {
    opcode: 0x11,
    encode(message) {
        const view = bebop_1.BebopView.getInstance();
        view.startWriting();
        this.encodeInto(message, view);
        return view.toArray();
    },
    encodeInto(message, view) {
        const pos = view.reserveMessageLength();
        const start = view.length;
        if (message.session != null) {
            view.writeByte(1);
            exports.SessionMsg.encodeInto(message.session, view);
        }
        view.writeByte(0);
        const end = view.length;
        view.fillMessageLength(pos, end - start);
    },
    decode(buffer) {
        const view = bebop_1.BebopView.getInstance();
        view.startReading(buffer);
        return this.readFrom(view);
    },
    readFrom(view) {
        let message = {};
        const length = view.readMessageLength();
        const end = view.index + length;
        while (true) {
            switch (view.readByte()) {
                case 0:
                    return message;
                case 1:
                    message.session = exports.SessionMsg.readFrom(view);
                    break;
                default:
                    view.index = end;
                    return message;
            }
        }
    },
};
exports.ReadyMsg = {
    opcode: 0x8,
    encode(message) {
        const view = bebop_1.BebopView.getInstance();
        view.startWriting();
        this.encodeInto(message, view);
        return view.toArray();
    },
    encodeInto(message, view) {
        const pos = view.reserveMessageLength();
        const start = view.length;
        if (message.session != null) {
            view.writeByte(1);
            exports.SessionMsg.encodeInto(message.session, view);
        }
        if (message.ready != null) {
            view.writeByte(2);
            view.writeByte(Number(message.ready));
        }
        view.writeByte(0);
        const end = view.length;
        view.fillMessageLength(pos, end - start);
    },
    decode(buffer) {
        const view = bebop_1.BebopView.getInstance();
        view.startReading(buffer);
        return this.readFrom(view);
    },
    readFrom(view) {
        let message = {};
        const length = view.readMessageLength();
        const end = view.index + length;
        while (true) {
            switch (view.readByte()) {
                case 0:
                    return message;
                case 1:
                    message.session = exports.SessionMsg.readFrom(view);
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
exports.PlayerJoinedMsg = {
    opcode: 0x7,
    encode(message) {
        const view = bebop_1.BebopView.getInstance();
        view.startWriting();
        this.encodeInto(message, view);
        return view.toArray();
    },
    encodeInto(message, view) {
        const pos = view.reserveMessageLength();
        const start = view.length;
        if (message.playerName != null) {
            view.writeByte(1);
            view.writeString(message.playerName);
        }
        if (message.session != null) {
            view.writeByte(2);
            exports.SessionMsg.encodeInto(message.session, view);
        }
        view.writeByte(0);
        const end = view.length;
        view.fillMessageLength(pos, end - start);
    },
    decode(buffer) {
        const view = bebop_1.BebopView.getInstance();
        view.startReading(buffer);
        return this.readFrom(view);
    },
    readFrom(view) {
        let message = {};
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
                    message.session = exports.SessionMsg.readFrom(view);
                    break;
                default:
                    view.index = end;
                    return message;
            }
        }
    },
};
var GameOverReason;
(function (GameOverReason) {
    GameOverReason[GameOverReason["ExceededStrikes"] = 0] = "ExceededStrikes";
    GameOverReason[GameOverReason["ExceededGameCount"] = 1] = "ExceededGameCount";
    GameOverReason[GameOverReason["ExceededLevelCount"] = 2] = "ExceededLevelCount";
})(GameOverReason = exports.GameOverReason || (exports.GameOverReason = {}));
var MovingState;
(function (MovingState) {
    MovingState[MovingState["Up"] = 0] = "Up";
    MovingState[MovingState["Down"] = 1] = "Down";
    MovingState[MovingState["Left"] = 2] = "Left";
    MovingState[MovingState["Right"] = 3] = "Right";
})(MovingState = exports.MovingState || (exports.MovingState = {}));
exports.Position = {
    encode(message) {
        const view = bebop_1.BebopView.getInstance();
        view.startWriting();
        this.encodeInto(message, view);
        return view.toArray();
    },
    encodeInto(message, view) {
        view.writeFloat32(message.x);
        view.writeFloat32(message.y);
    },
    decode(buffer) {
        const view = bebop_1.BebopView.getInstance();
        view.startReading(buffer);
        return this.readFrom(view);
    },
    readFrom(view) {
        let field0;
        field0 = view.readFloat32();
        let field1;
        field1 = view.readFloat32();
        let message = {
            x: field0,
            y: field1,
        };
        return message;
    },
};
