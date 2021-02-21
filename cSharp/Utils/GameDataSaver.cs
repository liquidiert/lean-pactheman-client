using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using PacTheMan.Models;

namespace lean_pactheman_client {
    
    /// <summary>
    /// Receives each PlayerState and Ghost position; combines and saves them (after each level) <br/>
    /// in bebop representation to a new file in ~/GameData.<br/>
    /// Each level save also contains meta data about the level.
    /// </summary>
    public class GameDataSaver {

        FileStream _gameDataFile;
        Dictionary<long, PlayerState> _playerStates;
        Dictionary<long, GhostMoveMsg> _ghostPositions;
        GameData _gameData;

        public GameDataSaver() {
            // in case GameData dir does not exist 
            Directory.CreateDirectory("../GameData");

            GameState.Instance.NewLevelEvent += _saveLevel;
            
            _playerStates = new Dictionary<long, PlayerState>();
            _ghostPositions = new Dictionary<long, GhostMoveMsg>();
            _gameData = new GameData();
        }

        ~GameDataSaver() {
            _gameDataFile = File.OpenWrite($"../GameData/gamedata_ptm_{new DateTimeOffset(DateTime.Now).ToUnixTimeMilliseconds()}.bopr");
            _gameDataFile.WriteAsync(_gameData.Encode());
            _gameDataFile.Close();
            _playerStates.Clear();
            _ghostPositions.Clear();
        }

        void _saveLevel(object state, EventArgs args) {
            LevelData levelData = new LevelData();
            foreach (var entry in _playerStates) {
                var timeStep = new TimeStepData {
                    Timestep = entry.Key,
                    PlayerState = entry.Value
                };
                if (_ghostPositions.ContainsKey(entry.Key + 1)) {
                    var ghostEntry = _ghostPositions[entry.Key + 1];
                    timeStep.GhostPositions = ghostEntry;
                } else if (_ghostPositions.ContainsKey(entry.Key - 1)) {
                    var ghostEntry = _ghostPositions[entry.Key - 1];
                    timeStep.GhostPositions = ghostEntry;
                }
                levelData.TimeSteps.Append(timeStep);
            }
            _gameData.LevelData.Append(levelData);
            _playerStates.Clear();
            _ghostPositions.Clear();
        }

    }
}