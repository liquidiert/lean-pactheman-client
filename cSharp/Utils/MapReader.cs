using System;
using System.IO;
using PacTheMan.Models;

namespace lean_pactheman_client {
    public class MapReader {
        private static readonly Lazy<MapReader> lazy = new Lazy<MapReader>(() => new MapReader());
        public static MapReader Instance { get => lazy.Value; }
        private MapReader() {
            Map = new int[19, 22];
            try {
                var text = File.ReadAllLines("../map.txt");
                for (int h = 0; h < text.GetLength(0); h++) {
                    for (int w = 0; w < text[h].Length; w++) {
                        Map[w, h] = int.Parse(text[h][w].ToString());
                    }
                }
            } catch (IOException) {
                Console.WriteLine("Map file could not be found!");
                Environment.Exit(-1);
            }
        }

        public int[,] Map { get; }

        public bool IsValidPosition(Position pos) {
            if (pos.X > 19 || pos.Y > 22) throw new ArgumentException("Position must be down scaled");
            try {
                return Map[(int)pos.X, (int)pos.Y] == 0;
            } catch (IndexOutOfRangeException) {
                return false;
            }
        }
    }
}