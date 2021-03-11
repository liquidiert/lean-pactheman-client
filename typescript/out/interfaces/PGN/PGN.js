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
const tf = __importStar(require("@tensorflow/tfjs-node-gpu"));
const fs_1 = __importDefault(require("fs"));
const model_1 = __importDefault(require("../PGN/model"));
const gameState_1 = __importDefault(require("../../classes/gameState"));
const pactheman_models_1 = require("../../models/pactheman.models");
const __1 = require("../..");
const lodash_1 = require("lodash");
const inputVector_1 = __importDefault(require("../DQN/inputVector"));
const velocity_1 = __importDefault(require("../../classes/velocity"));
const playerMediator_1 = __importDefault(require("../../classes/playerMediator"));
class PGN extends iMove_1.default {
    constructor() {
        super();
        this.GAMMA = 0.95;
        this.LEARNING_RATE = 0.001;
        this.ENTROPY_BETA = 0.01;
        this.BATCH_SIZE = 200;
        this.EPSILON_START = 1.0;
        this.EPSILON_FINAL = 0.6;
        this.EPSILON_DECAY = 1e4;
        this.epsilon = this.EPSILON_START;
        this.net = null;
        this.optimizer = tf.train.adam(this.LEARNING_RATE);
        this.stepId = 0;
        this.stepRewards = [];
        this.rewardSum = 0;
        this.batchStates = [];
        this.batchActions = [];
        this.batchScales = [];
        this.setNet();
        gameState_1.default.Instance.onReset.subscribe(this._reset);
        gameState_1.default.Instance.onNewLevel.subscribe(this._reset);
        gameState_1.default.Instance.onNewGame.subscribe(this._reset);
        // save model on close
        gameState_1.default.Instance.onGameOver.subscribe(async () => await this.saveModel());
    }
    _reset() {
        this.epsilon = this.EPSILON_START;
    }
    async setNet() {
        let saves = fs_1.default.readdirSync("src/interfaces/PGN/saves");
        if (saves.length != 0 && saves.includes("model.json")) {
            this.net = await tf.loadLayersModel("file://src/interfaces/PGN/saves/model.json");
            console.log("loaded net from saved model");
        }
        else if (fs_1.default.readdirSync("src/interfaces/PGN/saves/old").length != 0) {
            this.net = await tf.loadLayersModel("file://src/interfaces/PGN/saves/old/model.json");
            console.log("loaded net from old model");
        }
        else {
            this.net = model_1.default;
        }
    }
    async performMoveAsync(info) {
        this.stepId++;
        this.epsilon = this.EPSILON_FINAL > this.EPSILON_START - this.stepId / this.EPSILON_DECAY ?
            this.EPSILON_FINAL : this.EPSILON_START - this.stepId / this.EPSILON_DECAY;
        let actionToTake;
        if (Math.random() < this.epsilon) {
            actionToTake = lodash_1.sample(__1.Constants.ACTION_SPACE) ?? pactheman_models_1.MovingState.Up;
        }
        else {
            actionToTake = __1.Constants.ACTION_SPACE[this.net?.predict(new inputVector_1.default().asTensor).argMax(1).arraySync()];
        }
        await playerMediator_1.default.receivePlayerStateUpdate(velocity_1.default.fromMovingState(actionToTake));
        var result = gameState_1.default.Instance.gainedRewardAndNewState;
        this.rewardSum += result.reward ?? 0;
        let baseline = this.rewardSum / (this.stepId + 1);
        this.batchStates.push(inputVector_1.default.fromStateUpdate(result.newSelfState ?? { x: 0, y: 0 }, result.newGhostState ?? new Map()));
        this.batchActions.push(actionToTake.valueOf());
        this.batchScales.push((result.reward ?? 0) - baseline);
        if (this.batchStates.length < this.BATCH_SIZE)
            return;
        console.log(`optimize! ${new Date().toLocaleString()}`);
        this.optimizer.minimize(() => tf.tidy(() => {
            let logits = this.net?.predict(tf.tensor2d(this.batchStates.map(s => s.tensorlike), [this.BATCH_SIZE, 10]));
            let logProb = tf.logSoftmax(logits, 1);
            let probValues = logProb.gather(tf.tensor1d(this.batchActions, "int32"), 1).slice([0, 0], [1, this.BATCH_SIZE]).reshape([this.BATCH_SIZE, 1]);
            let logProbActions = tf.tensor2d(this.batchScales, [this.BATCH_SIZE, 1]).mul(probValues);
            let lossPolicy = logProbActions.mean().neg();
            let prob = tf.softmax(logits, 1);
            let entropy = (prob.mul(logProb)).sum(1).mean().neg();
            let entropyLoss = entropy.mul(-this.ENTROPY_BETA);
            return lossPolicy.add(entropyLoss);
        }));
        this.batchStates.length = 0;
        this.batchActions.length = 0;
        this.batchScales.length = 0;
        console.log("cleared buffers");
    }
    async saveModel() {
        console.log("saving net");
        try {
            fs_1.default.rmSync("src/interfaces/PGN/saves/old/model.json");
            fs_1.default.rmSync("src/interfaces/PGN/saves/old/weights.bin");
        }
        catch (ex) {
            // swallow
            try {
                fs_1.default.renameSync("src/interfaces/PGN/saves/model.json", "src/interfaces/PGN/saves/old/model.json");
                fs_1.default.renameSync("src/interfaces/PGN/saves/weights.bin", "src/interfaces/PGN/saves/old/weights.bin");
            }
            catch (ex) {
                // swallow
            }
        }
        await this.net?.save("file://src/interfaces/PGN/saves/");
        console.log("saved net");
        process.exit(0);
    }
}
exports.default = PGN;
