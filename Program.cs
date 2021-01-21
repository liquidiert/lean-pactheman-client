using System;
using System.Collections.Generic;
using CommandLine;
using CommandLine.Text;

namespace lean_pactheman_client {
    class Program {
        static void Main(string[] args) {
            Console.WriteLine("Hello World!");
            var parsedArgs = CommandLine.Parser.Default.ParseArguments<Options>(args)
                .WithParsed(RunOptions)
                .WithNotParsed(HandleParseError);
        }

        static void RunOptions(Options opts) {
            Console.WriteLine($"{opts.Ip}, {opts.Port}");
        }
        static void HandleParseError(IEnumerable<Error> errs) {}

    }
}
