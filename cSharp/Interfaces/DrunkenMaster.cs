using System;
using System.Linq;
using PacTheMan.Models;

namespace lean_pactheman_client {

    class DistanceWrapper {

        public double Distance { get; set; }
        public Position Pos { get; set; }
        public DistanceWrapper(double dist, Position pos) => (Distance, Pos) = (dist, pos);
    }
    public static class DrunkenMaster {
        static Position lastTarget;

        public static void Init() {
            GameState.Instance.ResetEvent += (object sender, EventArgs args) => {
                lastTarget = null;
            };
        }
        public static Velocity PerformMove(Player player) {
            var target = lastTarget;
            if (target == null || target.IsEqualUpToRange(player.Position, 5f)) {
                target = GameState.Instance.ScorePointState.ScorePointPositions.FirstOrDefault(
                    sp => player.Position.Distance(sp.Copy().Add(32)) <= 65f
                );
                if (target == null) {
                    var possibleTargets = GameState.Instance.ScorePointState.ScorePointPositions
                        .Select(sp => new DistanceWrapper(player.Position.Distance(sp.Copy().Add(32)), sp)).ToList();
                    possibleTargets.Sort((dist1, dist2) => (int)(dist1.Distance - dist2.Distance));
                    target = possibleTargets[0].Pos;
                }
                target.Print();
                lastTarget = target?.Add(32);
            }
            if (lastTarget == null) {
                lastTarget = target;
            }
            return new Velocity(target?.Copy().SubOther(player.Position) ?? player.Position);
        }
    }
}