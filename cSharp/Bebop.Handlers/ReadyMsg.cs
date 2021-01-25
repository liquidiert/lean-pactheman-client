using Bebop.Attributes;
using Bebop.Runtime;
using PacTheMan.Models;
using System;

namespace lean_pactheman_client {
    [RecordHandler]
    public static class ReadyHandler {

        [BindRecord(typeof(BebopRecord<ReadyMsg>))]
        public static void HandleReadyMsg(object client, ReadyMsg msg) {
            Console.WriteLine($"{GameState.Instance.OpponentName} is ready. Game will start soon.");
        }
    }
}