"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const iMove_1 = __importDefault(require("../../iMove"));
const playerMediator_1 = __importDefault(require("../../classes/playerMediator"));
const inputVector_1 = __importDefault(require("./inputVector"));
const model_1 = __importDefault(require("./model"));
const fs_1 = __importDefault(require("fs"));
const tf = __importStar(require("@tensorflow/tfjs-node-gpu"));
const lodash_1 = require("lodash");
const pactheman_models_1 = require("../../models/pactheman.models");
const __1 = require("../../");
const velocity_1 = __importDefault(require("../../classes/velocity"));
const gameState_1 = __importDefault(require("../../classes/gameState"));
class ExperienceBuffer {
    constructor(capacity) {
        this.buffer = [];
        this.capacity = capacity;
    }
    get length() { return this.buffer.length; }
    add(exp) {
        // ensure fresh data
        if (this.length >= this.capacity) {
            this.buffer.shift();
        }
        this.buffer.push(exp);
    }
    remove(howMany) {
        for (let i = 0; i < howMany; i++) {
            this.buffer.shift();
        }
    }
    sample(batchSize) {
        return lodash_1.cloneDeep(lodash_1.sampleSize(this.buffer, batchSize));
    }
}
class DQN extends iMove_1.default {
    constructor() {
        super();
        this.GAMMA = 0.9;
        this.ALPHA = 0.01;
        this.EPSILON_START = 1.0;
        this.EPSILON_FINAL = 0.6;
        this.EPSILON_DECAY = 1e4;
        this.BUFFER_SIZE = 1000;
        this.BATCH_SIZE = 32;
        this.SYNC_NETS = 500;
        this.totalReward = 0;
        this.totalRewards = [];
        this.epsilon = this.EPSILON_START;
        this.frameId = 0;
        this.net = null;
        this.targetNet = null;
        this.optimizer = tf.train.adam(this.ALPHA);
        this.lastAction = null;
        this.expBuffer = new ExperienceBuffer(this.BUFFER_SIZE);
        this.setNets();
        gameState_1.default.Instance.onReset.subscribe(this._reset);
        gameState_1.default.Instance.onNewLevel.subscribe(this._reset);
        gameState_1.default.Instance.onNewGame.subscribe(this._reset);
        // save model on close
        gameState_1.default.Instance.onGameOver.subscribe(async () => await this.saveModel());
    }
    async setNets() {
        let saves = fs_1.default.readdirSync("src/interfaces/DQN/saves");
        if (saves.length != 0 && saves.includes("model.json")) {
            this.net = await tf.loadLayersModel("file://src/interfaces/DQN/saves/model.json");
            console.log("loaded net from saved model");
        }
        else if (fs_1.default.readdirSync("src/interfaces/DQN/saves/old").length != 0) {
            this.net = await tf.loadLayersModel("file://src/interfaces/DQN/saves/old/model.json");
            console.log("loaded net from old model");
        }
        else {
            this.net = model_1.default;
        }
        this.syncWeights();
    }
    _reset() {
        this.epsilon = this.EPSILON_START;
        this.totalReward = 0;
    }
    async chooseAction(input, epsilon = 0) {
        let doneReward = null;
        let actionToTake;
        if (Math.random() < epsilon) {
            actionToTake = lodash_1.sample(__1.Constants.ACTION_SPACE) ?? pactheman_models_1.MovingState.Up;
        }
        else {
            let qVals = this.net?.predict(input.asTensor);
            let maxValIndx = qVals.argMax(1).arraySync();
            actionToTake = __1.Constants.ACTION_SPACE[maxValIndx];
            if (this.lastAction !== actionToTake)
                console.log(`choose optimal action: ${actionToTake}`);
        }
        this.lastAction = actionToTake;
        await playerMediator_1.default.receivePlayerStateUpdate(velocity_1.default.fromMovingState(actionToTake));
        var result = gameState_1.default.Instance.gainedRewardAndNewState;
        if (result == null)
            return null;
        if (result.reward ?? 0 > 0) {
            console.log(`received reward: ${result.reward}`);
        }
        this.totalReward += result.reward ?? 0;
        this.expBuffer.add({
            s: input,
            a: actionToTake.valueOf(),
            r: result.reward ?? 0,
            d: result.done ?? false,
            sN: inputVector_1.default.fromStateUpdate(result.newSelfState ?? { x: 0, y: 0 }, result.newGhostState ?? new Map())
        });
        if (!!result.done) {
            doneReward = this.totalReward;
            this._reset();
        }
        return doneReward;
    }
    async runOptimization() {
        let samples = this.expBuffer.sample(this.BATCH_SIZE);
        let states = samples.map(s => s.s.tensorlike);
        let nextStates = samples.map(s => s.sN.tensorlike);
        let actions = tf.tensor1d(samples.map(s => s.a), "int32");
        let rewards = samples.map(s => s.r);
        let dones = tf.tensor(samples.map(s => s.d));
        // get values for next states from target net
        let nextStateValues = this.targetNet?.predict(tf.tensor(nextStates, [this.BATCH_SIZE, 10])).max(1, true);
        this.optimizer.minimize(() => {
            // prediction
            let forward = this.net?.predict(tf.tensor(states, [this.BATCH_SIZE, 10]));
            // gather values for taken actions; a little hack cause tf can't gather in specific dimension, only in different axes
            let stateActionValues = forward.gather(actions, 1).slice([0, 0], [1, this.BATCH_SIZE]).reshape([this.BATCH_SIZE, 1]);
            // bellman approx
            let expectedStateActionValues = nextStateValues.mul(this.GAMMA).add(rewards);
            // loss
            return tf.sum(tf.pow(expectedStateActionValues.sub(stateActionValues), 2).div(2 * this.BATCH_SIZE));
        });
    }
    async syncWeights() {
        fs_1.default.mkdirSync("out/interfaces/DQN/saves/weights");
        await this.net?.save("file://out/interfaces/DQN/saves/weights");
        this.targetNet = await tf.loadLayersModel("file://out/interfaces/DQN/saves/weights/model.json");
        fs_1.default.rmdirSync("out/interfaces/DQN/saves/weights", { recursive: true });
        console.log("synced weights");
    }
    async saveModel() {
        console.log("saving net");
        try {
            fs_1.default.rmSync("src/interfaces/DQN/saves/old/model.json");
            fs_1.default.rmSync("src/interfaces/DQN/saves/old/weights.bin");
        }
        catch (ex) {
            // swallow
            try {
                fs_1.default.renameSync("src/interfaces/DQN/saves/model.json", "src/interfaces/DQN/saves/old/model.json");
                fs_1.default.renameSync("src/interfaces/DQN/saves/weights.bin", "src/interfaces/DQN/saves/old/weights.bin");
            }
            catch (ex) {
                // swallow
            }
        }
        await this.net?.save("file://src/interfaces/DQN/saves/");
        console.log("saved net");
        process.exit(0);
    }
    calcTotalMean() {
        return this.totalRewards.reduce((prev, curr) => prev + curr) / this.totalRewards.length;
    }
    async performMoveAsync(info) {
        this.frameId++;
        this.epsilon = this.EPSILON_FINAL > this.EPSILON_START - this.frameId / this.EPSILON_DECAY ?
            this.EPSILON_FINAL : this.EPSILON_START - this.frameId / this.EPSILON_DECAY;
        // console.log(`epsilon: ${this.epsilon}`);
        let reward = await this.chooseAction(new inputVector_1.default(), this.epsilon);
        if (reward != null) {
            this.totalRewards.push(reward ?? 0);
            var mean = this.calcTotalMean();
            console.log(`mean reward: ${mean}`);
        }
        if (this.expBuffer.length < this.BUFFER_SIZE)
            return;
        this.expBuffer.remove(100);
        if (this.frameId % this.SYNC_NETS == 0)
            this.syncWeights();
        await this.runOptimization();
    }
}
exports.default = DQN;
