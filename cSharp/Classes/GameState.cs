using System;
using System.Collections.Concurrent;
using PacTheMan.Models;

namespace lean_pactheman_client {

    public class NewGameEventArgs : EventArgs {
        public ResetMsg ResetMessage { get; set; }

        public NewGameEventArgs(ResetMsg r) => ResetMessage = r; 
    }

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
        public void SignalReset(ResetMsg msg) {
            ResetEvent?.Invoke(msg, new EventArgs());
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

        public event EventHandler NewGameEvent;
        public void SignalNewGame(ResetMsg msg) {
            foreach (var gP in msg.GhostResetPoints) {
                GhostPositions.AddOrUpdate(gP.Key, p => (Position)gP.Value, (k,p) => (Position)gP.Value);
            }
            foreach (var p in msg.PlayerResetPoints) {
                PlayerState.PlayerPositions.AddOrUpdate(p.Key, pp => (Position)p.Value, (k,pp) => (Position)p.Value);
            }
            NewGameEvent?.Invoke(this, new NewGameEventArgs(msg));
        }

        // state of the two pactheman players
        public ConcurrentPlayerState PlayerState { get; set; }
        // state of the score points; currently only stores their positions
        public ConcurrentScorePointState ScorePointState { get; set; }
        // ghost positions
        public ConcurrentDictionary<string, Position> GhostPositions { get; set; }
        public RewardMsg GainedRewardAndNewState { get; set; }
        // current session
        public SessionMsg Session { get; set; }
        // strike count
        public int StrikeCount = 0;

    }
}