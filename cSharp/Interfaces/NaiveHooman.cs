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
    public class NaiveHooman : IMove {
        Position lastTarget;
        List<Position> targetMemory = new List<Position>();
        List<Position> fleeMemory = new List<Position>();

        public NaiveHooman() {
            GameState.Instance.ResetEvent += (object sender, EventArgs args) => {
                lastTarget = null;
                targetMemory.Clear();
                fleeMemory.Clear();
            };
        }
        public Velocity PerformMove(Player player) {
            Position target = lastTarget;
            var ghostTooClose = GameState.Instance.GhostPositions
                .FirstOrDefault(pair => pair.Value.ManhattanDistance(player.Position) < 128).Value;
            if (ghostTooClose != null) {
                if (targetMemory.Count > 0) targetMemory.Clear();
                Console.WriteLine($"Ghost is too close; dist: {ghostTooClose.ManhattanDistance(player.Position)}");
                if (fleeMemory.Count == 0) {

                    target = null;
                    Console.WriteLine("Calculating flee path");
                    var fleeDirection = player.Position.Copy().SubOther(ghostTooClose).Normalize();
                    fleeDirection.Multiply(player.MovementSpeed).Multiply(Constants.FRAME_DELTA_APPROX * 3);
                    var fleePosition = player.Position.Copy().AddOther(fleeDirection);

                    // get a region around flee position
                    var possibleFleePoints = ((Tuple<Position, int>[,])MapReader.Instance.Map.GetRegion(fleePosition.Downscaled(), regionSize: 3))
                        .Where(t => t.Item2 == 0).Select(t => t.Item1).ToList();

                    // search a path to a random flee point via A*
                    fleeMemory = AStar.GetPath(player.DownScaledPosition,
                        possibleFleePoints[new Random().Next(possibleFleePoints.Count)],
                        iterDepth: 5,
                        positionsToIgnore: GameState.Instance.GhostPositions.Select(g => g.Value.Downscaled()).ToList()) ?? new List<Position>();
                }
                if (target == null || target.IsEqualUpToRange(player.Position, 5f)) {
                    try {
                        Console.WriteLine("Getting new flee target");
                        target = fleeMemory.Pop().Multiply(64);
                        lastTarget = target?.Add(32);
                    } catch {
                        Console.WriteLine("no flee target was found");
                    }
                }
            } else { // no ghosts detected
                if (fleeMemory.Count > 0) fleeMemory.Clear();
                // only change target if none is set or we are close enough
                if (target == null || target.IsEqualUpToRange(player.Position, 5f)) {
                    Console.Write("Getting new target ");

                    if (targetMemory.Count > 0) { // if we have A* path memory
                        target = targetMemory.Pop().Multiply(64);
                        Console.WriteLine("from memory");
                    } else {
                        Console.WriteLine("from new path");
                        var possibleTargets = GameState.Instance.ScorePointState.ScorePointPositions
                            .Select(sp => new DistanceWrapper(player.Position.ManhattanDistance(sp.Copy().Add(32)), sp)).ToList();
                        possibleTargets.Sort((dist1, dist2) => (int)(dist1.Distance - dist2.Distance));

                        // search a path to the closest one via A*
                        targetMemory = AStar.GetPath(
                            player.DownScaledPosition,
                            possibleTargets[0].Pos.Downscaled(),
                            iterDepth: 10,
                            positionsToIgnore: GameState.Instance.GhostPositions.Select(g => g.Value.Downscaled()).ToList()
                        );
                        target = targetMemory.Pop().Multiply(64);
                    }
                    lastTarget = target?.Add(32);
                }
            }
            return new Velocity(target?.Copy().SubOther(player.Position) ?? player.Position);
        }
    }
}