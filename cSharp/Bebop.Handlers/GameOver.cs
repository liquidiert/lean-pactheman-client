using Bebop.Attributes;
using Bebop.Runtime;
using PacTheMan.Models;
using System;

namespace lean_pactheman_client {

    [RecordHandler]
    public static class GameOverMsgHandler {

        [BindRecord(typeof(BebopRecord<GameOverMsg>))]
        public static void HandleGameOverMsg(object client, GameOverMsg msg) {

            Console.WriteLine($"Received GameOver because {msg.ToHumanReadable()}. Ending lean client now.");
            Environment.Exit(0);

        }
    }
    
}