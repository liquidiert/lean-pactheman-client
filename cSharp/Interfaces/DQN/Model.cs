using static Tensorflow.Binding;
using Tensorflow;
using System;
using System.IO;
using System.Linq;
using PacTheMan.Models;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace lean_pactheman_client.DQN {
    public class DQNModel {

        ResourceVariable weightsHidden;
        ResourceVariable biasHidden;
        ResourceVariable weightsOutput;
        ResourceVariable biasOutput;

        public List<IVariableV1> trainable_variables {get; set;}

        public DQNModel() {
            var randomNormal = tf.initializers.random_normal_initializer();

            weightsHidden = tf.Variable(randomNormal.Apply(new InitializerArgs((10, 357))), name: "hiddenWeights");
            biasHidden = tf.Variable(tf.zeros(357), name: "hiddenBias");

            weightsOutput = tf.Variable(randomNormal.Apply(new InitializerArgs((357, 4))), name: "outWeights");
            biasOutput = tf.Variable(tf.zeros(4), name: "outBias");

            trainable_variables = new List<IVariableV1> {
                weightsHidden, weightsOutput, biasHidden, biasOutput
            };
        }

        public DQNModel(List<ResourceVariable> trainableVars) {
            weightsHidden = trainableVars.Find(v => v.Name == "hiddenWeights:0");
            biasHidden = trainableVars.Find(v => v.Name == "hiddenBias:0");
            weightsOutput = trainableVars.Find(v => v.Name == "outWeights:0");
            biasOutput = trainableVars.Find(v => v.Name == "outBias:0");
            trainable_variables = trainableVars.ConvertAll(v => v as IVariableV1);
        }

        public DQNModel(string reconstructFilePath) {
            var bytes = File.ReadAllBytes(reconstructFilePath);
            var model = ModelSave.Decode(bytes);

            var trainableVars = model.Tensors.Select(t => ResourceVariableExtensions.Reconstruct((TensorSave)t)).ToList();

            weightsHidden = trainableVars.Find(v => v.Name == "hiddenWeights:0");
            biasHidden = trainableVars.Find(v => v.Name == "hiddenBias:0");
            weightsOutput = trainableVars.Find(v => v.Name == "outWeights:0");
            biasOutput = trainableVars.Find(v => v.Name == "outBias:0");
            trainable_variables = trainableVars.ConvertAll(v => v as IVariableV1);
        }

        public Tensor Apply(Tensor input) {
            try {
                var hiddenLayer = tf.add(tf.matmul(input, weightsHidden.AsTensor()), biasHidden.AsTensor());
                hiddenLayer = tf.nn.relu(hiddenLayer);

                var outputLayer = tf.matmul(hiddenLayer, weightsOutput.AsTensor()) + biasOutput.AsTensor();

                return tf.nn.softmax(outputLayer);
            } catch (TensorflowException ex) {
                Console.WriteLine(ex.Message);
                Console.WriteLine(ex.StackTrace);
                Console.WriteLine("-------------------------------------");
                Console.WriteLine(ex.ToString());
                Environment.Exit(-1);
                return null;
            }
        }

        public List<TensorSave> SaveWeights() {
            var res = new List<TensorSave>();

            foreach (var v in trainable_variables) {
                res.Add((v as ResourceVariable).ToSave());
            }

            return res;
        }

        public DQNModel SyncModel(List<TensorSave> saves) {
            var vars = saves.Select(s => ResourceVariableExtensions.Reconstruct(s)).ToList();
            var sync = new DQNModel(vars);
            return sync;
        }

        public async Task SaveModelAsync() {
            var model = new ModelSave {
                Tensors = SaveWeights().ToArray()
            };

            await File.WriteAllBytesAsync($"./Interfaces/DQN/Saves/{new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds()}.bopms",
                model.Encode());
        }


    }
}