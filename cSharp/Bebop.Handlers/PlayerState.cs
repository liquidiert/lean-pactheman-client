using Bebop.Attributes;
using Bebop.Runtime;
using PacTheMan.Models;
using System.Linq;
using System.Collections.Concurrent;

namespace lean_pactheman_client {

    [RecordHandler]
    public static class PlayerStateHandler {

        [BindRecord(typeof(BebopRecord<PlayerState>))]
        public static void HandlePlayerStateMsg(object client, PlayerState msg) {
            Player player = (Player) client;

            foreach (var clientId in msg.PlayerPositions.Keys) {
                GameState.Instance.PlayerState.Lives
                    .AddOrUpdate(clientId, id => msg.Lives[clientId], (id, live) => msg.Lives[clientId]);
                GameState.Instance.PlayerState.Scores
                    .AddOrUpdate(clientId, id => msg.Scores[clientId], (id, score) => msg.Scores[clientId]);
                GameState.Instance.ScorePointState.ScorePointPositions = 
                    new ConcurrentBag<Position>(GameState.Instance.ScorePointState.ScorePointPositions
                        .Intersect(msg.ScorePositions.Select(p => (Position)p)));
                if (clientId != player.Session.ClientId) {
                    var oppPos = (Position)msg.PlayerPositions[clientId];
                    if (oppPos.X > 70 && oppPos.X < 1145) {
                        GameState.Instance.PlayerState.PlayerPositions[clientId] =
                            GameState.Instance.PlayerState.PlayerPositions[clientId].Interpolated(oppPos);
                    } else {
                        GameState.Instance.PlayerState.PlayerPositions[clientId] = oppPos;
                    }
                }
            }
        }
    }
}