using CommandLine;

namespace lean_pactheman_client {
    public class Options {

        [Option(Required = false, HelpText = "Ip address to use", Default = "127.0.0.1")]
        public string Ip { get; set; }

        [Option(Required = false, HelpText = "Port to use", Default = 5387)]
        public int Port { get; set; }

        [Option(Required = true, HelpText = "The name with which you will participate at a pactheman game")]
        public string PlayerName { get; set; }

        [Option(Required = false, HelpText = "Decide wheter to host or join a session; if not given client asks for session to join", Default = false)]
        public bool Host { get; set; }

        [Option("level-count", Required = false, HelpText = "How many levels should be played", Default = 5)]
        public int LevelCount { get; set; }

        [Option("game-count", Required = false, HelpText = "How many games should be played (game ends after all lives lost or all levels played)", Default = 1)]
        public int GameCount { get; set; }

        [Option("log", Required = false, HelpText = "Wheter the lean client should log game data", Default = false)]
        public bool LogGameData { get; set; }
    }
}