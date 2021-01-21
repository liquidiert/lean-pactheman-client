using Bebop.Attributes;
using Bebop.Runtime;
using PacTheMan.Models;
using System;

namespace lean_pactheman_client {
    [RecordHandler]
    public static class ScorePointHandler {

        [BindRecord(typeof(BebopRecord<ResetMsg>))]
        public static void HandleScorePointMsg(object client, ScorePointState msg) {
            GameState.Instance.ScorePointState.ScorePointPositions = msg.ScorePointPositions;
        }
    }
}