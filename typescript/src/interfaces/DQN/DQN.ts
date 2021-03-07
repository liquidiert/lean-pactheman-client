import IMove from "../../iMove";
import { PlayerInfo } from "../../classes/player";
import PlayerMediator from "../../classes/playerMediator";
import InputVector from "./inputVector";
import model from "./model";
import fs from "fs";
import * as tf from "@tensorflow/tfjs-node";
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

    sample(batchSize: number): Experience[] {
        return cloneDeep(sampleSize(this.buffer, batchSize));
    }
}

export default class DQN extends IMove {

    GAMMA = 0.9;
    ALPHA = 0.01;
    EPSILON_START = 1.0;
    EPSILON_FINAL = 0.02;
    EPSILON_DECAY = 1e3;
    BUFFER_SIZE = 300;
    BATCH_SIZE = 32;
    SYNC_NETS = 250;

    totalReward = 0;
    totalRewards: number[] = [];
    epsilon = this.EPSILON_START;
    frameId = 0;

    expBuffer: ExperienceBuffer;
    net: tf.Sequential;
    targetNet: tf.LayersModel | null = null;
    optimizer: tf.AdamOptimizer = tf.train.adam(this.ALPHA);

    constructor() {
        super();
        this.expBuffer = new ExperienceBuffer(this.BUFFER_SIZE);
        this.net = model;
        this.syncWeights();
    }

    private _reset() {
        this.totalReward = 0;
    }

    async chooseAction(input: InputVector, epsilon = 0) {
        let doneReward = null;
        let actionToTake: MovingState;

        if (Math.random() < epsilon) {
            actionToTake = sample(Constants.ACTION_SPACE) ?? MovingState.Up;
        } else {
            let qVals = this.net.predict(input.asTensor) as tf.Tensor;
            let maxValIndx = qVals.argMax(1).arraySync();
            actionToTake = Constants.ACTION_SPACE[maxValIndx as number];
            console.log(`choose optimal action: ${actionToTake}`)
        }

        await PlayerMediator.receivePlayerStateUpdate(Velocity.fromMovingState(actionToTake));
        var result = GameState.Instance.gainedRewardAndNewState;

        if (result == null) return null;
        console.log(`received reward: ${result.reward}`);

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
        let dones = tf.tensor(samples.map(s => s.d));

        this.optimizer.minimize(() => {

            // prediction
            let forward = this.net.predict(tf.tensor(states, [this.BATCH_SIZE, 10])) as tf.Tensor<tf.Rank>;

            // gather values for taken actions; a little hack cause tf can't gather in specific dimension, only in different axes
            let stateActionValues = forward.gather(actions, 1).slice([0, 0], [1, this.BATCH_SIZE]).reshape([this.BATCH_SIZE, 1]);
            
            // get values for next states from target net
            let nextStateValues = (this.targetNet?.predict(tf.tensor(nextStates, [this.BATCH_SIZE, 10])) as tf.Tensor<tf.Rank>).max(1, true);
            
            // bellman approx
            let expectedStateActionValues = nextStateValues.mul(this.GAMMA).add(rewards);

            // loss
            return tf.sum(tf.pow(expectedStateActionValues.sub(stateActionValues), 2).div(2 * this.BATCH_SIZE));
        });
    }

    async syncWeights() {
        await this.net.save("file://out/interfaces/DQN/saves/weights");
        this.targetNet = await tf.loadLayersModel("file://out/interfaces/DQN/saves/weights/model.json");
        fs.rmdirSync("out/interfaces/DQN/saves/weights", { recursive: true });
        console.log("synced weights");
    }

    calcTotalMean() {
        return this.totalRewards.reduce((prev, curr) => prev + curr) / this.totalRewards.length;
    }

    async performMoveAsync(info: PlayerInfo) {
        this.frameId++;
        this.epsilon = this.EPSILON_FINAL > this.EPSILON_START - this.frameId / this.EPSILON_DECAY ? this.EPSILON_FINAL : this.EPSILON_START - this.frameId / this.EPSILON_DECAY;
        console.log(`epsilon: ${this.epsilon}`);

        let reward = await this.chooseAction(new InputVector(), this.epsilon);

        if (reward != null) {
            this.totalRewards.push(reward ?? 0);
            var mean = this.calcTotalMean();
            console.log(`mean reward: ${mean}`);
        }

        if (this.expBuffer.length < this.BUFFER_SIZE) return;

        if (this.frameId % this.SYNC_NETS == 0) this.syncWeights();

        await this.runOptimization();
    }

}