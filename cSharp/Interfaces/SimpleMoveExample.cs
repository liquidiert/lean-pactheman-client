using PacTheMan.Models;
using System;
using System.Collections.Generic;

namespace lean_pactheman_client {
    public static class SimpleMoveExample {
        public static Velocity PerformMove(Player player) {
            var velocities = new List<Velocity>().AddMany(
                    new Velocity(-64, 0), // left
                    new Velocity(64, 0), // right
                    new Velocity(0, 64), // up
                    new Velocity(0, -64) // down
                );
            return velocities[new Random().Next(velocities.Count)];
        }
    }
}