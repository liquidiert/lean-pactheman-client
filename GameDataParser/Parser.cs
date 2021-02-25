using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace GameDataParser {
    public static class Parser {
        /// <summary>
        /// Parses all .bopr files in the default GameData dir (lean-pactheman-client/cSharp/GameData).
        /// </summary>
        /// <returns>
        /// A list of GameData objects.
        /// </returns>
        public static async Task<List<GameData>> ParseAsync() {
            List<GameData> res = new List<GameData>();
            foreach (var boprFilePath in Directory.GetFiles("../cSharp/GameData")) {
                var inputBytes = await File.ReadAllBytesAsync(boprFilePath);
                var data = GameData.Decode(inputBytes);
                res.Add(data);
            }
            return res;
        }
        /// <summary>
        /// Parses all .bopr files from a given GameData dir.
        /// </summary>
        /// <param name="gameDataDir">The directory to parse .bopr files from.</param>
        /// <returns>
        /// A list GameData objects of all files in <c>gameDataDir</c>.
        /// </returns>
        public static async Task<List<GameData>> ParseAsync(DirectoryInfo gameDataDir) {
            List<GameData> res = new List<GameData>();
            foreach (var boprFilePath in gameDataDir.GetFiles()) {
                var inputBytes = await File.ReadAllBytesAsync(boprFilePath.FullName);
                var data = GameData.Decode(inputBytes);
                res.Add(data);
            }
            return res;
        }
        /// <summary>
        /// Parses the given .bopr file.
        /// </summary>
        /// <param name="gameDataFile">The .bopr file to parse.</param>
        /// <returns>
        /// A list consisting of the one GameData object parsed from <c>gameDataFile</c>.
        /// </returns>
        public static async Task<List<GameData>> ParseAsync(FileInfo gameDataFile) {
            return new List<GameData> { GameData.Decode(await File.ReadAllBytesAsync(gameDataFile.FullName)) };
        }
    }
}