using CommandLine;

namespace lean_pactheman_client {
    public class Options {

        [Option(Required = false, HelpText = "Set ip address to use.", Default = "127.0.0.1")]
        public string Ip { get; set; }

        [Option(Required = false, HelpText = "Set port to use.", Default = 5387)]
        public int Port { get; set; }

        [Option('p', "--playerName", Required = true, HelpText = "Your name")]
        public string PlayerName { get; set; }
    }
}