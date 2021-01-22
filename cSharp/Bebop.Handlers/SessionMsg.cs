using Bebop.Attributes;
using Bebop.Runtime;
using PacTheMan.Models;
using System;

namespace lean_pactheman_client {

    [RecordHandler]
    public static class SessionMsgHandler {

        [BindRecord(typeof(BebopRecord<SessionMsg>))]
        public static void HandleSessionMsg(object client, SessionMsg msg) {
            Player player = (Player) client;

            player.Session = msg;

            Console.WriteLine(player.Session.ClientId);
            Console.WriteLine(player.Session.SessionId);
        }
    }
}