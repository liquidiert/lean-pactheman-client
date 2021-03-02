using static Tensorflow.Binding;
using Tensorflow;
using PacTheMan.Models;
using NumSharp;

namespace lean_pactheman_client {
    public static class ResourceVariableExtensions {

        public static TensorSave ToSave(this ResourceVariable v) {
            return new TensorSave {
                Name = v.Name.Split(":")[0],
                Values = v.numpy().ToArray<float>(),
                Shape = v.shape.as_list()
            };
        }

        public static ResourceVariable Reconstruct(TensorSave toReconstructFrom) {
            return tf.Variable(new NDArray(toReconstructFrom.Values).reshape(new Shape(toReconstructFrom.Shape)), name: toReconstructFrom.Name);
        }
    }
}