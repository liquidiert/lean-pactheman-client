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

        public ConcurrentPlayerState PlayerState { get; set; }
        public ConcurrentScorePointState ScorePointState { get; set; }
        public ConcurrentDictionary<string, Position> GhostPositions { get; set; }
        public string OpponentName { get; set; }
    }
}