import { IPosition, MovingState } from "../models/pactheman.models";
import PositionExtended from "../utils/extensions/positionExtensions";

export default class Velocity {
    x: number = 0.0;
    y: number = 0.0;

    static get Zero(): Velocity {
        return new Velocity(0, 0);
    }

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static fromIPosition(pos: IPosition): Velocity {
        return new this(pos.x, pos.y);
    }
    static fromEPosition(pos: PositionExtended): Velocity {
        return new this(pos.x, pos.y);
    }

    static fromMovingState(state: MovingState): Velocity {
        switch(state) {
            case MovingState.Up:
                return new Velocity(0, -1);
            case MovingState.Down:
                return new Velocity(0, 1);
            case MovingState.Left:
                return new Velocity(-1, 0);
            case MovingState.Right:
                return new Velocity(1, 0);
        }
    }

    static fromSingle(val: number): Velocity {
        return new this(val, val);
    }

    static fromXY(x: number, y: number): Velocity {
        return new this(x, y);
    }

    copy(): Velocity {
        return new Velocity(this.x, this.y);
    }

    toMovingState(): MovingState {
        if (this.x == -1 && this.y == 0) {
            return MovingState.Left;
        } else if (this.x == 1 && this.y == 0) {
            return MovingState.Right;
        } else if (this.x == 0 && this.y == -1) {
            return MovingState.Up;
        } else if (this.x == 0 && this.y == 1) {
            return MovingState.Down;
        } else {
            return MovingState.Up;
        }
    }

    toPosition(): PositionExtended {
        return new PositionExtended(this.x, this.y);
    }

    round(): Velocity {
        this.x = Math.fround(this.x);
        this.y = Math.fround(this.y);
        return this;
    }

    normalize(): Velocity {
        return this.divideBy(Math.sqrt(this.x * this.x + this.y * this.y))
    }

    // helpers
    addOther(other: Velocity): Velocity {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    subOther(other: Velocity): Velocity {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }

    mulOther(other: Velocity): Velocity {
        this.x *= other.x;
        this.y *= other.y;
        return this;
    }

    divOther(other: Velocity): Velocity {
        this.x /= other.x;
        this.y /= other.y;
        return this;
    }

    addBy(val: number): Velocity {
        this.x += val;
        this.y += val;
        return this;
    }

    subBy(val: number): Velocity {
        this.x -= val;
        this.y -= val;
        return this;
    }

    multiplyBy(val: number): Velocity {
        this.x *= val;
        this.y *= val;
        return this;
    }

    divideBy(val: number): Velocity {
        this.x /= val;
        this.y /= val;
        return this;
    }
}