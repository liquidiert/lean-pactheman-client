using System;
using System.Linq;
using System.Collections.Generic;
using PacTheMan.Models;

namespace lean_pactheman_client {

    sealed class AStarNode {

        public AStarNode Parent;
        public Position Position;

        public double g = 0;
        public double h = 0;
        public double f = 0;

# nullable enable
        public AStarNode(AStarNode? parent = null, Position? position = null) => (Parent, Position) = (parent, position);
# nullable restore
        public override bool Equals(object toCompare) {
            if (toCompare == null) return false;
            if (!(toCompare is AStarNode)) return false;
            return this.Position == ((AStarNode)toCompare).Position;
        }

        public override int GetHashCode() {
            return Position.GetHashCode() ^ g.GetHashCode() ^ h.GetHashCode() ^ f.GetHashCode();
        }

#nullable enable
        public static bool operator ==(AStarNode? a, AStarNode? b) {
            var unavailable = new Position { X = -1, Y = -1 };
            return (a ??= new AStarNode(position: unavailable)).Position
                == (b ??= new AStarNode(position: unavailable)).Position;
        }

        public static bool operator !=(AStarNode? a, AStarNode? b) {
            var unavailable = new Position { X = -1, Y = -1 };
            return (a ??= new AStarNode(position: unavailable)).Position
                != (b ??= new AStarNode(position: unavailable)).Position;
        }
#nullable restore
    }

    sealed public class AStar {

        // this heuristic could be changed TODO: add adapter?
        static double ManhattanDistance(Position start, Position end) {
            return Math.Abs(start.X - end.X) + Math.Abs(start.Y - end.Y);
        }

# nullable enable
        public static List<Position> GetPath(Position start, Position end, int iterDepth = -3, List<Position>? positionsToIgnore = null) {
#nullable restore

            int[,] maze = MapReader.Instance.Map;
            var startNode = new AStarNode(null, start);
            var endNode = new AStarNode(null, end);

            var openList = new List<AStarNode>();
            var closedList = new List<AStarNode>();

            openList.Add(startNode);

            var iteration = 0;

            while (openList.Count > 0) {

                var currentIndex = openList.Select(node => node.f).ToList().MinIndex();
                var currentNode = openList.Pop(currentIndex);
                closedList.Add(currentNode);

                // iterDepth + 2 cause start point gets removed
                if (iteration == iterDepth + 2 || currentNode == endNode) {
                    var path = new List<Position>();
                    var current = currentNode;
                    while (current != null) {
                        path.Add(current.Position);
                        current = current.Parent;
                    }
                    // return without start point
                    path.RemoveAt(path.Count - 1);
                    return path;
                }

                var children = new List<AStarNode>();
                // adjacent squares -> left, right, top, bottom
                foreach (var newPosition in new List<Position>().AddMany(
                    new Position { X = -1, Y = 0 }, // left
                    new Position { X = 1, Y = 0 }, // right
                    new Position { X = 0, Y = 1 }, // up
                    new Position { X = 0, Y = -1 } // down
                )) {

                    var nodePosition = new Position {
                        X = currentNode.Position.X + newPosition.X,
                        Y = currentNode.Position.Y + newPosition.Y
                    };

                    if (nodePosition.X > (maze.GetLength(0) - 1) || nodePosition.X <= 0 // valid cause map has border
                        || nodePosition.Y > (maze.GetLength(1) - 1) || nodePosition.Y <= 0)
                        continue;

                    // skip every point that is not "walkable"
                    if (maze[(int)nodePosition.X, (int)nodePosition.Y] != 0) continue;
                    // skip every point that shall be ignored
                    if (positionsToIgnore?.Contains(nodePosition) ?? false) continue;

                    var newNode = new AStarNode(currentNode, nodePosition);

                    if (!closedList.Contains(newNode)) children.Add(newNode);

                }

                for (int i = 0; i < children.Count; i++) {

                    children[i].g = currentNode.g + 1;
                    children[i].h = ManhattanDistance(children[i].Position, endNode.Position);
                    children[i].f = children[i].g + children[i].h;

                    if (openList.Contains(children[i])) continue;

                    openList.Add(children[i]);
                }

                iteration++;
            }
            return null;
        }

    }
}