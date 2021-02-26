namespace lean_pactheman_client {
    public class MoveAdapter {

        IMove moveInstructor { get; set; }

        public MoveAdapter() {
            // exchange SimpleMoveExample with your own implementation here
            moveInstructor = new BehaviorTreeAI();
        }

        public (bool SendMove, Velocity Velocity) GetMove(PlayerInfo info) => moveInstructor.PerformMove(info);
    }
}