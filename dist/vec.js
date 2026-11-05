"use strict";
function deg2rad(deg) {
    return deg * Math.PI / 180;
}
class Vec2 {
    x;
    y;
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    len() {
        return Math.hypot(this.x, this.y);
    }
    copy() {
        return new Vec2(this.x, this.y);
    }
    neg() {
        return new Vec2(-this.x, -this.y);
    }
    unit() {
        return this.div(this.len());
    }
    add(other) {
        return new Vec2(this.x + other.x, this.y + other.y);
    }
    sub(other) {
        return new Vec2(this.x - other.x, this.y - other.y);
    }
    mul(k) {
        return new Vec2(this.x * k, this.y * k);
    }
    div(k) {
        return new Vec2(this.x / k, this.y / k);
    }
}
class Vec3 {
    x;
    y;
    z;
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    copy() {
        return new Vec3(this.x, this.y, this.z);
    }
    neg() {
        return new Vec3(-this.x, -this.y, -this.z);
    }
    add(other) {
        return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
    }
    sub(other) {
        return new Vec3(this.x - other.x, this.y - other.y, this.z - other.z);
    }
    mul(k) {
        return new Vec3(this.x * k, this.y * k, this.z * k);
    }
    div(k) {
        return new Vec3(this.x / k, this.y / k, this.z / k);
    }
    proj() {
        return new Vec2(this.x / this.z, this.y / this.z);
    }
    pm() {
        return new Vec3(this.y, this.z, this.x);
    }
    rotX(t) {
        t = deg2rad(t);
        const c = Math.cos(t);
        const s = Math.sin(t);
        return new Vec3(this.x, this.y * c - this.z * s, this.y * s + this.z * c);
    }
    rotY(t) {
        t = deg2rad(t);
        const c = Math.cos(t);
        const s = Math.sin(t);
        return new Vec3(this.x * c + this.z * s, this.y, this.z * c - this.x * s);
    }
    rotZ(t) {
        t = deg2rad(t);
        const c = Math.cos(t);
        const s = Math.sin(t);
        return new Vec3(this.x * c - this.y * s, this.x * s + this.y * c, this.z);
    }
}
class Mat3 {
    xx;
    xy;
    xz;
    yx;
    yy;
    yz;
    zx;
    zy;
    zz;
    constructor(xx = 1, xy = 0, xz = 0, yx = 0, yy = 1, yz = 0, zx = 0, zy = 0, zz = 1) {
        this.xx = xx;
        this.xy = xy;
        this.xz = xz;
        this.yx = yx;
        this.yy = yy;
        this.yz = yz;
        this.zx = zx;
        this.zy = zy;
        this.zz = zz;
    }
    copy() {
        return new Mat3(this.xx, this.xy, this.xz, this.yx, this.yy, this.yz, this.zx, this.zy, this.zz);
    }
    neg() {
        return new Mat3(-this.xx, -this.xy, -this.xz, -this.yx, -this.yy, -this.yz, -this.zx, -this.zy, -this.zz);
    }
    add(other) {
        return new Mat3(this.xx + other.xx, this.xy + other.xy, this.xz + other.xz, this.yx + other.yx, this.yy + other.yy, this.yz + other.yz, this.zx + other.zx, this.zy + other.zy, this.zz + other.zz);
    }
    sub(other) {
        return new Mat3(this.xx - other.xx, this.xy - other.xy, this.xz - other.xz, this.yx - other.yx, this.yy - other.yy, this.yz - other.yz, this.zx - other.zx, this.zy - other.zy, this.zz - other.zz);
    }
    mul(other) {
        if (other instanceof Vec3)
            return new Vec3(this.xx * other.x + this.xy * other.y + this.xz * other.z, this.yx * other.x + this.yy * other.y + this.yz * other.z, this.zx * other.x + this.zy * other.y + this.zz * other.z);
        else if (other instanceof Mat3)
            return new Mat3(this.xx * other.xx + this.xy * other.yx + this.xz * other.zx, this.xx * other.xy + this.xy * other.yy + this.xz * other.zy, this.xx * other.xz + this.xy * other.yz + this.xz * other.zz, this.yx * other.xx + this.yy * other.yx + this.yz * other.zx, this.yx * other.xy + this.yy * other.yy + this.yz * other.zy, this.yx * other.xz + this.yy * other.yz + this.yz * other.zz, this.zx * other.xx + this.zy * other.yx + this.zz * other.zx, this.zx * other.xy + this.zy * other.yy + this.zz * other.zy, this.zx * other.xz + this.zy * other.yz + this.zz * other.zz);
        else
            return new Mat3(this.xx * other, this.xy * other, this.xz * other, this.yx * other, this.yy * other, this.yz * other, this.zx * other, this.zy * other, this.zz * other);
    }
    div(other) {
        return new Mat3(this.xx / other, this.xy / other, this.xz / other, this.yx / other, this.yy / other, this.yz / other, this.zx / other, this.zy / other, this.zz / other);
    }
}
function rotZ(t) {
    t = deg2rad(t);
    return new Mat3(Math.cos(t), -Math.sin(t), 0, Math.sin(t), Math.cos(t), 0, 0, 0, 1);
}
