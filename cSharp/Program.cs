using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using CommandLine;
using PacTheMan.Models;

namespace lean_pactheman_client {

    public static class Constants {
        public const float FRAME_DELTA_APPROX = 0.0167f;
        public const int MAX_STRIKE_COUNT = 3;
    }
    class Program {

        static Player player;
        static float RESET_COUNTER = 0f;
        public static EventWaitHandle WaitHandle = new AutoResetEvent(false);
        static Options options;
        static GameDataSaver saver;
        public static bool GameOver = false;
        
        public static void SetResetCounter(float counter) {
            RESET_COUNTER = counter;
        }

        static async Task Main(string[] args) {

            await Task.Run(() => MapGraph.Instance.Init(MapReader.Instance.Map));
            options = CommandLine.Parser.Default.ParseArguments<Options>(args).MapResult((opts) => opts, (errs) => HandleParseError(errs));

            if (options == null) {
                Console.WriteLine("Couldn't parse arguments");
                Environment.Exit(-1);
            }
            
            // initialization

            IPAddress ipAddress;
            // parse ip
            if (!IPAddress.TryParse(options.Ip, out ipAddress)) {
                Console.WriteLine("Error: invalid ip address");
            }

            GameState.Instance.Init();

            player = new Player(options.PlayerName);
            await player.Connect(ipAddress, options.Port);

            if (!options.Host) {
                Console.WriteLine("Enter session id:");
                var sessionId = Console.ReadLine();
                GameState.Instance.Session = new SessionMsg {
                    SessionId = sessionId
                };
                await player.Join();
            } else {
                await player.Host(options.LevelCount, options.GameCount);
            }

            if (options.LogGameData) {
                // use dispose pattern if logging gamedata
                using (saver = new GameDataSaver()) {
                    await GameLoop();
                }
            } else {
                await GameLoop();
            }

        }

        static async Task GameLoop() {
            // await init state
            WaitHandle.WaitOne();

            // start game loop
            while (!GameOver) {
                await Task.Delay(50);
                if (RESET_COUNTER > 0) {
                    RESET_COUNTER -= 0.05f;
                    if (RESET_COUNTER > 0) {
                        continue;
                    }
                }
                player.Move();
            }
        }

        static Options HandleParseError(IEnumerable<Error> errs) {
            return null;
        }

    }
}
