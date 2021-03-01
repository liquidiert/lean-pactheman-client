using static Tensorflow.Binding;
using static Tensorflow.KerasApi;
using Tensorflow;
using NumSharp;
using System;
using System.IO;
using System.Linq;
using PacTheMan.Models;
using lean_pactheman_client;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace lean_pactheman_client.DQN {

    /// <summary>
    /// Tuple of state, action, reward, done, next state
    /// </summary>
    using Experience = Tuple<InputVector, int, float, bool, InputVector>;

    public class ExperienceBuffer {
        Queue<Experience> buffer { get; set; }
        public int Length { get => buffer.Count; }

        public ExperienceBuffer(int capacity) {
            buffer = new Queue<Experience>(capacity: capacity);
        }

        public void Add(Experience exp) {
            buffer.Enqueue(exp);
        }

        public List<Experience> Sample(int batchSize) {
            List<int> indices = new List<int>();
            foreach (var i in range(0, batchSize)) {
                indices.Add(new Random().Next(0, Length));
            }
            return buffer.Where((tuple, indx) => indices.Contains(indx)).ToList();
        }
    }

    public class DQN : IMove, IDisposable {

        const float GAMMA = 0.9f;
        const float ALPHA = 0.01f;
        const float EPSILON_START = 1f;
        const float EPSILON_FINAL = 0.02f;
        const float EPSILON_DECAY = 1e4f;
        const int BUFFER_SIZE = 5000;
        const int BATCH_SIZE = 32;
        const int SYNC_NETS = 10000;

        bool _disposed = false;
        static float totalReward = 0f;
        static float[] totalRewards = { };
        float epsilon = EPSILON_START;
        long frameId = 0;

        ExperienceBuffer expBuffer { get; set; }
        DQNModel net { get; set; }
        DQNModel targetNet { get; set; }
        Tensorflow.Keras.Optimizers.OptimizerV2 optimizer { get; set; }

        public DQN() {
            expBuffer = new ExperienceBuffer(BUFFER_SIZE);

            net = new DQNModel();
            targetNet = new DQNModel();

            optimizer = keras.optimizers.Adam();

        }

        static void _reset() {
            totalReward = 0f;
        }

        async Task<float?> chooseAction(PlayerInfo info, InputVector input, float epsilon = 0f) {
            float? doneReward = null;
            MovingState actionToTake;
            if (new Random().NextDouble() < epsilon) {
                actionToTake = Constants.ACTION_SPACE[new Random().Next(0, Constants.ACTION_SPACE.Length)];
                Console.WriteLine($"choose random action: {actionToTake}");
            } else {
                tf.enable_eager_execution();
                try {
                    var qVals = net.Apply(input.Tensor);
                    var maxValIndx = tf.argmax(qVals).numpy(); // returns index of maximum softmax output
                    actionToTake = Constants.ACTION_SPACE[(int)maxValIndx.GetInt64(0)];
                    Console.WriteLine($"choose optimal action: {actionToTake}");
                } catch (TensorflowException ex) {
                    Console.WriteLine(ex.ToString());
                    actionToTake = Constants.ACTION_SPACE[new Random().Next(0, Constants.ACTION_SPACE.Length)];
                }
            }

            // await playerstate update
            await PlayerMediator.ReceivePlayerStateUpdate(new Velocity().FromMovingState(actionToTake));
            var result = GameState.Instance.GainedRewardAndNewState;

            if (result == null) return null;

            totalReward += result.Reward ?? 0f;
            expBuffer.Add(new Experience(input, actionToTake.GetHashCode(), result.Reward ?? 0f,
                false, new InputVector((Position)result.NewSelfState, result.NewGhostState)));

            if (result.Done ?? false) {
                doneReward = totalReward;
                _reset();
            }

            return doneReward;
        }

        Tensor calculateLoss() {
            var samples = expBuffer.Sample(BATCH_SIZE);
            var states = new Tensor(samples.Select(s => s.Item1.Tensor).ToArray());
            var nextStates = new Tensor(samples.Select(s => s.Item5.Tensor).ToArray());
            var actions = tf.constant(samples.Select(s => s.Item2).ToArray());
            var rewards = tf.constant(samples.Select(s => s.Item3).ToArray());
            var doneMask = samples.Where(s => !s.Item4).ToArray();

            var stateActionValues = tf.squeeze(tf.gather(net.Apply(states), tf.expand_dims(actions, -1)));
            var nextStateValues = tf.reduce_max(targetNet.Apply(nextStates));
            tf.boolean_mask(nextStateValues, doneMask);

            var expectedStateActionValues = nextStateValues * GAMMA + rewards;

            return tf.reduce_sum(tf.pow(expectedStateActionValues - stateActionValues, 2f) / (2f * BATCH_SIZE));
        }

        void syncWeights() {
            var saver = tf.train;
            //saver.save(session, "./interfaces/DQN/weights.meta");
            File.Delete("./Interfaces/DQN/weights.meta");
        }

        float calcTotalMean() {
            return totalRewards.Aggregate((prev, next) => prev + next) / totalRewards.Length;
        }

        public async void PerformMoveAsync(PlayerInfo info) {
            tf.enable_eager_execution();
            frameId++;
            epsilon = EPSILON_FINAL > EPSILON_START - frameId / EPSILON_DECAY ? EPSILON_FINAL : EPSILON_START - frameId / EPSILON_DECAY;
            Console.WriteLine($"epsilon: {epsilon}");
            var reward = await chooseAction(info, new InputVector(), epsilon);

            if (reward != null) {
                totalRewards.Append((float)reward);
                var mean = calcTotalMean();
                Console.WriteLine(mean);
            }

            if (expBuffer.Length < BUFFER_SIZE) return;

            if (frameId % SYNC_NETS == 0) syncWeights();

            using var g = tf.GradientTape();
            var loss = calculateLoss();

            var gradients = g.gradient(loss, net.trainable_variables);

            optimizer.apply_gradients(zip(gradients, net.trainable_variables.Select(x => x as ResourceVariable)));
        }

        public void Dispose() => Dispose(true);

        protected void Dispose(bool disposing) {
            if (_disposed) return;

            if (disposing) {
                SaveModel();
                //session.Dispose();
            }

            _disposed = true;

        }

        void SaveModel() {
            /* var saver = tf.train.Saver();
            var save_path = saver.save(session, "./Interfaces/DQN/model.ckpt");
            tf.train.write_graph(session.graph, "./Interfaces/DQN", "model.pbtxt", as_text: true);

            FreezeGraph.freeze_graph(input_graph: "./Interfaces/DQN/model.pbtxt",
                input_saver: "",
                input_binary: false,
                input_checkpoint: "./Interfaces/DQN/model.ckpt",
                output_node_names: "Softmax",
                restore_op_name: "save/restore_all",
                filename_tensor_name: "save/Const:0",
                output_graph: "./Interfaces/DQN/model.pb",
                clear_devices: true,
                initializer_nodes: ""); */
        }
    }
}