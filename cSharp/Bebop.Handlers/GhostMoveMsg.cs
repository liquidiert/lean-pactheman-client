using Bebop.Attributes;
using Bebop.Runtime;
using PacTheMan.Models;
using System;
using System.Linq;

namespace lean_pactheman_client {

    [RecordHandler]
    public static class GhostMoveHandler {

        [BindRecord(typeof(BebopRecord<GhostMoveMsg>))]
        public static void HandleGhostMove(object client, GhostMoveMsg msg) {
            try {
                foreach (var pos in msg.GhostPositions) {
                    GameState.Instance.GhostPositions
                        .AddOrUpdate(pos.Key, (id) => (Position)pos.Value, (id, p) => (Position)pos.Value);
                }
            } catch (Exception ex) {
                Console.WriteLine(ex.ToString());
            }
        }
    }
}