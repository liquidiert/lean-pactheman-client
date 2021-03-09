/* using TorchSharp;
using TorchSharp.Tensor;
using TorchSharp.NN;
using static TorchSharp.NN.Modules;

namespace lean_pactheman_client.DQN {
    public class DQNModel {

        Sequential _model { get; set; }
        public Sequential Model { get => _model; }

        public DQNModel() {
            var input = new Linear(10, 357);
            var output = new Linear(357, 4);
            _model = new Sequential(input, Relu(), output, );
        }

    }
} */