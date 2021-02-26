using System;
using System.Linq;
using PacTheMan.Models;
using System.Collections.Generic;

namespace lean_pactheman_client {

    public class RandomSelector : BehaviorTask {
        public override bool Run() {
            Children.Shuffle();
            foreach (var c in Children) {
                if (c.Run()) {
                    return true;
                }
            }
            return false;
        }
    }

    public class Step : BehaviorTask {
        Velocity velocityToApply { get; set; }
        float mSpeed { get; set; }

        public Step(Velocity vA) => (velocityToApply) = (vA);

        public override bool Run() {
            var updatePos = BehaviorTreeAI.Info.Position.Copy().AddOther(velocityToApply.Copy().Multiply(64).ToPosition()).Downscaled();
            if (MapReader.Instance.IsValidPosition(updatePos)) {
                BehaviorTreeAI.ResultVelocity = velocityToApply;
                return true;
            }
            return false;
        }
    }

    public class FleeAction : BehaviorTask {

        string ghostName { get; set; }

        public FleeAction(string name) => ghostName = name;

        public override bool Run() {
            var selfPos = BehaviorTreeAI.Info.Position;
            var fleeDirection = new Velocity(selfPos.Copy().SubOther(GameState.Instance.GhostPositions[ghostName])).Normalize();
            var updatePos = selfPos.Copy().AddOther(fleeDirection.Copy().Multiply(128).ToPosition()).Downscaled();
            var fleePositions = (MapReader.Instance.Map.GetRegion(updatePos, 3) as Tuple<Position, int>[,]).Where(t => t.Item2 == 0).Select(t => t.Item1).ToList();
            if (fleePositions.Any()) {
                var targets = AStar.GetPath(
                    selfPos.Copy().Downscaled(),
                    fleePositions[new Random().Next(fleePositions.Count-1)].Downscaled(),
                    iterDepth: 7
                );
                if (targets == null) return false;
                BehaviorTreeAI.ResultVelocity = new Velocity(targets.Pop().Multiply(64).Add(32).SubOther(selfPos));
                return true;
            }
            return false;
        }
    }

    public class RandomFleeAction : BehaviorTask {

        string ghostName { get; set; }
        List<Velocity> randomVelocities = new List<Velocity> {
            new Velocity(-1, 0),
            new Velocity(1, 0),
            new Velocity(0, -1),
            new Velocity(0, 1)
        };

        public RandomFleeAction(string name) => ghostName = name;
        public override bool Run() {
            var selfPos = BehaviorTreeAI.Info.Position;
            var ghostDirection = new Velocity(GameState.Instance.GhostPositions[ghostName].Copy().SubOther(selfPos)).Normalize();
            randomVelocities.Remove(ghostDirection);
            foreach (var v in randomVelocities) {
                var updatePos = selfPos.Copy().AddOther(v.Copy().Multiply(128).ToPosition()).Downscaled();
                var fleePositions = (MapReader.Instance.Map.GetRegion(updatePos, 3) as Tuple<Position, int>[,]).Where(t => t.Item2 == 0).Select(t => t.Item1).ToList();
                if (fleePositions.Any()) {
                    var targets = AStar.GetPath(
                        selfPos.Copy().Downscaled(),
                        fleePositions[new Random().Next(fleePositions.Count-1)].Downscaled(),
                        iterDepth: 7
                    );
                    if (targets == null) continue;
                    BehaviorTreeAI.ResultVelocity = new Velocity(targets.Pop().Multiply(64).Add(32).SubOther(selfPos));
                    return true;
                }
            }
            return false;
        }
    }

    public class SeekScorePointAction : BehaviorTask {

        public override bool Run() {
            var selfPos = BehaviorTreeAI.Info.Position;
            var possibleTargets = GameState.Instance.ScorePointState.ScorePointPositions
                .Select(sp => new DistanceWrapper(selfPos.ManhattanDistance(sp.Copy().Add(32)), sp)).ToList();
            possibleTargets.Sort((dist1, dist2) => (int)(dist1.Distance - dist2.Distance));
            var targets = AStar.GetPath(
                selfPos.Copy().Downscaled(),
                possibleTargets[0].Pos.Downscaled(),
                iterDepth: 8
            );
            if (targets == null) return false;
            var updatePos = targets.Pop();
            if (MapReader.Instance.IsValidPosition(updatePos)) {
                BehaviorTreeAI.ResultVelocity = new Velocity(updatePos.Multiply(64).Add(32).SubOther(selfPos));
                return true;
            }
            return false;
        }
    }

    public class BehaviorTreeAI : IMove {
        public static Velocity ResultVelocity { get; set; }
        public static PlayerInfo Info { get; set; }
        static BehaviorTree bt { get; set; }

        static bool calcDistance(string toWhom) {
            return Info.Position.ManhattanDistance(GameState.Instance.GhostPositions[toWhom]) < 192;
        }

        public BehaviorTreeAI() {
            var selectRandomDirection = new RandomSelector {
                Children = new List<BehaviorTask> {
                    new Step(new Velocity(-1, 0)), // left
                    new Step(new Velocity(1, 0)), // right
                    new Step(new Velocity(0, -1)), // up
                    new Step(new Velocity(0, 1)) // down
                }
            };
            bt = new BehaviorTreeBuilder()
                .AddSelector(anchor: 1)
                    .AddSequence()
                        .AddCondition(() => calcDistance("blinky"))
                        .AddSelector()
                            .AddGeneric(new FleeAction("blinky"))
                            .AddGeneric(new RandomFleeAction("blinky"))
                    .AddSequence(link: 1)
                        .AddCondition(() => calcDistance("inky"))
                        .AddSelector()
                            .AddGeneric(new FleeAction("inky"))
                            .AddGeneric(new RandomFleeAction("inky"))
                    .AddSequence(link: 1)
                        .AddCondition(() => calcDistance("pinky"))
                        .AddSelector()
                            .AddGeneric(new FleeAction("pinky"))
                            .AddGeneric(new RandomFleeAction("pinky"))
                    .AddSequence(link: 1)
                        .AddCondition(() => calcDistance("clyde"))
                        .AddSelector()
                            .AddGeneric(new FleeAction("clyde"))
                            .AddGeneric(new RandomFleeAction("clyde"))
                    .AddSelector(link: 1)
                        .AddGeneric(new SeekScorePointAction())
                        .AddGeneric(selectRandomDirection, isComposition: true)
            .Build();
        }

        public (bool, Velocity) PerformMove(PlayerInfo playerInfo) {

            Info = playerInfo;

            bt.Run();

            return (true, ResultVelocity);
        }
    }
}