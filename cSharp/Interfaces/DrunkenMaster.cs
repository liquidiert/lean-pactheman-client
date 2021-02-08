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
        static List<Position> fleeMemory = new List<Position>();

        public static void Init() {
            GameState.Instance.ResetEvent += (object sender, EventArgs args) => {
                lastTarget = null;
                targetMemory.Clear();
                fleeMemory.Clear();
            };
        }
        public static Velocity PerformMove(Player player) {
            Position target = lastTarget;
            var ghostToClose = GameState.Instance.GhostPositions.FirstOrDefault(pair => pair.Value.Distance(player.Position) < 265).Value;
            if (ghostToClose != null) {
                if (fleeMemory.Count == 0) {
                    targetMemory.Clear();
                    var fleeDirection = player.Position.Copy().SubOther(ghostToClose).Normalize();
                    fleeDirection.Multiply(player.MovementSpeed).Multiply(0.032f);
                    var fleePosition = player.Position.Copy().AddOther(fleeDirection);
                    // get a region around flee position
                    var possibleFleePoints = ((Tuple<Position, int>[,])MapReader.Instance.Map.GetRegion(fleePosition.Downscaled(), regionSize: 3))
                        .Where(t => t.Item2 == 0).Select(t => t.Item1).ToList();
                    // search a path to a random flee point via A*
                    fleeMemory = AStar.GetPath(player.DownScaledPosition,
                        possibleFleePoints[new Random().Next(possibleFleePoints.Count)].Downscaled());
                }
                if (target.IsEqualUpToRange(player.Position, 5f)) {
                    target = fleeMemory.Pop().Multiply(64);
                    lastTarget = target?.Add(32);
                }
            } else { // no ghosts detected
                // only change target if none is set or we are close enough
                if (target == null || target.IsEqualUpToRange(player.Position, 5f)) {
                    if (targetMemory.Count > 0) { // if we have A* path memory
                        target = targetMemory.Pop().Multiply(64);
                    } else {
                        fleeMemory.Clear();
                        // get the score point right next to us
                        target = GameState.Instance.ScorePointState.ScorePointPositions.FirstOrDefault(
                            sp => player.Position.Distance(sp.Copy().Add(32)) <= 65f
                        );
                        if (target == null) { // maybe there are no scorepoints close to us so select the closest ones
                            var possibleTargets = GameState.Instance.ScorePointState.ScorePointPositions
                                .Select(sp => new DistanceWrapper(player.Position.Distance(sp.Copy().Add(32)), sp)).ToList();
                            possibleTargets.Sort((dist1, dist2) => (int)(dist1.Distance - dist2.Distance));
                            // search a path to the closest one via A*
                            targetMemory = AStar.GetPath(player.DownScaledPosition, possibleTargets[0].Pos.Downscaled());
                            target = targetMemory.Pop().Multiply(64);
                        }
                    }
                    lastTarget = target?.Add(32);
                }
            }
            return new Velocity(target?.Copy().SubOther(player.Position) ?? player.Position);
        }
    }
}