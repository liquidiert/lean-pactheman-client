using PacTheMan.Models;

namespace lean_pactheman_client {
    public static class Constants {
        public const float FRAME_DELTA_APPROX = 0.0167f;
        public const int MAX_STRIKE_COUNT = 3;
        public static readonly MovingState[] ACTION_SPACE = {
            MovingState.Up,
            MovingState.Down,
            MovingState.Left,
            MovingState.Right
        };

    }
}