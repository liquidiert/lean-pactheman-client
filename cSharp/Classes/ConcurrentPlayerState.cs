using System;
using System.Linq;
using System.Collections.Concurrent;
using PacTheMan.Models;

namespace lean_pactheman_client {
    public class ConcurrentPlayerState {

        public MovingStates Direction { get; set; }
        public ConcurrentDictionary<Guid, Position> PlayerPositions { get; set; }
        public ConcurrentDictionary<Guid, long> Scores { get; set; }
        public ConcurrentDictionary<Guid, long> Lives { get; set; }

        public ConcurrentPlayerState() {
            var numProcs = Environment.ProcessorCount * 3;
            PlayerPositions = new ConcurrentDictionary<Guid, Position>(numProcs, 2);
            Scores = new ConcurrentDictionary<Guid, long>(numProcs, 2);
            Lives = new ConcurrentDictionary<Guid, long>(numProcs, 2);
        }

        public PlayerState ToSynchronous(SessionMsg session) {
            return new PlayerState {
                Session = session,
                Direction = this.Direction,
                Scores = this.Scores.ToDictionary((kV) => kV.Key, (kV) => kV.Value),
                Lives = this.Lives.ToDictionary((kV) => kV.Key, (kV) => kV.Value),
                PlayerPositions = this.PlayerPositions
                    .ToDictionary((kV) => kV.Key, (kV) => (BasePosition)kV.Value),
                ScorePositions = GameState.Instance.ScorePointState.ScorePointPositions
                    .ToArray<BasePosition>()
            };
        }
    }
}