using PacTheMan.Models;

namespace lean_pactheman_client {
    public class Velocity {
        public float X { get; set; }
        public float Y { get; set; }

        public Velocity(Position pos) {
            this.X = pos.X;
            this.Y = pos.Y;
        }

        public Velocity(float x, float y) {
            this.X = x;
            this.Y = y;
        }
    }
}