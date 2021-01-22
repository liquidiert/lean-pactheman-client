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
        static void Main(string[] args) {
            var map = MapReader.Instance;
            CommandLine.Parser.Default.ParseArguments<Options>(args)
                .WithParsed(RunOptions)
                .WithNotParsed(HandleParseError);
        }

        static async void RunOptions(Options opts) {
            IPAddress ipAddress;
            // parse ip
            if (!IPAddress.TryParse(opts.Ip, out ipAddress)) {
                Console.WriteLine("Error: invalid ip address");
            }

            GameState.Instance.Init();

            player = new Player(opts.PlayerName);
            await player.Connect(ipAddress, opts.Port);

            if (!opts.Host) {
                var sessionId = Console.ReadLine();
                player.Session = new SessionMsg {
                    SessionId = sessionId
                };
                await player.Join();
            } else {
                await player.Host();
            }

            await player.SetReady();

            // await init state
            WaitHandle.WaitOne();

            // start game loop
            while (true) {
                await Task.Delay(50);
                player.Move();
            }
        }
        static void HandleParseError(IEnumerable<Error> errs) {}

    }
}
