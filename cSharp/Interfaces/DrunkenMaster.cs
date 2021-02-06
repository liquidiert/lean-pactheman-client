using System;
using System.Linq;
using System.Collections.Generic;
using PacTheMan.Models;

namespace lean_pactheman_client {

    class DistanceWrapper {

        public double Distance { get; set; }
        public Position Pos { get; set; }
        public DistanceWrapper(double dist, Position pos) => (Distance, Pos) = (dist, pos);
    }
    public static class DrunkenMaster {
        static Position lastTarget;
        static List<Position> targetMemory = new List<Position>();

        public static void Init() {
            GameState.Instance.ResetEvent += (object sender, EventArgs args) => {
                lastTarget = null;
                targetMemory = new List<Position>();
            };
        }
        public static Velocity PerformMove(Player player) {
            var target = lastTarget;
            // only change target if none is set or we are close enough
            if (target == null || target.IsEqualUpToRange(player.Position, 5f)) {
                if (targetMemory.Count > 0) { // if we have A* path memory
                    target = targetMemory.Pop().Multiply(64);
                } else {
                    // get the score point right next to us
                    target = GameState.Instance.ScorePointState.ScorePointPositions.FirstOrDefault(
                        sp => player.Position.Distance(sp.Copy().Add(32)) <= 65f
                    );
                    if (target == null) { // maybe there are no scorepoints close to us so select the closest ones
                        var possibleTargets = GameState.Instance.ScorePointState.ScorePointPositions
                            .Select(sp => new DistanceWrapper(player.Position.Distance(sp.Copy().Add(32)), sp)).ToList();
                        possibleTargets.Sort((dist1, dist2) => (int)(dist1.Distance - dist2.Distance));
                        // search a path to the closest one via A*
                        targetMemory = AStar.Instance.GetPath(player.DownScaledPosition, possibleTargets[0].Pos.Downscaled());
                        target = targetMemory.Pop().Multiply(64);
                    }
                }
                lastTarget = target?.Add(32);
            }
            if (lastTarget == null) {
                lastTarget = target;
            }
            return new Velocity(target?.Copy().SubOther(player.Position) ?? player.Position);
        }
    }
}