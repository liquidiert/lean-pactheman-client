using static Tensorflow.Binding;
using static Tensorflow.KerasApi;
using Tensorflow;
using NumSharp;
using System;
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
            for (int i = 0; i < batchSize; i++) {
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
        const float EPSILON_DECAY = 1e3f;
        const int BUFFER_SIZE = 300;
        const int BATCH_SIZE = 32;
        const int SYNC_NETS = 250;

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
            tf.enable_eager_execution();
            expBuffer = new ExperienceBuffer(BUFFER_SIZE);

            net = new DQNModel();
            targetNet = new DQNModel();

            optimizer = keras.optimizers.Adam();
        }

        static void _reset() {
            totalReward = 0f;
        }

        async Task<float?> chooseAction(InputVector input, float epsilon = 0f) {
            float? doneReward = null;
            MovingState actionToTake;
            if (new Random().NextDouble() < epsilon) {
                actionToTake = Constants.ACTION_SPACE[new Random().Next(0, Constants.ACTION_SPACE.Length)];
                // Console.WriteLine($"choose random action: {actionToTake}");
            } else {
                var qVals = net.Apply(input.Tensor);
                var maxValIndx = tf.argmax(qVals).numpy(); // returns index of maximum softmax output
                actionToTake = Constants.ACTION_SPACE[(int)maxValIndx.GetInt64(0)];
                Console.WriteLine($"choose optimal action: {actionToTake}");
            }

            // await playerstate update
            await PlayerMediator.ReceivePlayerStateUpdate(new Velocity().FromMovingState(actionToTake));
            var result = GameState.Instance.GainedRewardAndNewState;

            if (result == null) return null;
            Console.WriteLine($"received reward: {result.Reward}");

            totalReward += result.Reward ?? 0f;
            expBuffer.Add(new Experience(input, actionToTake.GetHashCode(), result.Reward ?? 0f,
                false, new InputVector((Position)result.NewSelfState, result.NewGhostState)));

            if (result.Done ?? false) {
                doneReward = totalReward;
                _reset();
            }

            return doneReward;
        }

        void runOptimization() {
            tf.enable_eager_execution();
            using var g = tf.GradientTape();

            var samples = expBuffer.Sample(BATCH_SIZE);
            var states = NDArray.FromMultiDimArray<float>(samples.Select(s => s.Item1.List).ToList().To2Dim<float, List<float>>());
            var nextStates = NDArray.FromMultiDimArray<float>(samples.Select(s => s.Item5.List).ToList().To2Dim<float, List<float>>());
            var actions = tf.constant(samples.Select(s => s.Item2).ToArray());
            var rewards = tf.constant(samples.Select(s => s.Item3).ToArray());
            var doneMask = samples.Select(s => s.Item4).ToArray();

            var forward = net.Apply(states);
            var expand = tf.expand_dims(actions, -1);
            expand = tf.cast(expand, tf.int32); // cast dtype for indices
            var gather = forward.GatherIn1Dim(expand);
            var stateActionValues = tf.squeeze(gather);
            var nextStateValues = tf.reduce_max(targetNet.Apply(nextStates));

            var expectedStateActionValues = nextStateValues * GAMMA + rewards;

            var loss = tf.reduce_sum(tf.pow(expectedStateActionValues - stateActionValues, 2f) / (2f * BATCH_SIZE));

            var gradients = g.gradient(loss, net.trainable_variables);

            optimizer.apply_gradients(zip(gradients, net.trainable_variables.Select(x => x as ResourceVariable)));
        }

        void syncWeights() {
            targetNet = net.SyncModel(net.SaveWeights());
        }

        float calcTotalMean() {
            return totalRewards.Aggregate((prev, next) => prev + next) / totalRewards.Length;
        }

        public async void PerformMoveAsync(PlayerInfo info) {
            frameId++;
            epsilon = EPSILON_FINAL > EPSILON_START - frameId / EPSILON_DECAY ? EPSILON_FINAL : EPSILON_START - frameId / EPSILON_DECAY;
            Console.WriteLine($"epsilon: {epsilon}");
            var reward = await chooseAction(new InputVector(), epsilon);

            if (reward != null) {
                totalRewards.Append((float)reward);
                var mean = calcTotalMean();
                Console.WriteLine(mean);
            }

            Console.WriteLine($"buffer len: {expBuffer.Length}");
            if (expBuffer.Length < BUFFER_SIZE) return;

            if (frameId % SYNC_NETS == 0) syncWeights();

            runOptimization();
        }

        public void Dispose() => Dispose(true);

        protected void Dispose(bool disposing) {
            if (_disposed) return;

            if (disposing) {
                SaveModel();
            }

            _disposed = true;

        }

        async void SaveModel() {
            await net.SaveModelAsync();
        }
    }
}