import GameState from "../../classes/gameState";
import { IPosition } from "../../models/pactheman.models";
import PositionExtended from "../../utils/extensions/positionExtensions";
import { zeros, tensor4d } from "@tensorflow/tfjs-node-gpu";
import { cloneDeep } from "lodash";
import MapReader from "../../utils/mapReader";

export default class InputVector {
    selfPosition_x: number;
    selfPosition_y: number;

    oppPosition_x: number;
    oppPosition_y: number;

    blinkyPosition_x: number;
    blinkyPosition_y: number;

    inkyPosition_x: number;
    inkyPosition_y: number;

    pinkyPosition_x: number;
    pinkyPosition_y: number;

    clydePosition_x: number;
    clydePosition_y: number;

    scorePointPositions: PositionExtended[];

    get asTensor() {
        let map = cloneDeep(MapReader.Instance.convolutionMap);
        try {
            for (let point of this.scorePointPositions) {
                let pos = point.downscaled();
                map[pos.y][pos.x][0] = 2;
            }
            map[this.selfPosition_y][this.selfPosition_x][0] = 3;
            map[this.oppPosition_y][this.oppPosition_x][0] = 4;
            map[this.blinkyPosition_y][this.blinkyPosition_x][0] = 5;
            map[this.inkyPosition_y][this.inkyPosition_x][0] = 5;
            map[this.pinkyPosition_y][this.pinkyPosition_x][0] = 5;
            map[this.clydePosition_y][this.clydePosition_x][0] = 5;
        } catch {
            return zeros([1, 22, 19, 1]);
        }
        return tensor4d([map], [1, 22, 19, 1], "int32");
    }

    get tensorlike() {
        let map = cloneDeep(MapReader.Instance.convolutionMap);
        try {
            for (let point of this.scorePointPositions) {
                let pos = point.downscaled();
                map[pos.y][pos.x][0] = 2;
            }
            map[this.selfPosition_y][this.selfPosition_x][0] = 3;
            map[this.oppPosition_y][this.oppPosition_x][0] = 4;
            map[this.blinkyPosition_y][this.blinkyPosition_x][0] = 5;
            map[this.inkyPosition_y][this.inkyPosition_x][0] = 5;
            map[this.pinkyPosition_y][this.pinkyPosition_x][0] = 5;
            map[this.clydePosition_y][this.clydePosition_x][0] = 5;
        } catch {
            // swallow
        }
        return map;
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

        let oppDownscaled = PositionExtended.fromPosition(
            GameState.Instance.playerState.playerPositions.get(
                Array.from(GameState.Instance.playerState.playerPositions.keys()).find(k => k !== GameState.Instance.session.clientId ?? "") ?? "")
            ?? { x: 0, y: 0 }).downscaled();
        this.oppPosition_x = oppDownscaled.x;
        this.oppPosition_y = oppDownscaled.y;

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

        this.scorePointPositions = cloneDeep(GameState.Instance.scorePointPositions.map(p => PositionExtended.fromPosition(p)));
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