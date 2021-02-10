using System;
using System.Linq;
using PacTheMan.Models;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace lean_pactheman_client {

    sealed public class GraphNode {
        public Position Position { get; set; }
        public List<GraphNode> Neighbours { get; set; } = new List<GraphNode>(4);

        public GraphNode(Position pos) => (Position) = (pos);

        public override bool Equals(object toCompare) {
            if (toCompare == null) return false;
            if (!(toCompare is GraphNode)) return false;
            return this.Position == ((GraphNode)toCompare).Position;
        }

        public override int GetHashCode() {
            return Position.GetHashCode() ^ Neighbours.GetHashCode();
        }

        public static bool operator ==(GraphNode a, GraphNode b) {
            var unavailable = new Position { X = -1, Y = -1 };
            return (a ??= new GraphNode(unavailable)).Position
                == (b ??= new GraphNode(unavailable)).Position;
        }

        public static bool operator !=(GraphNode a, GraphNode b) {
            var unavailable = new Position { X = -1, Y = -1 };
            return (a ??= new GraphNode(unavailable)).Position
                != (b ??= new GraphNode(unavailable)).Position;
        }
    }

    // a graph representation of the pactheman map
    sealed public class MapGraph {
        private static readonly Lazy<MapGraph> lazy = new Lazy<MapGraph>(() => new MapGraph());
        public static MapGraph Instance { get => lazy.Value; }
        private MapGraph() { }

        public List<GraphNode> AdjacencyList { get; } = new List<GraphNode>();

        public void Init(int[,] map) {
            var openList = new List<GraphNode>();
            openList.Add(new GraphNode(new Position { X = 1, Y = 1 }));

            while (openList.Count > 0) {
                var currentNode = openList.Pop();
                // check left
                var adjacentNode = new GraphNode(new Position { X = currentNode.Position.X - 1, Y = currentNode.Position.Y });
                if (MapReader.Instance.IsValidPosition(adjacentNode.Position)) {
                    if (openList.All(n => n.Position != adjacentNode.Position)
                        && AdjacencyList.All(n => n.Position != adjacentNode.Position)) {
                        adjacentNode.Neighbours.Add(currentNode);
                        currentNode.Neighbours.Add(adjacentNode);
                        openList.Add(adjacentNode);
                    }
                }
                // check right
                adjacentNode = new GraphNode(new Position { X = currentNode.Position.X + 1, Y = currentNode.Position.Y });
                if (MapReader.Instance.IsValidPosition(adjacentNode.Position)) {
                    if (openList.All(n => n.Position != adjacentNode.Position)
                        && AdjacencyList.All(n => n.Position != adjacentNode.Position)) {
                        adjacentNode.Neighbours.Add(currentNode);
                        currentNode.Neighbours.Add(adjacentNode);
                        openList.Add(adjacentNode);
                    }
                }
                // check up
                adjacentNode = new GraphNode(new Position { X = currentNode.Position.X, Y = currentNode.Position.Y + 1 });
                if (MapReader.Instance.IsValidPosition(adjacentNode.Position)) {
                    if (openList.All(n => n.Position != adjacentNode.Position)
                        && AdjacencyList.All(n => n.Position != adjacentNode.Position)) {
                        adjacentNode.Neighbours.Add(currentNode);
                        currentNode.Neighbours.Add(adjacentNode);
                        openList.Add(adjacentNode);
                    }
                }
                // check down
                adjacentNode = new GraphNode(new Position { X = currentNode.Position.X, Y = currentNode.Position.Y - 1 });
                if (MapReader.Instance.IsValidPosition(adjacentNode.Position)) {
                    if (openList.All(n => n.Position != adjacentNode.Position)
                        && AdjacencyList.All(n => n.Position != adjacentNode.Position)) {
                        adjacentNode.Neighbours.Add(currentNode);
                        currentNode.Neighbours.Add(adjacentNode);
                        openList.Add(adjacentNode);
                    }
                }
                if (currentNode.Neighbours.Count > 0) AdjacencyList.Add(currentNode);
            }
        }
    }
}