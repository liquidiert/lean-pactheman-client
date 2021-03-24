import { PlayerInfo } from "../../classes/player";
import IMove, { MoveResult } from "../../iMove";
import * as tf from "@tensorflow/tfjs-node-gpu";
import fs from "fs";
import model from "../PGN/model";
import GameState from "../../classes/gameState";
import { IPosition, MovingState } from "../../models/pactheman.models";
import { Constants } from "../..";
import InputVector from "../PGN/inputVector";
import Velocity from "../../classes/velocity";
import PlayerMediator from "../../classes/playerMediator";
import PositionExtended from "../../utils/extensions/positionExtensions";
import MapReader from "../../utils/mapReader";

export default class PGN extends IMove {

    GAMMA = 0.95;
    LEARNING_RATE = 0.001;
    ENTROPY_BETA = 0.03;
    BATCH_SIZE = 8;

    net: tf.Sequential | tf.LayersModel | null = null;
    optimizer: tf.AdamOptimizer = tf.train.adam(this.LEARNING_RATE);

    stepId = 0;
    rewardSum = 0;
    lastAction: MovingState | null = null;
    lastPosition: PositionExtended | null = null;

    batchStates: InputVector[] = [];
    batchActions: number[] = [];
    batchScales: number[] = [];

    constructor() {
        super();
        this.setNet();

        // save model on close
        GameState.Instance.onReset.subscribe(() => this._optimize());
        GameState.Instance.onNewGame.subscribe(this._reset);
        GameState.Instance.onGameOver.subscribe(async () => await this.saveModel());
    }

    _reset() {
        this.stepId = 0;
        this.rewardSum = 0;
    }

    _optimize() {
        console.log(`optimize! ${new Date().toLocaleString()}`);

        GameState.Instance.onReset.one(() => {

            if (this.lastAction !== null) this._addUpdateResult(this.lastAction);

            let cost = this.optimizer.minimize(() => {
                let input = tf.tensor4d(this.batchStates.map(s => s.tensorlike), [this.batchStates.length, 22, 19, 1]);
                let logits = this.net?.predict(input) as tf.Tensor;
                let logProb = tf.logSoftmax(logits, 1);
                let probValues = logProb.gather(tf.tensor1d(this.batchActions, "int32"), 1)
                    .slice([0, 0], [1, this.batchStates.length]).reshape([this.batchStates.length, 1]);
                let logProbActions = tf.tensor2d(this.batchScales, [this.batchStates.length, 1]).mul(probValues);
                let lossPolicy = logProbActions.mean().neg();

                let prob = tf.softmax(logits, 1);
                let entropy = -((prob.mul(logProb)).sum(1).mean().arraySync() as number);
                let entropyLoss = entropy * -this.ENTROPY_BETA;

                return lossPolicy.add(entropyLoss);
            }, true);

            console.log(`cost: ${cost}`)

            this.batchStates.length = 0;
            this.batchActions.length = 0;
            this.batchScales.length = 0;

            console.log("cleared buffers")
        });
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
        this.net.predict(tf.zeros([1, 22, 19, 1])); // warmup
    }

    async performMoveAsync(info: PlayerInfo) {
        this.stepId++;

        let predTensor = this.net?.predict(new InputVector().asTensor) as tf.Tensor;
        let prediction = (predTensor.arraySync() as number[][])[0];
        console.log(prediction);
        let bestActionIndx = prediction
            .reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
        // console.log(bestActionIndx);
        let actionToTake = Constants.ACTION_SPACE[bestActionIndx];
        this.lastAction = actionToTake;

        await PlayerMediator.receivePlayerStateUpdate(Velocity.fromMovingState(actionToTake));

        this._addUpdateResult(actionToTake);

        this.lastPosition = info.position;

    }

    _addUpdateResult(actionToTake: MovingState, additionalReward = 0) {
        let result = GameState.Instance.gainedRewardAndNewState;
        let reward = result.reward ?? 0;
        if (reward != 0) console.log(`received reward: ${reward}`);
        reward += additionalReward;

        this.rewardSum += reward;
        let baseline = this.rewardSum / (this.stepId);
        this.batchStates.push(InputVector.fromStateUpdate(result.newSelfState ?? { x: 0, y: 0 },
            result.newGhostState ?? new Map<string, IPosition>()));
        this.batchActions.push(actionToTake.valueOf());
        this.batchScales.push((reward) - baseline);
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
