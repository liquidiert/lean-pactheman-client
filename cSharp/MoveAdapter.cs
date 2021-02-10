namespace lean_pactheman_client {
    public class MoveAdapter {

        IMove moveInstructor;

        public MoveAdapter() {
            // exchange SimpleMoveExample with your own implementation here
            moveInstructor = new NaiveHooman();
        }

        public Velocity GetMove(Player player) => moveInstructor.PerformMove(player).Normalize();
    }
}