"use strict";
class Direction {
    t;
    sx;
    sy;
    x;
    y;
    constructor(t, sx, sy, x, y) {
        this.t = t;
        this.sx = sx;
        this.sy = sy;
        this.x = x;
        this.y = y;
    }
}
class Note extends Direction {
    rh;
    swing;
    constructor(t, sx, sy, rh, swing, x, y) {
        super(t, sx, sy, x, y);
        this.rh = rh;
        this.swing = swing ?? null;
    }
}
class Hold {
    rh;
    nodes;
    constructor(rh, nodes) {
        this.rh = rh;
        this.nodes = nodes;
    }
}
class TrailNode {
    x0;
    y0;
    v0;
    v1;
    o0;
    o1;
    w;
    wr;
    w2;
    t0;
    t1;
    dt;
    a;
    b;
    dx;
    dy;
    constructor(x0, y0, v0, v1, o0, w, t0, dt) {
        this.x0 = x0;
        this.y0 = y0;
        this.v0 = v0;
        this.v1 = v1;
        this.o0 = o0;
        this.w = w;
        this.wr = deg2rad(w);
        this.w2 = this.wr * this.wr;
        this.o1 = o0 + w * dt;
        this.t0 = t0;
        this.dt = dt;
        this.t1 = t0 + dt;
        this.a = (v1 - v0) / dt;
        this.b = this.a / this.w2;
        const c0 = Math.cos(deg2rad(o0));
        const s0 = Math.sin(deg2rad(o0));
        this.dx = x0 - v0 / this.wr * s0 - this.b * c0;
        this.dy = y0 + v0 / this.wr * c0 - this.b * s0;
    }
    at(t) {
        t -= this.t0;
        const o = (this.o0 * (this.dt - t) + this.o1 * t) / this.dt;
        const c = Math.cos(deg2rad(o));
        const s = Math.sin(deg2rad(o));
        if (this.w) {
            const v = (this.v0 * (this.dt - t) + this.v1 * t) / (this.wr * this.dt);
            return { o, x: this.dx + v * s + this.b * c, y: this.dy - v * c + this.b * s };
        }
        const l = (this.v0 + this.a * t / 2) * t;
        return { o, x: this.x0 + l * c, y: this.y0 + l * s };
    }
}
class HandNode {
    t;
    p;
    v;
    constructor(t, p, v) {
        this.t = t;
        this.p = p;
        this.v = v;
    }
}
function stamp(trail, t, i = 0) {
    while (i > 0 && t < trail[i].t0)
        i--;
    while (i + 1 < trail.length && t > trail[i].t1)
        i++;
    return trail[i].at(t);
}
function hold_at(h, t, tr, i = 0) {
    while (i > 0 && t < h[i].t)
        i--;
    while (i + 2 < h.length && t > h[i + 1].t)
        i++;
    const u = (t - h[i].t) / (h[i + 1].t - h[i].t);
    const { x: hx, y: hy } = stamp(tr, t);
    const c0x = Math.cos(deg2rad(h[i].sx));
    const s0x = Math.sin(deg2rad(h[i].sx));
    const c0y = Math.cos(deg2rad(h[i].sy));
    const s0y = Math.sin(deg2rad(h[i].sy));
    const c1x = Math.cos(deg2rad(h[i + 1].sx));
    const s1x = Math.sin(deg2rad(h[i + 1].sx));
    const c1y = Math.cos(deg2rad(h[i + 1].sy));
    const s1y = Math.sin(deg2rad(h[i + 1].sy));
    const p0 = new Vec3(c0x * c0y, s0x * c0y, s0y);
    const p1 = new Vec3(c1x * c1y, s1x * c1y, s1y);
    return p0.mul(1 - u).add(p1.mul(u)).add(new Vec3(hx, hy));
}
class Song {
    title;
    artist;
    music;
    bpm;
    offset;
    start;
    end;
    x;
    y;
    o;
    diffs;
    constructor(title, artist, music, bpm, offset, start, end, x, y, o, diffs = []) {
        this.title = title;
        this.artist = artist;
        this.music = music;
        this.bpm = bpm;
        this.offset = offset;
        this.start = start;
        this.end = end;
        this.x = x;
        this.y = y;
        this.o = o;
        this.diffs = diffs;
    }
}
class Beatmap {
    id;
    name;
    diff;
    rank;
    mapper;
    at;
    trail;
    notes;
    holds;
    lh;
    rh;
    constructor(id, name, diff, rank, mapper, ar) {
        this.id = id;
        this.name = name;
        this.diff = diff;
        this.rank = rank;
        this.mapper = mapper;
        this.at = ar;
        this.trail = [];
        this.notes = [];
        this.holds = [];
        this.lh = [];
        this.rh = [];
    }
}
;
async function load_song(name) {
    const data = await fetch(`beatmaps/${encodeURIComponent(name)}/index.json`).then(res => res.json());
    const song = new Song(data.title, data.artist, data.music, data.bpm, data.offset, data.start, data.end, data.x, data.y, data.o);
    for (const diff of data.diffs) {
        const bdata = await fetch(`beatmaps/${encodeURIComponent(name)}/${encodeURIComponent(diff.id)}.json`).then(res => res.json());
        const beatmap = new Beatmap(diff.id, diff.name, diff.diff, diff.rank, diff.mapper, bdata.ar / (60000 / song.bpm));
        let x = song.x, y = song.y, o = song.o, t = -1e4, c = Math.cos(deg2rad(song.o)), s = Math.sin(deg2rad(song.o));
        let v = 0, w = 0, tl = -Infinity, tr = -Infinity;
        for (const n of bdata.trail) {
            const t1 = n.t;
            const dt = t1 - t;
            const vn = typeof n.v === "number" ? n.v : v;
            const v1 = n.a ? vn : v;
            const c1 = Math.cos(deg2rad(o + w * dt));
            const s1 = Math.sin(deg2rad(o + w * dt));
            const tr = new TrailNode(x, y, v, v1, o, w, t, dt);
            if (dt > 1e-8) {
                beatmap.trail.push(tr);
                ({ x, y, o } = tr.at(t = t1));
                c = c1;
                s = s1;
            }
            v = vn;
            if (typeof n.w === "number")
                w = n.w;
        }
        beatmap.trail.push(new TrailNode(x, y, 0, 0, o, 0, t, 1e4));
        for (const n of bdata.notes) {
            const { x, y, o } = stamp(beatmap.trail, n.t);
            let p0 = new Vec3(1, 0, 0).rotY(-n.y).rotZ(o + n.x).add(new Vec3(x, y));
            t = n.t;
            beatmap.notes.push(new Note(t, o + n.x, n.y, n.rh, n.swing, x, y));
            if (t > (n.rh ? tr : tl)) {
                (n.rh ? beatmap.rh : beatmap.lh).push(new HandNode(t, p0, (typeof n.swing === "number"
                    ? new Vec3(0, 0, -3.2 / beatmap.at).rotX(n.swing)
                    : new Vec3(3.2 / beatmap.at, 0, 0)).rotY(-n.y).rotZ(o + n.x)));
            }
            if (n.hold) {
                const hold = [new Direction(n.t, o + n.x, n.y, x, y)];
                for (const h of n.hold) {
                    const { x, y, o } = stamp(beatmap.trail, h.t);
                    let p1 = new Vec3(1, 0, 0).rotY(-h.y).rotZ(o + h.x).add(new Vec3(x, y));
                    let v = p1.sub(p0).div(h.t - t);
                    hold.push(new Direction(h.t, o + h.x, h.y, x, y));
                    (n.rh ? beatmap.rh : beatmap.lh).push(new HandNode(t, p0, v), new HandNode(h.t, p1, v));
                    p0 = p1;
                    t = h.t;
                }
                beatmap.holds.push(new Hold(n.rh, hold));
                if (n.rh)
                    tr = t;
                else
                    tl = t;
            }
        }
        song.diffs.push(beatmap);
    }
    return song;
}
