using System;

namespace lean_pactheman_client {
    public class MoveAdapter : IDisposable {

        bool _disposed = false;
        IMove moveInstructor { get; set; }

        public MoveAdapter() {
            // exchange SimpleMoveExample with your own implementation here
            moveInstructor = new NaiveHooman();
        }

        public void Dispose() => Dispose(true);
        protected void Dispose(bool disposing) {
            if (_disposed) return;

            if (disposing) {
                moveInstructor.Dispose();
            }

            _disposed = true;
        }

        public (bool SendMove, Velocity Velocity) GetMove(PlayerInfo info) => moveInstructor.PerformMove(info);

    }
}
