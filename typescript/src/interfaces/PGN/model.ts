import * as tf from "@tensorflow/tfjs-node-gpu";

const model = tf.sequential({
    layers: [
        tf.layers.conv2d({ inputShape: [22, 19, 1], filters: 3, kernelSize: 3}),
        tf.layers.conv2d({ filters: 1, kernelSize: 3, strides: 2}),
        tf.layers.reshape({ targetShape: [72] }),
        tf.layers.dense({ units: 512, activation: "relu6" }),
        tf.layers.dense({ units: 256, activation: "relu6" }),
        tf.layers.dense({ units: 4, activation: "softmax" })
],
});

export default model;
