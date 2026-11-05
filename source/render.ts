const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const map = document.getElementById("map") as HTMLCanvasElement;
const mctx = map.getContext("2d")!;

let fl = 320;

function circ(v: Vec3, r: number, f: number = fl) {
    if (v.z <= 0)
        return;
    const p = v.proj();
    ctx.beginPath();
    ctx.arc(640 + f * p.x, 360 + f * p.y, r, -Math.PI, Math.PI);
}

function segment(v0: Vec3, v1: Vec3, f: number = fl) {
    if (v0.z <= 0) {
        if (v1.z > 0)
            segment(v1, v0);
        return;
    }
    const p0 = v0.proj();
    const p1 = v1.z > 0 ? v1.proj() :
        p0.add(new Vec2(v1.x * v0.z - v0.x * v1.z, v1.y * v0.z - v0.y * v1.z).mul(100));
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(640 + f * p0.x, 360 + f * p0.y);
    ctx.lineTo(640 + f * p1.x, 360 + f * p1.y);
    ctx.stroke();
}

const PUNCH: Vec3[] = [
    new Vec3(0, 0.1, 0),
    new Vec3(0, 0.07, 0.07),
    new Vec3(0, 0, 0.1),
    new Vec3(0, -0.07, 0.07),
    new Vec3(0, -0.1, 0),
    new Vec3(0, -0.07, -0.07),
    new Vec3(0, 0, -0.1),
    new Vec3(0, 0.07, -0.07),
];

const SWING: Vec3[] = [
    new Vec3(0, 0, 0.08),
    new Vec3(0, 0.1, 0.14),
    new Vec3(0, 0.1, -0.06),
    new Vec3(0, 0, -0.12),
    new Vec3(0, -0.1, -0.06),
    new Vec3(0, -0.1, 0.14),
]

function render_note(n: Note, t: number, ar: number, x: number, y: number, o: number) {
    const d = (n.t - t) / ar;
    if (d > 1 || d < -0.2)
        return;
    if (typeof n.swing === "number") {
        if (d <= 0) {
            const v = SWING.map(v => v.add(new Vec3(1, 0, d * 2)).rotX(n.swing!).rotY(-n.sy).rotZ(n.sx).add(new Vec3(n.x - x, n.y - y, 0)).rotZ(-o).pm());
            const w = (Math.exp(d * 8) - Math.exp(-1.6)) / (1 - Math.exp(-1.6));
            ctx.lineWidth = 4 + 16 * w;
            ctx.strokeStyle = `alpha(from #fff / ${w})`;
            for (let i = 0; i < v.length; i++) {
                segment(v[i ? i - 1 : v.length - 1], v[i]);
            }
            return;
        }
        let v = SWING.map(v => v.rotX(n.swing!).add(new Vec3(1, 0, 0)).rotY(-n.sy).rotZ(n.sx).add(new Vec3(n.x - x, n.y - y, 0)).rotZ(-o).pm());
        ctx.lineWidth = 8;
        ctx.strokeStyle = `alpha(from #f79 / ${1 - d})`;
        for (let i = 0; i < v.length; i++) {
            segment(v[i ? i - 1 : v.length - 1], v[i]);
        }
        v = SWING.map(v => v.rotX(n.swing!).mul(1.1 + d * 4).add(new Vec3(1, 0, 0)).rotY(-n.sy).rotZ(n.sx).add(new Vec3(n.x - x, n.y - y, 0)).rotZ(-o).pm());
        ctx.lineWidth = 4;
        for (let i = 0; i < v.length; i++) {
            segment(v[i ? i - 1 : v.length - 1], v[i]);
        }
    }
    else {
        if (d <= 0) {
            const v = PUNCH.map(v => v.add(new Vec3(1 - d * 2, 0, 0)).rotY(-n.sy).rotZ(n.sx).add(new Vec3(n.x - x, n.y - y, 0)).rotZ(-o).pm());
            const w = (Math.exp(d * 8) - Math.exp(-2.4)) / (1 - Math.exp(-2.4));
            ctx.lineWidth = 4 + 16 * w;
            ctx.strokeStyle = `alpha(from #fff / ${w})`;
            for (let i = 0; i < v.length; i++) {
                segment(v[i ? i - 1 : v.length - 1], v[i]);
            }
            return;
        }
        let v = PUNCH.map(v => v.add(new Vec3(1, 0, 0)).rotY(-n.sy).rotZ(n.sx).add(new Vec3(n.x - x, n.y - y, 0)).rotZ(-o).pm());
        ctx.lineWidth = 8;
        ctx.strokeStyle = `alpha(from #7bf / ${1 - d})`;
        for (let i = 0; i < v.length; i++) {
            segment(v[i ? i - 1 : v.length - 1], v[i]);
        }
        v = PUNCH.map(v => v.mul(1.1 + d * 4).add(new Vec3(1, 0, 0)).rotY(-n.sy).rotZ(n.sx).add(new Vec3(n.x - x, n.y - y, 0)).rotZ(-o).pm());
        ctx.lineWidth = 4;
        for (let i = 0; i < v.length; i++) {
            segment(v[i ? i - 1 : v.length - 1], v[i]);
        }
    }
}

