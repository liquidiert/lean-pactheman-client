using Bebop.Attributes;
using Bebop.Runtime;
using PacTheMan.Models;
using System;

namespace lean_pactheman_client {

    [RecordHandler]
    public static class NewLevelMsgHandler {

        [BindRecord(typeof(BebopRecord<NewLevelMsg>))]
        public static void HandleNewLevelMsg(object client, NewLevelMsg msg) {
            Program.SetResetCounter(4f);
            GameState.Instance.SignalReset();
            Console.WriteLine("Starting new Level");
        }
    }
}