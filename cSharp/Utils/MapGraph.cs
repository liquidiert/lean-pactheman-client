using System;
using System.Linq;
using PacTheMan.Models;
using System.Collections.Generic;

namespace lean_pactheman_client {

    sealed public class GraphNode {

        public bool Visited { get; set; } = false;
        public Position Position { get; }
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

        private List<GraphNode> _adjacencyList = new List<GraphNode>();

        public List<GraphNode> AdjacencyList { get => _adjacencyList; }

        public void Init(int[,] map) {
            var openList = new List<GraphNode>();
            openList.Add(new GraphNode(new Position { X = 1, Y = 1 }));

            while (openList.Count > 0) {
                var currentNode = openList.Pop();

                // check left
                var adjacentNode = _adjacencyList.FirstOrDefault(n => n.Position == new Position { X = currentNode.Position.X - 1, Y = currentNode.Position.Y });
                if (adjacentNode == null) adjacentNode = new GraphNode(new Position { X = currentNode.Position.X - 1, Y = currentNode.Position.Y });
                if (MapReader.Instance.IsValidPosition(adjacentNode.Position)) {
                    currentNode.Neighbours.Add(adjacentNode);
                    if (_adjacencyList.All(n => n.Position != adjacentNode.Position)) { 
                        openList.Add(adjacentNode);
                    }
                }
                // check right
                adjacentNode = _adjacencyList.FirstOrDefault(n => n.Position == new Position { X = currentNode.Position.X + 1, Y = currentNode.Position.Y });
                if (adjacentNode == null) adjacentNode = new GraphNode(new Position { X = currentNode.Position.X + 1, Y = currentNode.Position.Y });
                if (MapReader.Instance.IsValidPosition(adjacentNode.Position)) {
                    currentNode.Neighbours.Add(adjacentNode); 
                    if (_adjacencyList.All(n => n.Position != adjacentNode.Position)) {
                        openList.Add(adjacentNode); 
                    }
                }
                // check up
                adjacentNode = _adjacencyList.FirstOrDefault(n => n.Position == new Position { X = currentNode.Position.X, Y = currentNode.Position.Y + 1 });
                if (adjacentNode == null) adjacentNode = new GraphNode(new Position { X = currentNode.Position.X, Y = currentNode.Position.Y + 1 });
                if (MapReader.Instance.IsValidPosition(adjacentNode.Position)) {
                    currentNode.Neighbours.Add(adjacentNode);
                    if (_adjacencyList.All(n => n.Position != adjacentNode.Position)) { 
                        openList.Add(adjacentNode);
                    }
                }
                // check down
                adjacentNode = _adjacencyList.FirstOrDefault(n => n.Position == new Position { X = currentNode.Position.X, Y = currentNode.Position.Y - 1 });
                if (adjacentNode == null) adjacentNode = new GraphNode(new Position { X = currentNode.Position.X, Y = currentNode.Position.Y - 1 });
                if (MapReader.Instance.IsValidPosition(adjacentNode.Position)) {
                    currentNode.Neighbours.Add(adjacentNode);
                    if (_adjacencyList.All(n => n.Position != adjacentNode.Position)) { 
                        openList.Add(adjacentNode);
                    }
                }
                if (currentNode.Neighbours.Count > 0) _adjacencyList.Add(currentNode);
            }
        }

        public void Reset() {
            foreach (var n in _adjacencyList) {
                n.Visited = false;
            }
        }

        public void Print() {
            foreach (var node in _adjacencyList) {
                Console.Write("node Position: ");
                node.Position.Print();
                Console.WriteLine("neighbour Positions: ");
                foreach (var neighbour in node.Neighbours) {
                    neighbour.Position.Print();
                }
                Console.WriteLine("---------------------------------");
            }
        }

        public int[,] ToTwoDimArr() {
            int[,] res = new int[19, 22];
            foreach (var node in _adjacencyList) {
                res[(int)node.Position.X, (int)node.Position.Y] = node.Neighbours.Count;
            }
            return res;
        }
    }
}