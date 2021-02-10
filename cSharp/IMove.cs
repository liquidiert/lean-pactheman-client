namespace lean_pactheman_client {

    // IMove must be implemented by any move interface
    public interface IMove {
        public Velocity PerformMove(PlayerInfo info);
    }
}