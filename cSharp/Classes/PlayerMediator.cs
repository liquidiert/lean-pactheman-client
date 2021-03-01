using System;
using System.Threading;
using System.Threading.Tasks;

namespace lean_pactheman_client {
    public static class PlayerMediator {
        private static Player _playerInstance { get; set; }
        public static EventWaitHandle WaitRewardHandle = new AutoResetEvent(false);

        public static void SetPlayer(Player p) => _playerInstance = p;
        /// <summary>
        /// Blocks the lean client to receive an immediate update of the player state which can be used afterwards via <c>GameState.Instance</c>.
        /// </summary>
        /// <param name="updateVelocity">The Velocity to apply for the player state update</param>
        /// <returns><c>bool</c>: Wheter update was successful or not</returns>
        public static async Task<bool> ReceivePlayerStateUpdate(Velocity updateVelocity) {
            try {
                _playerInstance.UpdateState(updateVelocity.Normalize());
                await _playerInstance.SendState();
                return WaitRewardHandle.WaitOne();
            } catch (Exception ex) {
                Console.WriteLine(ex.ToString());
                return false;
            }
        }
    }
}