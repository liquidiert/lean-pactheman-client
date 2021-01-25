using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using CommandLine;
using PacTheMan.Models;

namespace lean_pactheman_client {
    class Program {

        static Player player;
        public static EventWaitHandle WaitHandle = new AutoResetEvent(false);
        static async Task Main(string[] args) {
            var map = MapReader.Instance;
            CommandLine.Parser.Default.ParseArguments<Options>(args)
                .WithParsed(CreatePlayer)
                .WithNotParsed(HandleParseError);

            // await init state
            WaitHandle.WaitOne();

            // start game loop
            while (true) {
                await Task.Delay(50);
                if (GameState.Instance.RESET_COUNTER > 0) {
                    GameState.Instance.RESET_COUNTER -= 0.05f;
                    if (GameState.Instance.RESET_COUNTER > 0) {
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
