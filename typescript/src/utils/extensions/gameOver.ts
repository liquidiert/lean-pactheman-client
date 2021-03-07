import { IGameOverMsg, GameOverReason } from "../../models/pactheman.models";

export default function gameOverMsgToHumanReadable(msg: IGameOverMsg): string {
    if (msg.reason == GameOverReason.ExceededGameCount) {
        return 'maximum number of Games has been played';
    } else if (msg.reason == GameOverReason.ExceededStrikes) {
        return `${msg.playerId} has exceeded the maximum strike count`;
    } else if (msg.reason == GameOverReason.ExceededLevelCount) {
        return 'maximum number of levels has been played';
    } else {
        return 'Unknown GameOver cause';
    }
}