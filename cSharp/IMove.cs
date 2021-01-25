using PacTheMan.Models;

namespace lean_pactheman_client {
    public interface IMove {
        public Velocity GetMove(Player player);
    }
}