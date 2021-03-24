import IMove from "../../iMove";
import { PlayerInfo } from "../../classes/player";
import PlayerMediator from "../../classes/playerMediator";
import InputVector from "../PGN/inputVector";
import model from "../PGN/model";
import fs from "fs";
import * as tf from "@tensorflow/tfjs-node-gpu";
import { sampleSize, cloneDeep, sample } from "lodash";
import { IPosition, MovingState } from "../../models/pactheman.models";
import { Constants } from "../../";
import Velocity from "../../classes/velocity";
import GameState from "../../classes/gameState";

type Experience = { s: InputVector, a: number, r: number, d: boolean, sN: InputVector };

class ExperienceBuffer {
    buffer: Experience[];
    get length(): number { return this.buffer.length; }
    private capacity: number;

    constructor(capacity: number) {
        this.buffer = [];
        this.capacity = capacity;
    }

    add(exp: Experience) {
        // ensure fresh data
        if (this.length >= this.capacity) {
            this.buffer.shift();
        }
        this.buffer.push(exp);
    }

    remove(howMany: number) {
        for (let i = 0; i < howMany; i++) {
            this.buffer.shift();
        }
    }

    clear() {
        this.buffer.length = 0;
    }

    sample(batchSize: number): Experience[] {
        return cloneDeep(sampleSize(this.buffer, batchSize));
    }
}

export default class DQN extends IMove {

    GAMMA = 0.9;
    ALPHA = 0.01;
    EPSILON_START = 1.0;
    EPSILON_FINAL = 0.05;
    EPSILON_DECAY = 1e3;
    BUFFER_SIZE = 300;
    BATCH_SIZE = 64;
    SYNC_NETS = 250;

    totalReward = 0;
    totalRewards: number[] = [];
    epsilon = this.EPSILON_START;
    frameId = 0;

    expBuffer: ExperienceBuffer;
    net: tf.Sequential | tf.LayersModel | null = null;
    targetNet: tf.LayersModel | null = null;
    optimizer: tf.AdamOptimizer = tf.train.adam(this.ALPHA);
    lastAction: MovingState | null = null;
    lastInput: InputVector | null = null;

    constructor() {
        super();
        this.expBuffer = new ExperienceBuffer(this.BUFFER_SIZE);
        this.setNets();
        GameState.Instance.onNewLevel.subscribe(this._reset);
        GameState.Instance.onNewGame.subscribe(() => this._resetNewGame());

        // save model on close
        GameState.Instance.onGameOver.subscribe(async () => await this.saveModel());
    }

    async setNets() {
        let saves = fs.readdirSync("src/interfaces/DQN/saves");
        if (saves.length != 0 && saves.includes("model.json")) {
            this.net = await tf.loadLayersModel("file://src/interfaces/DQN/saves/model.json");
            console.log("loaded net from saved model");
        } else if (fs.readdirSync("src/interfaces/DQN/saves/old").length != 0) {
            this.net = await tf.loadLayersModel("file://src/interfaces/DQN/saves/old/model.json");
            console.log("loaded net from old model");
        } else {
            this.net = model;
        }
        this.syncWeights();
        this.net.predict(tf.zeros([1, 22, 19, 1])); // warmup
    }

    private _reset() {
        this.totalReward = 0;
        GameState.Instance.onReset.one(() => {
            if (this.lastInput !== null && this.lastAction !== null) {
                let result = GameState.Instance.gainedRewardAndNewState;
                this.expBuffer.add({
                    s: this.lastInput,
                    a: this.lastAction.valueOf(),
                    r: result.reward ?? 0,
                    d: result.done ?? false,
                    sN: InputVector.fromStateUpdate(
                        result.newSelfState ?? { x: 0, y: 0 },
                        result.newGhostState ?? new Map<string, IPosition>()
                    )
                });
            }
        });
    }

    private _resetNewGame() {
        this.expBuffer.clear();
        this._reset();
    }

