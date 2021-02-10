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
    }
    class Program {

        static Player player;
        static float RESET_COUNTER = 0f;
        public static EventWaitHandle WaitHandle = new AutoResetEvent(false);
        
        public static void SetResetCounter(float counter) {
            RESET_COUNTER = counter;
        }
        
        static async Task Main(string[] args) {
            await Task.Run(() => MapGraph.Instance.Init(MapReader.Instance.Map));
            CommandLine.Parser.Default.ParseArguments<Options>(args)
                .WithParsed(CreatePlayer)
                .WithNotParsed(HandleParseError);

            // await init state
            WaitHandle.WaitOne();

            // start game loop
            while (true) {
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

        static async void CreatePlayer(Options opts) {
            IPAddress ipAddress;
            // parse ip
            if (!IPAddress.TryParse(opts.Ip, out ipAddress)) {
                Console.WriteLine("Error: invalid ip address");
            }

            GameState.Instance.Init();

            player = new Player(opts.PlayerName);
            await player.Connect(ipAddress, opts.Port);

            if (!opts.Host) {
                Console.WriteLine("Enter session id:");
                var sessionId = Console.ReadLine();
                player.Session = new SessionMsg {
                    SessionId = sessionId
                };
                await player.Join();
            } else {
                await player.Host();
            }

        }
        static void HandleParseError(IEnumerable<Error> errs) {}

    }
}
