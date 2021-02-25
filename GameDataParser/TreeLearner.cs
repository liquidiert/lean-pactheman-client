using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;

namespace GameDataParser {

    public class MetaTimeStep {
        public bool Winner { get; set; }
        public Position SelfPosition { get; set; }
        public Position Blinky { get; set; }
        public Position Inky { get; set; }
        public Position Pinky { get; set; }
        public Position Clyde { get; set; }
        public MovingState Direction { get; set; }

        public Position GetPosAttribute(string which) {
            switch (which) {
                case "self":
                    return SelfPosition;
                case "blinky":
                    return Blinky;
                case "inky":
                    return Inky;
                case "pinky":
                    return Pinky;
                case "clyde":
                    return Clyde;
                default:
                    throw new ArgumentException("unknown pos attrib");
            }
        }

    }

    public class SanitizedGameData {
        public List<MetaTimeStep> Steps = new List<MetaTimeStep>();

        public SanitizedGameData() {}
        
        public SanitizedGameData(List<GameData> data) {
            foreach (var game in data) {
                foreach (var level in game.LevelData) {
                    foreach (var step in level.TimeSteps) {
                        if (step.GhostPositions == null) continue;
                        Steps.Add(new MetaTimeStep {
                            Winner = level.Winner == "me",
                            SelfPosition = (Position)step.PlayerState.PlayerPositions[game.MyId],
                            Blinky = (Position)step.GhostPositions["blinky"],
                            Inky = (Position)step.GhostPositions["inky"],
                            Pinky = (Position)step.GhostPositions["pinky"],
                            Clyde = (Position)step.GhostPositions["clyde"],
                            Direction = step.PlayerState.Direction
                        });
                    }
                }
            }
        }

        public MovingState PluralityValue() {
            return Steps.Select(s => s.Direction).GroupBy(s => s).OrderByDescending(grp => grp.Count()).Select(grp => grp.Key).First();
        }

        public double Occurence(Position pos, string which) {
            return Steps.Where(s => s.GetPosAttribute(which).IsEqualUpToRange(pos)).Count() / Steps.Count;
        }

        public double Probability(Position pos, string which) {
            var positives = Steps.Where(s => s.GetPosAttribute(which).IsEqualUpToRange(pos) && s.Winner).Count();
            var negatives = Steps.Where(s => s.GetPosAttribute(which).IsEqualUpToRange(pos) && !s.Winner).Count();
            try {
                return positives / positives + negatives;
            } catch (DivideByZeroException) {
                // those just contribute 0 probability
                return 0.0;
            }
        }

    }
    public class TreeLearner {
        public List<Position> PossiblePositionValues = new List<Position>();

        public TreeLearner() {
            var tiles = File.ReadAllLines("../map.txt");
            for (int h = 0; h < tiles.GetLength(0); h++) {
                for (int w = 0; w < tiles[h].Length; w++) {
                    if (int.Parse(tiles[h][w].ToString()) == 0) {
                        PossiblePositionValues.Add(new Position { X = w, Y = h }.Upscaled());
                    }
                }
            }
        }

        double entropy(double prob) {
            return -(prob * Math.Log2(prob) + (1 - prob) * Math.Log2((1 - prob)));
        }

        string importanceFunction(List<string> attribs, SanitizedGameData examples) {
            string res = attribs[0];
            double maxGain = 0.0;
            foreach (var attrib in attribs) {
                var remainder = 0.0;
                foreach (var pos in PossiblePositionValues) {
                    remainder += examples.Occurence(pos, attrib) * entropy(examples.Probability(pos, attrib));
                }
                var gain = 1 - remainder;
                if (gain > maxGain) {
                    maxGain = gain;
                    res = attrib;
                }
            }
            return res;
        }

        public Tree LearnTree(SanitizedGameData examples, List<string> attributes, SanitizedGameData parentExamples) {
            if (examples.Steps.Count == 0) {
                return new Tree {
                    Root = new TreeNode {
                        Label = parentExamples.PluralityValue().ToString()
                    }
                };
            } else if (examples.Steps.Select(s => s.Direction).GroupBy(s => s).Count() == 1) {
                return new Tree {
                    Root = new TreeNode {
                        Label = examples.Steps.Select(s => s.Direction).GroupBy(s => s).First().Key.ToString()
                    }
                };
            } else if (attributes.Count == 0) {
                return new Tree {
                    Root = new TreeNode {
                        Label = examples.PluralityValue().ToString()
                    }
                };
            } else {
                var a = importanceFunction(attributes, examples);
                var tree = new Tree {
                    Root = new TreeNode {
                        Label = a,
                        Branch = new Position()
                    }
                };
                attributes.Remove(a);
                foreach (var pos in PossiblePositionValues) {
                    var exs = new SanitizedGameData {
                        Steps = examples.Steps.Where(s => s.GetPosAttribute(a).IsEqualUpToRange(pos)).ToList()
                    };
                    var subtree = LearnTree(exs, attributes, examples);
                    subtree.Root.Branch = pos;
                    tree.Root.Children.Add(subtree.Root);
                }
                return tree;
            }
        }

    }
}