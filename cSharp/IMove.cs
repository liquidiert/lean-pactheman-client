namespace lean_pactheman_client {

    /// <summary>
    /// The base interface for communication with the server / player instance.<br/>
    /// IMove must be implemented by any ai interface.
    /// </summary>
    public interface IMove {
        /// <summary>
        /// A default implementation for ai interfaces that only use PerformMoveAsync.
        /// Other interfaces have to override this method.
        /// </summary>
        /// <param name="info">A <c>PlayerInfo</c> object containing the current state of the player.</param>
        /// <returns>
        /// An inplace tuple consisting of: <br/>
        ///     - <c>bool</c> SendMove: Wheter the player instance should send this move to the server <br/>
        ///     - <c>Velocity</c> Velocity: The Velocity to apply for the player instance
        /// </returns>
        (bool SendMove, Velocity Velocity) PerformMove(PlayerInfo info) {
            PerformMoveAsync(info);
            return (false, Velocity.Zero);
        }
# pragma warning disable 1998
        /// <summary>
        /// The asynchronous version of PerformMove. <br/>
        /// Meant to be used if the ai interface requires immediate PlayerState updates.
        /// </summary>
        /// <param name="info">A <c>PlayerInfo</c> object containing the current state of the player.</param>
        async void PerformMoveAsync(PlayerInfo info) {}
# pragma warning restore
    }
}