using Bebop.Attributes;
using Bebop.Runtime;
using PacTheMan.Models;
using System;

namespace lean_pactheman_client {

    [RecordHandler]
    public static class RewardMsgHandler {

        [BindRecord(typeof(BebopRecord<RewardMsg>))]
        public static void HandleRewardMsg(object client, RewardMsg msg) {

            GameState.Instance.GainedRewardAndNewState = msg;
            PlayerMediator.WaitRewardHandle.Set();
            
        }
    }
}