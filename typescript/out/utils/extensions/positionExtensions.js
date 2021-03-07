"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PositionExtended {
    constructor(x, y) {
        this.x = 0.0;
        this.y = 0.0;
        this.x = x;
        this.y = y;
    }
    static get Zero() {
        return new PositionExtended(0, 0);
    }
    static fromVelocity(v) {
        return new this(v.x, v.y);
    }
    static fromPosition(pos) {
        return new this(pos.x, pos.y);
    }
    static fromSingle(val) {
        return new this(val, val);
    }
    static fromXY(x, y) {
        return new this(x, y);
    }
    toIPosition() {
        return { x: this.x, y: this.y };
    }
    copy() {
        return new PositionExtended(this.x, this.y);
    }
    downscaled() {
        return new PositionExtended(Math.floor(this.x / 64), Math.floor(this.y / 64));
    }
    interpolated(other) {
        return new PositionExtended((this.x + other.x) / 2, (this.y + other.y) / 2);
    }
    interpolatedIPos(other) {
        return new PositionExtended((this.x + other.x) / 2, (this.y + other.y) / 2);
    }
    addOther(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }
}
exports.default = PositionExtended;
