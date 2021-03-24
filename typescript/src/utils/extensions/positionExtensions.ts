import Velocity from "../../classes/velocity";
import { IPosition } from "../../models/pactheman.models";

export default class PositionExtended implements IPosition {
    x: number = 0.0;
    y: number = 0.0;

    static get Zero(): PositionExtended {
        return new PositionExtended(0, 0);
    }

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static fromVelocity(v: Velocity): PositionExtended {
        return new this(v.x, v.y);
    }

    static fromPosition(pos: IPosition): PositionExtended {
        return new this(pos.x, pos.y);
    }

    static fromSingle(val: number): PositionExtended {
        return new this(val, val);
    }

    static fromXY(x: number, y: number): PositionExtended {
        return new this(x, y);
    }

    toIPosition(): IPosition {
        return { x: this.x, y: this.y };
    }

    copy(): PositionExtended {
        return new PositionExtended(this.x, this.y);
    }

    downscaled(): PositionExtended {
        return new PositionExtended(Math.floor(this.x / 64), Math.floor(this.y / 64))
    }

    interpolated(other: PositionExtended): PositionExtended {
        return new PositionExtended((this.x + other.x) / 2, (this.y + other.y) / 2);
    }

    interpolatedIPos(other: IPosition): PositionExtended {
        return new PositionExtended((this.x + other.x) / 2, (this.y + other.y) / 2);
    }

    manhattanDistance(other: PositionExtended): number {
        return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
    }

    addOther(other: PositionExtended): PositionExtended {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

}