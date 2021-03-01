using static Tensorflow.Binding;
using static Tensorflow.KerasApi;
using Tensorflow;
using System;
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

            weightsHidden = tf.Variable(randomNormal.Apply(new InitializerArgs((10, 357))));
            biasHidden = tf.Variable(tf.zeros(357));

            weightsOutput = tf.Variable(randomNormal.Apply(new InitializerArgs((357, 4))));
            biasOutput = tf.Variable(tf.zeros(4));

            trainable_variables = new List<IVariableV1> {
                weightsHidden, weightsOutput, biasHidden, biasOutput
            };
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


    }
}