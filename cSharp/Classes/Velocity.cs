using PacTheMan.Models;

namespace lean_pactheman_client {
    public class Velocity {
        public float X { get; set; }
        public float Y { get; set; }

        public Velocity() {
            this.X = 0;
            this.Y = 0;
        }
        public Velocity(Position pos) {
            this.X = pos.X;
            this.Y = pos.Y;
        }
        public Velocity(float single) {
            this.X = single;
            this.Y = single;
        }
        public Velocity(float x, float y) {
            this.X = x;
            this.Y = y;
        }

        public override bool Equals(object toCompare) {
            if (toCompare == null) return false;
            if (!(toCompare is Velocity)) return false;
            return X == (toCompare as Velocity).X && Y == (toCompare as Velocity).Y;
        }

        public override int GetHashCode() {
            return X.GetHashCode() ^ Y.GetHashCode();
        }

#nullable enable
        public static bool operator ==(Velocity? a, Velocity? b) {
            var unavailable = new Velocity();
            a ??= unavailable;
            b ??= unavailable;
            return a.X == b.X && a.Y == b.Y;
        }

        public static bool operator !=(Velocity? a, Velocity? b) {
            var unavailable = new Velocity();
            a ??= unavailable;
            b ??= unavailable;
            return a.X != b.X && a.Y != b.Y;
        }
#nullable restore
    }
}