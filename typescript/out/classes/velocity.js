"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pactheman_models_1 = require("../models/pactheman.models");
const positionExtensions_1 = __importDefault(require("../utils/extensions/positionExtensions"));
class Velocity {
    constructor(x, y) {
        this.x = 0.0;
        this.y = 0.0;
        this.x = x;
        this.y = y;
    }
    static get Zero() {
        return new Velocity(0, 0);
    }
    static fromIPosition(pos) {
        return new this(pos.x, pos.y);
    }
    static fromEPosition(pos) {
        return new this(pos.x, pos.y);
    }
    static fromMovingState(state) {
        switch (state) {
            case pactheman_models_1.MovingState.Up:
                return new Velocity(0, -1);
            case pactheman_models_1.MovingState.Down:
                return new Velocity(0, 1);
            case pactheman_models_1.MovingState.Left:
                return new Velocity(-1, 0);
            case pactheman_models_1.MovingState.Right:
                return new Velocity(1, 0);
        }
    }
    static fromSingle(val) {
        return new this(val, val);
    }
    static fromXY(x, y) {
        return new this(x, y);
    }
    copy() {
        return new Velocity(this.x, this.y);
    }
    toMovingState() {
        if (this.x == -1 && this.y == 0) {
            return pactheman_models_1.MovingState.Left;
        }
        else if (this.x == 1 && this.y == 0) {
            return pactheman_models_1.MovingState.Right;
        }
        else if (this.x == 0 && this.y == -1) {
            return pactheman_models_1.MovingState.Up;
        }
        else if (this.x == 0 && this.y == 1) {
            return pactheman_models_1.MovingState.Down;
        }
        else {
            return pactheman_models_1.MovingState.Up;
        }
    }
    toPosition() {
        return new positionExtensions_1.default(this.x, this.y);
    }
    round() {
        this.x = Math.fround(this.x);
        this.y = Math.fround(this.y);
        return this;
    }
    normalize() {
        return this.divideBy(Math.sqrt(this.x * this.x + this.y * this.y));
    }
    // helpers
    addOther(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }
    subOther(other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }
    mulOther(other) {
        this.x *= other.x;
        this.y *= other.y;
        return this;
    }
    divOther(other) {
        this.x /= other.x;
        this.y /= other.y;
        return this;
    }
    addBy(val) {
        this.x += val;
        this.y += val;
        return this;
    }
    subBy(val) {
        this.x -= val;
        this.y -= val;
        return this;
    }
    multiplyBy(val) {
        this.x *= val;
        this.y *= val;
        return this;
    }
    divideBy(val) {
        this.x /= val;
        this.y /= val;
        return this;
    }
}
exports.default = Velocity;
