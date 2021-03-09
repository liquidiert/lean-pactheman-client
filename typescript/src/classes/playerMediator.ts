import Completer from "async-completer";
import Player from "./player";
import Velocity from "./velocity";

export default class PlayerMediator {
    static _playerInstance: Player;

    static setPlayer(p: Player) {
        PlayerMediator._playerInstance = p;
    }

    static rewardWaitFuture: Promise<boolean | undefined> | null = null;
    static rewardCompleter: Completer<boolean> | null = null;
    static waitInitFuture(): Promise<boolean | undefined> {
        this.rewardCompleter = new Completer();
        this.rewardWaitFuture = this.rewardCompleter.promise;
        return this.rewardWaitFuture;
    }
    static completeInitFuture() {
        this.rewardCompleter?.complete(true);
        this.rewardWaitFuture = null;
    }

    static async receivePlayerStateUpdate(update: Velocity): Promise<boolean> {
        try {
            PlayerMediator._playerInstance.updateState(update);
            PlayerMediator._playerInstance.sendState();
            return await PlayerMediator.waitInitFuture() ?? false;
        } catch (ex) {
            console.error(ex);
            return false;
        }
    }
}