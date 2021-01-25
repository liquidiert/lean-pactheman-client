using Bebop.Attributes;
using Bebop.Runtime;
using PacTheMan.Models;
using System.Collections.Concurrent;

namespace lean_pactheman_client {
    [RecordHandler]
    public static class ScorePointHandler {

        [BindRecord(typeof(BebopRecord<ScorePointState>))]
        public static void HandleScorePointMsg(object client, ScorePointState msg) {
            GameState.Instance.ScorePointState.ScorePointPositions = new ConcurrentBag<Position>(msg.ScorePointPositions as Position[]);
        }
    }
}