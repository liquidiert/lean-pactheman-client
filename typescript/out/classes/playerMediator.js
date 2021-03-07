"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const async_completer_1 = __importDefault(require("async-completer"));
class PlayerMediator {
    static setPlayer(p) {
        PlayerMediator._playerInstance = p;
    }
    static waitInitFuture() {
        this.rewardCompleter = new async_completer_1.default();
        this.rewardWaitFuture = this.rewardCompleter.promise;
        return this.rewardWaitFuture;
    }
    static completeInitFuture() {
        this.rewardCompleter?.complete(true);
        this.rewardWaitFuture = null;
    }
    static async receivePlayerStateUpdate(update) {
        try {
            PlayerMediator._playerInstance.updateState(update);
            PlayerMediator._playerInstance.sendState();
            return await PlayerMediator.waitInitFuture() ?? false;
        }
        catch (ex) {
            console.error(ex);
            return false;
        }
    }
}
exports.default = PlayerMediator;
PlayerMediator.rewardWaitFuture = null;
PlayerMediator.rewardCompleter = null;
