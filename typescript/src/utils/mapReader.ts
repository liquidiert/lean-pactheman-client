import PositionExtended from "./extensions/positionExtensions";
import * as fs from "fs";

export default class MapReader {
    map: number[][];

    private static _instance: MapReader;

    private constructor() {
        this.map = [];
        try {
            var text = fs.readFileSync("../map.txt", 'utf8').split(/\r?\n/);
            for (var h = 0; h < text.length; h++) {
                this.map.push([]);
                for (var w = 0; w < text[h].length; w++) {
                    this.map[h].push(parseInt(text[h][w]));
                }
            }
            this.map.splice(this.map.length - 1);
        } catch (ex) {
            console.error(`Map file parsing failed! ${ex}`);
            process.exit(-1);
        }
    }

    static get Instance(): MapReader {
        if (MapReader._instance === undefined) {
            MapReader._instance = new MapReader();
        }
        return MapReader._instance;
    }

    isValidPosition(position: PositionExtended): boolean {
        if (position.x > 19 || position.y > 22) {
            throw new Error(`Position must be down scaled ${position}`);
        }
        try {
            return this.map[position.y][position.x] == 0;
        } catch (ex) {
            return false;
        }
    }
}