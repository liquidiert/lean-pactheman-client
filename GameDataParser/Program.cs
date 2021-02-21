using System;
using System.Threading.Tasks;

namespace GameDataParser {
    class Program {
        static async Task Main(string[] args) {
            GameData data = await Parser.ParseAsync();
            Console.WriteLine(data.LevelData.Length);
        }
    }
}
