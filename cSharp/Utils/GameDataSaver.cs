using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using PacTheMan.Models;

namespace lean_pactheman_client {

    /// <summary>
    /// Receives each PlayerState and Ghost position; combines and saves them (after each level) <br/>
    /// in bebop representation to a new file in ~/GameData.<br/>
    /// Each level save also contains meta data about the level.
    /// </summary>
    class GameDataSaver : IDisposable {

        FileStream _gameDataFile;
        Dictionary<long, PlayerState> _playerStates;
        Dictionary<long, Dictionary<string, Position>> _ghostPositions;
        GameData _gameData;
        bool _diposed = false;

        public GameDataSaver() {
            // in case GameData dir does not exist 
            Directory.CreateDirectory("GameData");

            GameState.Instance.NewLevelEvent += _saveLevel;
            GameState.Instance.NewGameEvent += _saveGame;
            PlayerStateHandler.PlayerStateEvent += _addPlayerState;
            GhostMoveHandler.GhostMoveEvent += _addGhostPositions;

            _playerStates = new Dictionary<long, PlayerState>();
            _ghostPositions = new Dictionary<long, Dictionary<string, Position>>();
            _gameData = new GameData();
        }

        ~GameDataSaver() => Dispose(false);

        public void Dispose() {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        public void Dispose(bool disposing) {
            if (_diposed) return;

            if (disposing) {
                _writeToFile();
            }

            _diposed = true;
        }

        async void _writeToFile() {
            _gameDataFile = File.OpenWrite($"GameData/gamedata_ptm_{new DateTimeOffset(DateTime.UtcNow).ToUnixTimeMilliseconds()}.bopr");
            if (_gameData.LevelData == null) { // no level has been finished
                _saveLevel(null, null);
            }
            _gameData.MyId = (Guid)GameState.Instance.Session.ClientId;
            await _gameDataFile.WriteAsync(_gameData.Encode());
            _gameDataFile.Close();
            _playerStates.Clear();
            _ghostPositions.Clear();
            _gameData.LevelData = null;
        }

        void _addPlayerState(object state, EventArgs args) {
            _playerStates.TryAdd(new DateTimeOffset(DateTime.UtcNow).ToUnixTimeMilliseconds(), state as PlayerState);
        }

        void _addGhostPositions(object ghostPositions, EventArgs args) {
            _ghostPositions.TryAdd(new DateTimeOffset(DateTime.UtcNow).ToUnixTimeMilliseconds(),
                (ghostPositions as Dictionary<string, BasePosition>).ToDictionary(kv => kv.Key, kv => (Position)kv.Value));
        }

        void _saveLevel(object state, EventArgs args) {
            LevelData levelData = new LevelData {
                TimeSteps = new TimeStepData[0]
            };

            foreach (var entry in _playerStates) {
                var timeStep = new TimeStepData {
                    Timestamp = entry.Key,
                    PlayerState = entry.Value
                };
                if (_ghostPositions.ContainsKey(entry.Key)) {
                    var ghostEntry = _ghostPositions[entry.Key];
                    timeStep.GhostPositions = ghostEntry.ToDictionary(kv => kv.Key, kv => (BasePosition)kv.Value);
                } else if (_ghostPositions.ContainsKey(entry.Key + 1)) {
                    var ghostEntry = _ghostPositions[entry.Key + 1];
                    timeStep.GhostPositions = ghostEntry.ToDictionary(kv => kv.Key, kv => (BasePosition)kv.Value);
                } else if (_ghostPositions.ContainsKey(entry.Key - 1)) {
                    var ghostEntry = _ghostPositions[entry.Key - 1];
                    timeStep.GhostPositions = ghostEntry.ToDictionary(kv => kv.Key, kv => (BasePosition)kv.Value);
                }
                levelData.TimeSteps = levelData.TimeSteps.Append(timeStep).ToArray();
            }

            // sort scores of last entry
            var scoresAsList = levelData.TimeSteps[levelData.TimeSteps.Length - 1].PlayerState.Scores.ToList();
            scoresAsList.Sort((s1, s2) => (int)s2.Value - (int)s1.Value);

            // determine winner via client id
            levelData.Winner = scoresAsList.ElementAt(0).Key == GameState.Instance.Session.ClientId ? "me" : "opp";

            // add curr leveldata to gamedata
            _gameData.LevelData = new LevelData[0];
            _gameData.LevelData = _gameData.LevelData.Append(levelData).ToArray();

            // clear current level
            _playerStates.Clear();
            _ghostPositions.Clear();
        }

        void _saveGame(object state, EventArgs args) {
            _writeToFile();
        }

    }
}