using System.Collections.Concurrent;
using PacTheMan.Models;

namespace lean_pactheman_client {
    public class ConcurrentScorePointState {
        public ConcurrentBag<Position> ScorePointPositions { get; set; }

        public ConcurrentScorePointState(){
            ScorePointPositions = new ConcurrentBag<Position>();
        }
    }
}