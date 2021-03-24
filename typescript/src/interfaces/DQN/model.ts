import * as tf from "@tensorflow/tfjs-node-gpu";

const model = tf.sequential({
    layers: [
        tf.layers.dense({ inputShape: [10], units: 357, activation: "relu" }),
        tf.layers.dense({ units: 178, activation: "relu" }),
        tf.layers.dense({ units: 4, activation: "softmax" })
    ],
});

export default model;