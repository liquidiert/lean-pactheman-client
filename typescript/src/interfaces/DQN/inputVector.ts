import GameState from "../../classes/gameState";
import { IPosition } from "../../models/pactheman.models";
import PositionExtended from "../../utils/extensions/positionExtensions";
import { tensor } from "@tensorflow/tfjs-node";

export default class InputVector {
    selfPosition_x: number;
    selfPosition_y: number;

    blinkyPosition_x: number;
    blinkyPosition_y: number;

    inkyPosition_x: number;
    inkyPosition_y: number;

    pinkyPosition_x: number;
    pinkyPosition_y: number;

    clydePosition_x: number;
    clydePosition_y: number;

    get asTensor() {
        return tensor([this.selfPosition_x, this.selfPosition_y, this.blinkyPosition_x, this.blinkyPosition_y,
        this.inkyPosition_x, this.inkyPosition_y, this.pinkyPosition_x, this.pinkyPosition_y,
        this.clydePosition_x, this.clydePosition_y], [1, 10]);
    }

    get tensorlike() {
        return [this.selfPosition_x, this.selfPosition_y, this.blinkyPosition_x, this.blinkyPosition_y,
        this.inkyPosition_x, this.inkyPosition_y, this.pinkyPosition_x, this.pinkyPosition_y,
        this.clydePosition_x, this.clydePosition_y];
    }

    get shape() {
        return [10];
    }

    constructor() {
        let selfDownscaled = PositionExtended.fromPosition(
            GameState.Instance.playerState.playerPositions.get(GameState.Instance.session.clientId ?? "")
            ?? { x: 0, y: 0 }).downscaled();
        this.selfPosition_x = selfDownscaled.x;
        this.selfPosition_y = selfDownscaled.y;

        let blinky = PositionExtended.fromPosition(GameState.Instance.ghostPositions.get("blinky") ?? { x: 0, y: 0 }).downscaled();
        this.blinkyPosition_x = blinky.x;
        this.blinkyPosition_y = blinky.y;

        let inky = PositionExtended.fromPosition(GameState.Instance.ghostPositions.get("blinky") ?? { x: 0, y: 0 }).downscaled();
        this.inkyPosition_x = inky.x;
        this.inkyPosition_y = inky.y;

        let pinky = PositionExtended.fromPosition(GameState.Instance.ghostPositions.get("blinky") ?? { x: 0, y: 0 }).downscaled();
        this.pinkyPosition_x = pinky.x;
        this.pinkyPosition_y = pinky.y;

        let clyde = PositionExtended.fromPosition(GameState.Instance.ghostPositions.get("blinky") ?? { x: 0, y: 0 }).downscaled();
        this.clydePosition_x = clyde.x;
        this.clydePosition_y = clyde.y;
    }

    static fromStateUpdate(selfPos: IPosition, ghostPositions: Map<string, IPosition>) {
        let vector = new InputVector();

        let selfDownscaled = PositionExtended.fromPosition(selfPos).downscaled();
        vector.selfPosition_x = selfDownscaled.x;
        vector.selfPosition_y = selfDownscaled.y;

        let blinky = PositionExtended.fromPosition(ghostPositions.get("blinky") ?? { x: 0, y: 0 }).downscaled();
        vector.blinkyPosition_x = blinky.x;
        vector.blinkyPosition_y = blinky.y;

        let inky = PositionExtended.fromPosition(ghostPositions.get("blinky") ?? { x: 0, y: 0 }).downscaled();
        vector.inkyPosition_x = inky.x;
        vector.inkyPosition_y = inky.y;

        let pinky = PositionExtended.fromPosition(ghostPositions.get("blinky") ?? { x: 0, y: 0 }).downscaled();
        vector.pinkyPosition_x = pinky.x;
        vector.pinkyPosition_y = pinky.y;

        let clyde = PositionExtended.fromPosition(ghostPositions.get("blinky") ?? { x: 0, y: 0 }).downscaled();
        vector.clydePosition_x = clyde.x;
        vector.clydePosition_y = clyde.y;

        return vector;
    }
}