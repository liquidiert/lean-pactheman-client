using PacTheMan.Models;

namespace lean_pactheman_client {
    public class MoveAdapter : IMove {
        // exchange SimpleMoveExample with your own implementation here
        public Velocity GetMove(Player player) => SimpleMoveExample.PerformMove(player);
    }
}