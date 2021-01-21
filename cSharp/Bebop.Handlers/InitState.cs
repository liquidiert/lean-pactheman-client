using Bebop.Attributes;
using Bebop.Runtime;
using PacTheMan.Models;
using System;

namespace lean_pactheman_client {

    [RecordHandler]
    public static class InitStateHandler {

        [BindRecord(typeof(BebopRecord<InitState>))]
        public static void HandleInitStateMsg(object client, InitState msg) {
            Player player = (Player) client;

            foreach (var pos in msg.PlayerInitPositions) {
                GameState.Instance.PlayerState.PlayerPositions.AddOrUpdate(pos.Key, (id) => (Position)pos.Value, (id, p) => (Position)pos.Value);
            }
            foreach (var live in msg.PlayerInitLives) {
                GameState.Instance.PlayerState.Lives.AddOrUpdate(live.Key, (id) => live.Value, (id, l) => live.Value);
            }
            foreach (var score in msg.PlayerInitScores) {
                GameState.Instance.PlayerState.Scores.AddOrUpdate(score.Key, (id) => score.Value, (id, l) => score.Value);
            }
            
            foreach (var ghost in msg.GhostInitPositions) {
                GameState.Instance.GhostPositions
                    .AddOrUpdate(ghost.Key, (id) => (Position)ghost.Value, (id, pos) => (Position)ghost.Value);
            }

            player.Position = player.StartPosition = (Position)msg.PlayerInitPositions[player.Session.ClientId ?? Guid.NewGuid()];
            foreach (var pos in msg.PlayerInitPositions) {
                GameState.Instance.PlayerState.PlayerPositions.AddOrUpdate(pos.Key, (id) => (Position)pos.Value, (id, p) => (Position)pos.Value);
            }

        }
    }
}