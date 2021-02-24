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

        private void _reset(object sender, EventArgs args) {
            lastTarget = null;
            targetMemory.Clear();
            fleeMemory.Clear();
        }

        public NaiveHooman() {
            GameState.Instance.NewLevelEvent += _reset;
            GameState.Instance.ResetEvent += _reset;
        }

        Position GetAlternativeFromBFS(Position currentPos, List<Position> positionsToAvoid) {

            var rootNode = MapGraph.Instance.AdjacencyList.FirstOrDefault(n => n.Position == currentPos);

            if (rootNode == null) return currentPos;

            var queue = new Queue<GraphNode>();
            rootNode.Visited = true;
            queue.Enqueue(rootNode);

            while (queue.Count > 0) {
                var currentNode = queue.Dequeue();
                if (positionsToAvoid.Contains(currentNode.Position)) {
                    continue;
                } else if (GameState.Instance.ScorePointState.ScorePointPositions.Any(sp => sp.Downscaled() == currentNode.Position)) {
                    MapGraph.Instance.Reset();
                    return currentNode.Position.Copy();
                }
                foreach (var neighbour in currentNode.Neighbours) {
                    if (!neighbour.Visited) {
                        neighbour.Visited = true;
                        queue.Enqueue(neighbour);
                    }
                }
            }

            MapGraph.Instance.Reset();
            return currentPos;

        }

        List<Position> _getEvadingRegion() {
            var res = new List<Position>();
            foreach (var ghostPos in GameState.Instance.GhostPositions.Select(g => g.Value.Downscaled()).ToList()) {
                var region = (Tuple<Position, int>[,])MapReader.Instance.Map.GetRegion(ghostPos, regionSize: 3);
                var filteredRegion = region.Where(tuple => tuple.Item2 == 0).Select(tuple => tuple.Item1);
                res.AddRange(filteredRegion);
            }
            return res;
        }

        public Velocity PerformMove(PlayerInfo playerInfo) {
            Position target = lastTarget;
            // TODO: evade ghost region
            var ghostTooClose = GameState.Instance.GhostPositions
                .FirstOrDefault(pair => pair.Value.ManhattanDistance(playerInfo.Position) < 192).Value;
            if (ghostTooClose != null) {
                if (targetMemory.Count > 0) targetMemory.Clear();

                if (fleeMemory.Count == 0) {

                    target = null;

                    Console.WriteLine("getting alternative score point");
                    // get alternative score point position via BFS
                    var alternativeScorePointPos = GetAlternativeFromBFS(
                        playerInfo.DownScaledPosition,
                        GameState.Instance.GhostPositions.Select(g => g.Value.Downscaled()).ToList()
                    );

                    Console.Write("Found alternative score point pos: ");
                    alternativeScorePointPos.Print();

                    // search a path to a flee point via A*
                    fleeMemory = AStar.GetPath(playerInfo.DownScaledPosition,
                        alternativeScorePointPos,
                        iterDepth: 7);
                    /* positionsToIgnore: GameState.Instance.GhostPositions.Select(g => g.Value.Downscaled()).ToList()) ?? new List<Position>(); */
                }
                if (target == null || target.IsEqualUpToRange(playerInfo.Position, 5f)) {
                    try {
                        target = fleeMemory.Pop().Multiply(64);
                        lastTarget = target?.Add(32);
                        Console.WriteLine("setting new flee target");
                    } catch {
                        Console.WriteLine("no flee target was found");
                        return new Velocity(playerInfo.Position.Copy().SubOther(ghostTooClose));
                    }
                }
            } else { // no ghosts detected
                if (fleeMemory.Count > 0) fleeMemory.Clear();
                // only change target if none is set or we are close enough
                if (target == null || target.IsEqualUpToRange(playerInfo.Position, 5f)) {
                    Console.Write("Getting new target ");

                    if (targetMemory.Count > 0) { // if we have A* path memory
                        target = targetMemory.Pop().Multiply(64);
                        Console.WriteLine("from memory");
                    } else {
                        Console.WriteLine("from new path");
                        var reachableTarget = GameState.Instance.ScorePointState.ScorePointPositions
                            .FirstOrDefault(sp => playerInfo.Position.ManhattanDistance(sp.Copy().Downscaled()) < 65);

                        if (reachableTarget == null) {
                            var possibleTargets = GameState.Instance.ScorePointState.ScorePointPositions
                            .Select(sp => new DistanceWrapper(playerInfo.Position.ManhattanDistance(sp.Copy().Add(32)), sp)).ToList();
                            possibleTargets.Sort((dist1, dist2) => (int)(dist1.Distance - dist2.Distance));

                            // search a path to the closest one via A*
                            targetMemory = AStar.GetPath(
                                playerInfo.DownScaledPosition,
                                possibleTargets[0].Pos.Downscaled(),
                                iterDepth: 12,
                                positionsToIgnore: GameState.Instance.GhostPositions.Select(g => g.Value.Downscaled()).ToList()
                            );
                        } else {
                            // search a path to reachable target
                            targetMemory = AStar.GetPath(
                                playerInfo.DownScaledPosition,
                                reachableTarget,
                                iterDepth: 12,
                                positionsToIgnore: GameState.Instance.GhostPositions.Select(g => g.Value.Downscaled()).ToList()
                            );
                        }

                        target = targetMemory.Pop().Multiply(64);
                    }
                    lastTarget = target?.Add(32);
                }
            }
            return new Velocity(target?.Copy().SubOther(playerInfo.Position) ?? playerInfo.Position);
        }
    }
}