    async chooseAction(input: InputVector, epsilon = 0) {
        let doneReward = null;
        let actionToTake: MovingState;

        if (Math.random() < epsilon) {
            actionToTake = sample(Constants.ACTION_SPACE) ?? MovingState.Up;
        } else {
            let qVals = ((this.net?.predict(input.asTensor) as tf.Tensor).arraySync() as number[][])[0];
            let maxValIndx = qVals.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
            actionToTake = Constants.ACTION_SPACE[maxValIndx as number];
            if (this.lastAction !== actionToTake) console.log(`choose optimal action: ${actionToTake}`);
        }

        this.lastAction = actionToTake;

        await PlayerMediator.receivePlayerStateUpdate(Velocity.fromMovingState(actionToTake));
        let result = GameState.Instance.gainedRewardAndNewState;

        if (result == null) return null;
        if (result.reward ?? 0 != 0) {
            console.log(`received reward: ${result.reward}`);
        }

        this.totalReward += result.reward ?? 0;
        this.expBuffer.add({
            s: input,
            a: actionToTake.valueOf(),
            r: result.reward ?? 0,
            d: result.done ?? false,
            sN: InputVector.fromStateUpdate(
                result.newSelfState ?? { x: 0, y: 0 },
                result.newGhostState ?? new Map<string, IPosition>()
            )
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
        let dones = samples.map((d, indx) => !!d ? indx : -1).filter(i => i !== -1);

        // get values for next states from target net
        let nextStateValues = (this.targetNet?.predict(tf.tensor(nextStates, [this.BATCH_SIZE, 22, 19, 1])) as tf.Tensor).max(1, true);
        let maskedNextStatesValues = tf.tensor(
            (await nextStateValues.array() as number[][]).map((val, ind) => {
                if (!dones.includes(ind)) {
                    val = [0];
                }
                return val;
            })
        );

        let cost = this.optimizer.minimize(() => {
            // prediction
            let forward = this.net?.predict(tf.tensor(states, [this.BATCH_SIZE, 22, 19, 1])) as tf.Tensor<tf.Rank>;

            // gather values for taken actions; a little hack cause tf can't gather in specific dimension, only in different axes
            let stateActionValues = forward.gather(actions, 1).slice([0, 0], [1, this.BATCH_SIZE]).reshape([this.BATCH_SIZE, 1]);

            // bellman approx
            let expectedStateActionValues = maskedNextStatesValues.mul(this.GAMMA).add(rewards);

            // loss
            return tf.sum(tf.pow(expectedStateActionValues.sub(stateActionValues), 2).div(2 * this.BATCH_SIZE));
        }, true);

        // console.log(`cost: ${cost}`);
    }

    async syncWeights() {
        try {
            fs.mkdirSync("out/interfaces/DQN/saves/weights");
        } finally { // weights dir already exists
            await this.net?.save("file://out/interfaces/DQN/saves/weights");
            this.targetNet = await tf.loadLayersModel("file://out/interfaces/DQN/saves/weights/model.json");
            fs.rmdirSync("out/interfaces/DQN/saves/weights", { recursive: true });
            console.log("synced weights");
        }
    }

    async saveModel() {
        console.log("saving net");
        try {
            fs.rmSync("src/interfaces/DQN/saves/old/model.json");
            fs.rmSync("src/interfaces/DQN/saves/old/weights.bin");
        } catch (ex) {
            // swallow
            try {
                fs.renameSync("src/interfaces/DQN/saves/model.json", "src/interfaces/DQN/saves/old/model.json");
                fs.renameSync("src/interfaces/DQN/saves/weights.bin", "src/interfaces/DQN/saves/old/weights.bin");
            } catch (ex) {
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

    async performMoveAsync(info: PlayerInfo) {
        this.frameId++;
        this.epsilon = this.EPSILON_FINAL > this.EPSILON_START - this.frameId / this.EPSILON_DECAY ?
            this.EPSILON_FINAL : this.EPSILON_START - this.frameId / this.EPSILON_DECAY;
        // console.log(`epsilon: ${this.epsilon}`);

        let reward = await this.chooseAction(new InputVector(), this.epsilon);

        if (reward != null) {
            this.totalRewards.push(reward ?? 0);
            var mean = this.calcTotalMean();
            console.log(`mean reward: ${mean}`);
        }

        // if (this.expBuffer.length < this.BUFFER_SIZE) return;

        // if (this.frameId % this.SYNC_NETS == 0) this.syncWeights();

        // await this.runOptimization();
    }

}