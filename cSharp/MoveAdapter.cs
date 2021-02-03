using PacTheMan.Models;

namespace lean_pactheman_client {
    public class MoveAdapter : IMove {

        public MoveAdapter() {
            // add init code for your interface here
            DrunkenMaster.Init();
        }

        // exchange SimpleMoveExample with your own implementation here
        public Velocity GetMove(Player player) => DrunkenMaster.PerformMove(player).Normalize();
    }
}