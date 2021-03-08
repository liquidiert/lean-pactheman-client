import { PlayerInfo } from "../../classes/player";
import IMove, { MoveResult } from "../../iMove";
import * as tf from "@tensorflow/tfjs-node";
import fs from "fs";
import model from "../PGN/model";
import GameState from "../../classes/gameState";
import { IPosition, MovingState } from "../../models/pactheman.models";
import { Constants } from "../..";
import { sample } from "lodash";
import InputVector from "../DQN/inputVector";
import Velocity from "../../classes/velocity";
import PlayerMediator from "../../classes/playerMediator";

export default class PGN extends IMove {

    GAMMA = 0.95;
    LEARNING_RATE = 0.001;
    ENTROPY_BETA = 0.01;
    BATCH_SIZE = 100;
    EPSILON_START = 1.0;
    EPSILON_FINAL = 0.6;
    EPSILON_DECAY = 1e4;
    epsilon = this.EPSILON_START;

    net: tf.Sequential | tf.LayersModel | null = null;
    optimizer: tf.AdamOptimizer = tf.train.adam(this.LEARNING_RATE);

    stepId = 0;
    stepRewards = [];
    rewardSum = 0;

    batchStates: InputVector[] = [];
    batchActions: number[] = [];
    batchScales: number[] = [];

    constructor() {
        super();
        this.setNet();
        GameState.Instance.onReset.subscribe(this._reset);
        GameState.Instance.onNewLevel.subscribe(this._reset);
        GameState.Instance.onNewGame.subscribe(this._reset);

        // save model on close
        GameState.Instance.onGameOver.subscribe(async () => await this.saveModel());
    }

    private _reset() {
        this.epsilon = this.EPSILON_START;
    }

    async setNet() {
        let saves = fs.readdirSync("src/interfaces/PGN/saves");
        if (saves.length != 0 && saves.includes("model.json")) {
            this.net = await tf.loadLayersModel("file://src/interfaces/PGN/saves/model.json");
            console.log("loaded net from saved model");
        } else if (fs.readdirSync("src/interfaces/PGN/saves/old").length != 0) {
            this.net = await tf.loadLayersModel("file://src/interfaces/PGN/saves/old/model.json");
            console.log("loaded net from old model");
        } else {
            this.net = model;
        }
    }

    async performMoveAsync(info: PlayerInfo) {
        this.stepId++;

        this.epsilon = this.EPSILON_FINAL > this.EPSILON_START - this.stepId / this.EPSILON_DECAY ?
            this.EPSILON_FINAL : this.EPSILON_START - this.stepId / this.EPSILON_DECAY;

        let actionToTake: MovingState;
        if (Math.random() < this.epsilon) {
            actionToTake = sample(Constants.ACTION_SPACE) ?? MovingState.Up;
        } else {
            actionToTake = Constants.ACTION_SPACE[(this.net?.predict(new InputVector().asTensor) as tf.Tensor).argMax(1).arraySync() as number];
        }

        await PlayerMediator.receivePlayerStateUpdate(Velocity.fromMovingState(actionToTake));
        var result = GameState.Instance.gainedRewardAndNewState;

        this.rewardSum += result.reward ?? 0;
        let baseline = this.rewardSum / (this.stepId + 1);
        this.batchStates.push(InputVector.fromStateUpdate(result.newSelfState ?? { x: 0, y: 0 },
            result.newGhostState ?? new Map<string, IPosition>()));
        this.batchActions.push(actionToTake.valueOf());
        this.batchScales.push((result.reward ?? 0) - baseline);

        if (this.batchStates.length < this.BATCH_SIZE) return;

        this.optimizer.minimize(() => {
            let logits = this.net?.predict(tf.tensor2d(this.batchStates.map(s => s.tensorlike), [this.BATCH_SIZE, 10])) as tf.Tensor;
            let logProb = tf.logSoftmax(logits, 1);
            let probValues = logProb.gather(tf.tensor1d(this.batchActions, "int32"), 1).slice([0, 0], [1, this.BATCH_SIZE]).reshape([this.BATCH_SIZE, 1]);
            let logProbActions = tf.tensor2d(this.batchScales, [this.BATCH_SIZE, 1]).mul(probValues);
            let lossPolicy = logProbActions.mean().neg();

            let prob = tf.softmax(logits, 1);
            let entropy = (prob.mul(logProb)).sum(1).mean().neg();
            let entropyLoss = entropy.mul(-this.ENTROPY_BETA);
            
            return lossPolicy.add(entropyLoss);
        });

        this.batchStates.length = 0;
        this.batchActions.length = 0;
        this.batchScales.length = 0;
    }

    async saveModel() {
        console.log("saving net");
        try {
            fs.rmSync("src/interfaces/PGN/saves/old/model.json");
            fs.rmSync("src/interfaces/PGN/saves/old/weights.bin");
        } catch (ex) {
            // swallow
            try {
                fs.renameSync("src/interfaces/PGN/saves/model.json", "src/interfaces/PGN/saves/old/model.json");
                fs.renameSync("src/interfaces/PGN/saves/weights.bin", "src/interfaces/PGN/saves/old/weights.bin");
            } catch (ex) {
                // swallow
            }
        }
        await this.net?.save("file://src/interfaces/PGN/saves/");
        console.log("saved net");
        process.exit(0);
    }

}