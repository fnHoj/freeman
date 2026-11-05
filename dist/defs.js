"use strict";
class Note {
    t;
    sx;
    sy;
    swing;
    x;
    y;
    constructor(t, sx, sy, swing, x, y) {
        this.t = t;
        this.sx = sx;
        this.sy = sy;
        this.swing = swing ?? null;
        this.x = x;
        this.y = y;
    }
}
class TrailNode {
    x0;
    y0;
    v0;
    v1;
    o0;
    o1;
    t0;
    t1;
    constructor(x0, y0, v0, v1, o0, o1, t0, t1) {
        this.x0 = x0;
        this.y0 = y0;
        this.v0 = v0;
        this.v1 = v1;
        this.o0 = o0;
        this.o1 = o1;
        this.t0 = t0;
        this.t1 = t1;
    }
    o(t) {
        return (this.o0 * (this.t1 - t) + this.o1 * (t - this.t0)) / (this.t1 - this.t0);
    }
    x(t) {
        return this.x0 + this.v0 * Math.cos(this.o0) * (t - this.t0);
    }
    y(t) {
        return this.y0 + this.v0 * Math.sin(this.o0) * (t - this.t0);
    }
}
