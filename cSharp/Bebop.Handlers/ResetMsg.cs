using Bebop.Attributes;
using Bebop.Runtime;
using PacTheMan.Models;

namespace lean_pactheman_client {
    [RecordHandler]
    public static class ResetHandler {

        [BindRecord(typeof(BebopRecord<ResetMsg>))]
        public static void HandleResetMsg(object client, ResetMsg msg) {
            Player player = (Player)client;
            GameState.Instance.RESET_COUNTER = 4f;
            player.Position = player.StartPosition;
        }
    }
}