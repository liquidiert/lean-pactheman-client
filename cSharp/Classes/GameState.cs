using System;
using System.Collections.Concurrent;
using PacTheMan.Models;

namespace lean_pactheman_client {
    public class GameState {
        private static readonly Lazy<GameState> lazy = new Lazy<GameState>(() => new GameState());
        public static GameState Instance { get => lazy.Value; }
        private GameState() {
            var numProcs = System.Environment.ProcessorCount * 3;
            GhostPositions = new ConcurrentDictionary<string, Position>(numProcs, 4);
        }

        public PlayerState PlayerState { get; set; }
        public ScorePointState ScorePointState { get; set; }
        public ConcurrentDictionary<string, Position> GhostPositions { get; set; }
    }
}