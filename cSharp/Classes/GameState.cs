using System;
using System.Collections.Concurrent;
using PacTheMan.Models;

namespace lean_pactheman_client {
    public class GameState {
        private static readonly Lazy<GameState> lazy = new Lazy<GameState>(() => new GameState());
        public static GameState Instance { get => lazy.Value; }
        private GameState() {}

        public void Init() {
            var numProcs = System.Environment.ProcessorCount * 3;
            GhostPositions = new ConcurrentDictionary<string, Position>(numProcs, 4);
            PlayerState = new ConcurrentPlayerState();
            ScorePointState = new ConcurrentScorePointState();
        }

        public event EventHandler ResetEvent;
        public void SignalReset() {
            ResetEvent?.Invoke(this, new EventArgs());
        }

        public event EventHandler ExitEvent;
        public void SignalExit() {
            ExitEvent?.Invoke(this, new EventArgs());
        }

        public event EventHandler StrikeEvent;
        public void SignalStrike() {
            StrikeCount++;
            StrikeEvent?.Invoke(this, new EventArgs());
        }

        public event EventHandler NewLevelEvent;
        public void SignalNewLevel() {
            NewLevelEvent?.Invoke(this, new EventArgs());
        }

        // state of the two pactheman players
        public ConcurrentPlayerState PlayerState { get; set; }
        // state of the score points; currently only stores their positions
        public ConcurrentScorePointState ScorePointState { get; set; }
        // ghost positions
        public ConcurrentDictionary<string, Position> GhostPositions { get; set; }
        // strike count
        public int StrikeCount = 0;

    }
}