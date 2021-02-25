using PacTheMan.Models;

namespace lean_pactheman_client {
    public static class MovingStateExtensions {

        public static MovingState FromDirection(this MovingState state, Velocity direction) {

            if (direction == new Velocity(-1, 0)) { // left
                return MovingState.Left;
            } else if (direction == new Velocity(1, 0)) { // right
                return MovingState.Right;
            } else if (direction == new Velocity(0, -1)) { // up
                return MovingState.Up;
            } else if (direction == new Velocity(0, 1)) { // down
                return MovingState.Down;
            } else {
                return MovingState.Up;
            }

        }
    }
}