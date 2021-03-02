using System;
using NumSharp;
using System.Collections.Generic;
using static Tensorflow.Binding;

namespace Tensorflow {
    public static class TensorflowExtensions {
        public static Tensor GatherIn1Dim(this Tensor t, Tensor indices) {
            if(indices.shape.Length > 2) throw new AxisOutOfRangeException();
            if(indices.shape[0] != t.shape[0]) throw new AxisOutOfRangeException();

            var toSelectFrom = t.numpy();

            var selects = new List<float>();
            
            foreach (var (dim, indx) in enumerate(indices.numpy().ToArray<int>())) {
                if (indx >= toSelectFrom[dim].size) throw new AxisOutOfRangeException($"Index {indx} at {dim} is outside the range of current dimension ({toSelectFrom[dim].size - 1})");
                selects.Add(toSelectFrom.GetSingle(dim, indx));
            }

            return tf.convert_to_tensor(new NDArray(selects.ToArray()));
        }
    }
}