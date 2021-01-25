using PacTheMan.Models;
using System;
using System.Collections.Generic;

namespace lean_pactheman_client {
    public static class SimpleMoveExample {
        public static Position PerformMove(Player player) {
            var velocities = new List<Position>().AddMany(
                    new Position { X = -64, Y = 0 }, // left
                    new Position { X = 64, Y = 0 }, // right
                    new Position { X = 0, Y = 64 }, // up
                    new Position { X = 0, Y = -64 } // down
                );
            return player.Position.AddOther(velocities[new Random().Next(velocities.Count)]);
        }
    }
}