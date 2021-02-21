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
        /// A concatenated GameData object.
        /// </returns>
        public static async Task<GameData> ParseAsync() {
            List<LevelData> levelDatas = new List<LevelData>();
            foreach (var boprFilePath in Directory.GetFiles("../cSharp/GameData")) {
                var inputBytes = await File.ReadAllBytesAsync(boprFilePath);
                var data = GameData.Decode(inputBytes);
                levelDatas.AddRange(data.LevelData.Cast<LevelData>());
            }
            return new GameData {
                LevelData = levelDatas.ToArray()
            };
        }
        /// <summary>
        /// Parses all .bopr files from a given GameData dir.
        /// </summary>
        /// <param name="gameDataDir">The directory to parse .bopr files from.</param>
        /// <returns>
        /// A concatenated GameData object of all files in <c>gameDataDir</c>.
        /// </returns>
        public static async Task<GameData> ParseAsync(DirectoryInfo gameDataDir) {
            List<LevelData> levelDatas = new List<LevelData>();
            foreach (var boprFilePath in gameDataDir.GetFiles()) {
                var inputBytes = await File.ReadAllBytesAsync(boprFilePath.FullName);
                var data = GameData.Decode(inputBytes);
                levelDatas.AddRange(data.LevelData.Cast<LevelData>());
            }
            return new GameData {
                LevelData = levelDatas.ToArray()
            };
        }
        /// <summary>
        /// Parses the given .bopr file.
        /// </summary>
        /// <param name="gameDataFile">The .bopr file to parse.</param>
        /// <returns>
        /// A GameData object parsed from <c>gameDataFile</c>.
        /// </returns>
        public static async Task<GameData> ParseAsync(FileInfo gameDataFile) {
            return GameData.Decode(await File.ReadAllBytesAsync(gameDataFile.FullName));
        }
    }
}