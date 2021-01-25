using System;
using System.IO;
using PacTheMan.Models;

namespace lean_pactheman_client {
    public class MapReader {
        private static readonly Lazy<MapReader> lazy = new Lazy<MapReader>(() => new MapReader());
        public static MapReader Instance { get => lazy.Value; }
        private MapReader() {
            Map = new int[19, 22];
            var text = File.ReadAllLines("../map.txt");
            for (int h = 0; h < text.GetLength(0); h++) {
                for (int w = 0; w < text[h].Length; w++) {
                    Map[w, h] = int.Parse(text[h][w].ToString());
                }
            }
        }

        public int[,] Map { get; }

        public bool IsValidPosition(Position pos) {
            pos.Divide(64).Floor();
            try {
                return Map[(int)pos.X, (int)pos.Y] == 0;
            } catch (IndexOutOfRangeException) {
                return false;
            }
        }
    }
}