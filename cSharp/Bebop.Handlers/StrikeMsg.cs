using Bebop.Attributes;
using Bebop.Runtime;
using PacTheMan.Models;
using System;

namespace lean_pactheman_client {

    [RecordHandler]
    public static class SessioStrikeMsgHandler {

        [BindRecord(typeof(BebopRecord<StrikeMsg>))]
        public static void HandleSessionMsg(object client, StrikeMsg msg) {
            GameState.Instance.SignalStrike();
            Console.Write($"Watch out this is your {GameState.Instance.StrikeCount} strike. ");
            Console.WriteLine($"Only {Constants.MAX_STRIKE_COUNT - GameState.Instance.StrikeCount} strike(s) left.");
        }
    }
}