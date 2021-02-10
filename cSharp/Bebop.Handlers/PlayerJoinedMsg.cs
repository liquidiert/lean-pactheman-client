using Bebop.Attributes;
using Bebop.Runtime;
using PacTheMan.Models;
using System;

namespace lean_pactheman_client {

    [RecordHandler]
    public static class PlayerJoinedHandler {

        static string opponentName { get; set; }
        public static string OpponentName { get => opponentName; }

        [BindRecord(typeof(BebopRecord<PlayerJoinedMsg>))]
        public async static void HandlePlayerJoinedMsg(object client, PlayerJoinedMsg msg) {
            Console.WriteLine($"{msg.PlayerName} joined");
            opponentName = msg.PlayerName;

            await (client as Player).SetReady();
        }
    }
}