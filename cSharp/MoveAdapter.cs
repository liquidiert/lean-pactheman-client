namespace lean_pactheman_client {
    public class MoveAdapter : IMove {

        public MoveAdapter() {
            // add init code here
            NaiveHooman.Init();
        }

        // exchange SimpleMoveExample with your own implementation here
        public Velocity GetMove(Player player) => NaiveHooman.PerformMove(player).Normalize();
    }
}