function render_beatmap(b: Beatmap, t: number) {
    const {x, y, o} = stamp(b.trail, t);
    let cx = x, cy = y;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 1280, 720);
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 4;
    mctx.lineCap = "round";
    mctx.fillStyle = "#000";
    mctx.fillRect(0, 0, 350, 350);
    mctx.strokeStyle = "#333";
    mctx.lineWidth = 2;
    mctx.beginPath();
    for (let i = 0; i <= 7; i++) {
        segment(new Vec3(-y, 1, i - x).rotY(-o), new Vec3(7 - y, 1, i - x).rotY(-o));
        mctx.moveTo(i * 50, 0);
        mctx.lineTo(i * 50, 350);
    }
    for (let i = 0; i <= 7; i++) {
        segment(new Vec3(i - y, 1, -x).rotY(-o), new Vec3(i - y, 1, 7 - x).rotY(-o));
        mctx.moveTo(0, i * 50);
        mctx.lineTo(350, i * 50);
    }
    mctx.stroke();
    ctx.lineWidth = 32;
    mctx.beginPath();
    for (let tt = -64; tt <= 64; tt++) {
        const {x, y} = stamp(b.trail, t + tt);
        if (tt === -64)
            mctx.moveTo(50 * x, 50 * y);
        else
            mctx.lineTo(50 * x, 50 * y);
    }
    mctx.stroke();
    mctx.strokeStyle = "#fff";
    mctx.lineWidth = 4;
    mctx.beginPath();
    mctx.moveTo(50 * x, 50 * y);
    for (let i = 0.125; i < 1; i += 0.125) {
        const p = stamp(b.trail, t + b.at * i * 3);
        mctx.lineTo(50 * p.x, 50 * p.y);
        mctx.stroke();
        ctx.strokeStyle = `alpha(from #fff / ${(1 - i) / 2})`;
        mctx.strokeStyle = `alpha(from #fff / ${1 - i})`;
        mctx.beginPath();
        mctx.moveTo(50 * p.x, 50 * p.y);
        segment(new Vec3(cy - y, 1, cx - x).rotY(-o), new Vec3(p.y - y, 1, p.x - x).rotY(-o));
        cx = p.x;
        cy = p.y;
    }
    mctx.stroke();
    mctx.lineWidth = 2;
    mctx.strokeStyle = "#0ff";
    mctx.moveTo(50 * x, 50 * y);
    mctx.lineTo(50 * (x + Math.cos(deg2rad(o))), 50 * (y + Math.sin(deg2rad(o))));
    mctx.stroke();
    ctx.lineWidth = 16;
    for (const h of b.holds) {
        if (!h || t >= h[h.length - 1].t)
            continue;
        let p: Vec3 | null = t < h[0].t ? hold_at(h, h[0].t, b.trail).sub(new Vec3(x, y)).pm().rotY(-o) : null;
        for (let i = 0; ; i++) {
            let ht = t + i / 2;
            if (ht >= t + b.at * 2)
                break;
            if (ht < h[0].t)
                continue;
            if (ht >= h[h.length - 1].t)
                ht = h[h.length - 1].t
            const p1 = hold_at(h, ht, b.trail).sub(new Vec3(x, y)).pm().rotY(-o);
            if (p) {
                ctx.strokeStyle = `alpha(from #fff / ${(t >= h[0].t ? 1 : 0.6) * (1 - (ht - t) / (b.at))})`;
                segment(p, p1);
            }
            p = p1;
        }
        if (t >= h[0].t) {
            const r = (h[h.length - 1].t - t) / b.at;
            ctx.strokeStyle = `alpha(from #fff / ${r < 0.2 ? r / 0.2 : 1})`;
            ctx.lineWidth = 18 - 6 * (t - Math.floor(t));
            circ(hold_at(h, t, b.trail).sub(new Vec3(x, y)).pm().rotY(-o), 24 - 8 * (t - Math.floor(t)));
            ctx.stroke();
        }
    }
    for (let i = b.notes.length - 1; i >= 0; i--) {
        render_note(b.notes[i], t, b.at, x, y, o);
    }
}
