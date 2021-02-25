using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace GameDataParser {
    class Program {
        static async Task Main(string[] args) {
            List<GameData> data = await Parser.ParseAsync();
            SanitizedGameData sanitized = new SanitizedGameData(data);
            TreeLearner tL = new TreeLearner();
            Tree t = tL.LearnTree(
                sanitized,
                new List<string> {
                    "blinky",
                    "inky",
                    "pinky",
                    "clyde"
                },
                sanitized
            );
            t.Print();
        }
    }
}
