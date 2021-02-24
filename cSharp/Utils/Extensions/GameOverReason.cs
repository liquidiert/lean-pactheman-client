using System;
using PacTheMan.Models;

namespace lean_pactheman_client {
    public static class GameOverMsgExtensions {

        public static string ToHumanReadable(this GameOverMsg msg) {

            switch (msg.Reason) {
                case GameOverReason.ExceededGameCount:
                    return "maximum number of Games has been played";
                case GameOverReason.ExceededStrikes:
                    return $"{msg.PlayerId} has exceeded the maximum strike count";
                case GameOverReason.ExceededLevelCount:
                    return "maximum number of levels has been played";
                default:
                    return "Unknown GameOver cause";
            }

        }
    }
}