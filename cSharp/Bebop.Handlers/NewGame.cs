using Bebop.Attributes;
using Bebop.Runtime;
using PacTheMan.Models;
using System;

namespace lean_pactheman_client {

    [RecordHandler]
    public static class NewGameMsgHandler {

        [BindRecord(typeof(BebopRecord<NewGameMsg>))]
        public static void HandleNewGameMsg(object client, NewGameMsg msg) {
            Program.SetResetCounter(4f);
            GameState.Instance.SignalNewGame((ResetMsg)msg.ResetMsg);
            Console.WriteLine("Starting new Game");
        }
    }
}