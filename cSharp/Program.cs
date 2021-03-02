using static Tensorflow.Binding;
using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using CommandLine;
using PacTheMan.Models;
using NumSharp;
using Tensorflow;

namespace lean_pactheman_client {

    public class Test {
        Session sess { get; set; }

        public void RunAThing() {
            var res = new NDArray(np.float32, new Shape(new int[] { 10 }));
            res[0] = 2f;
            res[1] = 1f;
            res[2] = 3f;
            Console.WriteLine((float)res[0]);

            var tensor = tf.constant(new float[] { 1f, 2f, 3f, 8f, 5f, 6f, 7f });
            var maxVal = sess.run(tf.argmax(tensor));

            Console.WriteLine((int)maxVal.GetInt64(0));
        }

        public Test() {
            var init = tf.global_variables_initializer();
            sess = tf.Session();
            sess.run(init);
        }
    }

    class Program {

        static Player player { get; set; }
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

            //tf.enable_eager_execution();

            /* var t = new Test();
            t.RunAThing(); */


            //Environment.Exit(0);

            // initialization

            IPAddress ipAddress;
            // parse ip
            if (!IPAddress.TryParse(options.Ip, out ipAddress)) {
                Console.WriteLine("Error: invalid ip address");
            }

            GameState.Instance.Init();

            using (player = new Player(options.PlayerName)) {
                PlayerMediator.SetPlayer(player);
                await player.Connect(options.Ip, options.Port);

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
