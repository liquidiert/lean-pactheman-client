using Bebop.Attributes;
using Bebop.Runtime;
using PacTheMan.Models;
using System;

namespace lean_pactheman_client {

    [RecordHandler]
    public static class PlayerJoinedHandler {

        [BindRecord(typeof(BebopRecord<PlayerJoinedMsg>))]
        public async static void HandlePlayerJoinedMsg(object client, PlayerJoinedMsg msg) {
            Console.WriteLine($"{msg.PlayerName} joined");
            GameState.Instance.OpponentName = msg.PlayerName;

            await (client as Player).SetReady();
        }
    }
}