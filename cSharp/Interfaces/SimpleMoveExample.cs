using System;
using System.Collections.Generic;

namespace lean_pactheman_client {
    public class SimpleMoveExample : IMove {
        public (bool, Velocity) PerformMove(PlayerInfo playerInfo) {
            var velocities = new List<Velocity>().AddMany(
                    new Velocity(-64, 0), // left
                    new Velocity(64, 0), // right
                    new Velocity(0, 64), // up
                    new Velocity(0, -64) // down
                );
            return (true, velocities[new Random().Next(velocities.Count)]);
        }
    }
}