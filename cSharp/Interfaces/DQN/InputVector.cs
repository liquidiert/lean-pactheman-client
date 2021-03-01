using static Tensorflow.Binding;
using Tensorflow;
using NumSharp;
using System;
using System.Collections.Generic;
using lean_pactheman_client;
using PacTheMan.Models;
using System.Linq;

namespace lean_pactheman_client.DQN {
    public class InputVector {
        int selfPosition_X { get; set; }
        int selfPosition_Y { get; set; }

        int blinkyPosition_X { get; set; }
        int blinkyPosition_Y { get; set; }

        int inkyPosition_X { get; set; }
        int inkyPosition_Y { get; set; }

        int pinkyPosition_X { get; set; }
        int pinkyPosition_Y { get; set; }

        int clydePosition_X { get; set; }
        int clydePosition_Y { get; set; }

        public Tensor Tensor {
            get => new NDArray(
                    new float[,] {
                        {selfPosition_X, selfPosition_Y,
                        blinkyPosition_X, blinkyPosition_Y,
                        inkyPosition_X, inkyPosition_Y,
                        pinkyPosition_X, pinkyPosition_Y,
                        clydePosition_X, clydePosition_Y}
                    }
                );
        }

        public InputVector() {
            var selfDown = GameState.Instance.PlayerState.PlayerPositions[(Guid)GameState.Instance.Session.ClientId].Copy().Downscaled();
            selfPosition_X = (int)selfDown.X;
            selfPosition_Y = (int)selfDown.Y;

            var gPositions = GameState.Instance.GhostPositions.ToDictionary(kv => kv.Key, kv => kv.Value.Copy().Downscaled());
            blinkyPosition_X = (int)gPositions["blinky"].X;
            blinkyPosition_Y = (int)gPositions["blinky"].Y;

            inkyPosition_X = (int)gPositions["inky"].X;
            inkyPosition_Y = (int)gPositions["inky"].Y;

            pinkyPosition_X = (int)gPositions["pinky"].X;
            pinkyPosition_Y = (int)gPositions["pinky"].Y;

            clydePosition_X = (int)gPositions["clyde"].X;
            clydePosition_Y = (int)gPositions["clyde"].Y;
        }

        public InputVector(Position playerPosition, Dictionary<string, BasePosition> ghostPositions) {
            selfPosition_X = (int)playerPosition.Downscaled().X;
            selfPosition_Y = (int)playerPosition.Downscaled().Y;

            var gPositions = ghostPositions.ToDictionary(kv => kv.Key, kv => (kv.Value as Position).Copy().Downscaled());
            blinkyPosition_X = (int)gPositions["blinky"].X;
            blinkyPosition_Y = (int)gPositions["blinky"].Y;

            inkyPosition_X = (int)gPositions["inky"].X;
            inkyPosition_Y = (int)gPositions["inky"].Y;

            pinkyPosition_X = (int)gPositions["pinky"].X;
            pinkyPosition_Y = (int)gPositions["pinky"].Y;

            clydePosition_X = (int)gPositions["clyde"].X;
            clydePosition_Y = (int)gPositions["clyde"].Y;
        }
    }
}