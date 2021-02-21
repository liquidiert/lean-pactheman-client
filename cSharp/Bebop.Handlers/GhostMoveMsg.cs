using Bebop.Attributes;
using Bebop.Runtime;
using PacTheMan.Models;
using System;

namespace lean_pactheman_client {

    [RecordHandler]
    public static class GhostMoveHandler {

        public static event EventHandler GhostMoveEvent;
        public static void SignalPlayerState(GhostMoveMsg move) {
            GhostMoveEvent?.Invoke(move.GhostPositions, new EventArgs());
        }

        [BindRecord(typeof(BebopRecord<GhostMoveMsg>))]
        public static void HandleGhostMove(object client, GhostMoveMsg msg) {
            try {
                foreach (var pos in msg.GhostPositions) {
                    GameState.Instance.GhostPositions
                        .AddOrUpdate(pos.Key, (id) => (Position)pos.Value, (id, p) => (Position)pos.Value);
                }
                GhostMoveHandler.SignalPlayerState(msg);
            } catch (Exception ex) {
                Console.WriteLine(ex.ToString());
            }
        }
    }
}