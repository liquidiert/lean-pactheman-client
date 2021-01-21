using Bebop.Attributes;
using Bebop.Runtime;
using PacTheMan.Models;

namespace lean_pactheman_client {
    [RecordHandler]
    public static class ReadyHandler {

        [BindRecord(typeof(BebopRecord<ReadyMsg>))]
        public static void HandleReadyMsg(object client, ReadyMsg msg) {
            //var lobby = (UIState.Instance.CurrentScreen as Lobby);
            //lobby.UpdateLobbyState($"{lobby.OpponentName} is ready");
        }
    }
}