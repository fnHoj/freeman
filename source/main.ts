const ti = document.getElementById("t") as HTMLInputElement;
const pi = document.getElementById("p") as HTMLInputElement;
const diff = document.getElementById("diff") as HTMLSelectElement;
const songselect = document.getElementById("songselect") as HTMLDivElement;
const player = document.getElementById("player") as HTMLDivElement;
const title = document.getElementById("title") as HTMLParagraphElement;
let d = Number.parseInt(location.hash.slice(1));
let t = Number.parseFloat(ti.value);
let playing = false;
let startTime = -Infinity;
let speed = 1;

const audioContext = new AudioContext();
let audioBuffer: AudioBuffer | null = null;
let source: AudioBufferSourceNode | null = null;

function difficulty(d: number): string {
    return `${Math.round(d * 2) >> 1}${Math.round(d * 2) & 1 ? "+" : ""}`;
}

function escapeHTML(s: any): string {
    return new String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/'/g, "&apos;").replace(/"/g, "&quot;");
}

async function songlist() {
    let s = "<h1>FREEMAN</h1>";
    for (const song of await fetch("beatmaps/songs.json").then(res => res.json()) as string[]) {
        const data = await fetch(`beatmaps/${encodeURIComponent(song)}/index.json`).then(res => res.json());
        s += `<a href="?s=${
            escapeHTML(encodeURIComponent(song))
        }"><img src="assets/cover/${data.cover}"/><h2>${
            escapeHTML(data.title)
        }</h2><p>${
            escapeHTML(data.artist)
        }</p><p class="diffrow">${
            (data.diffs as {diff: number, rank: number}[]).map(d =>
                `<span class="diff rank-${d.rank}">${difficulty(d.diff)}</span>`).join(" ")
        }</p></a>`;
    }
    console.log(songselect.innerHTML = s);
}

async function init_song(s: Song, d: number) {
    function play() {
        const offset = s.offset / 1000 + t * 60 / s.bpm;
        source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.playbackRate.value = speed;
        startTime = audioContext.currentTime - offset / speed;
        try {
            source.start(0, offset);
        }
        catch (e) {
            try {
                source.start(startTime, 0);
            }
            catch (e) {}
        }
        pi.checked = playing = true;
    }
    function stop() {
        if (source) {
            try {source.stop();} catch (e) {}
            try {source.disconnect();} catch (e) {}
            source = null;
        }
        pi.checked = playing = false;
    }
    function frame() {
        requestAnimationFrame(frame);
        render_beatmap(s.diffs[d], t);
        if (playing)
            ti.value = t = (1000 * (audioContext.currentTime - startTime) * speed - s.offset) * (s.bpm / 60000) as any;
    }

    diff.classList.add(`rank-${s.diffs[d].rank}`);
    diff.innerHTML = s.diffs.map((b, i) => `<option value="${i}"${i == d ? " selected=\"selected\"" : ""} class="rank-${b.rank}">${escapeHTML(b.name)} ${difficulty(b.diff)}</option><optgroup label="谱师：${escapeHTML(b.mapper)}"></optgroup>`).join();
    title.innerHTML = `${escapeHTML(s.artist)} · <b>${escapeHTML(s.title)}</b>`;
    const buf = await fetch(`assets/music/${encodeURIComponent(s.music)}`).then(res => res.arrayBuffer());
    audioBuffer = await audioContext.decodeAudioData(buf);
    ti.min = s.start as any;
    ti.max = s.end as any;
    ti.value = (t = s.start) as any;
    ti.addEventListener("input", () => {
        t = Number.parseFloat(ti.value);
        if (playing) {
            stop();
            play();
        }
    });
    ti.addEventListener("dblclick", () => playing ? stop() : play());
    pi.addEventListener("input", () => (playing = pi.checked) ? play() : stop());
    diff.addEventListener("input", () => {
        diff.classList.remove(`rank-${s.diffs[d].rank}`);
        d = Number.parseInt(location.hash = diff.value);
        diff.classList.add(`rank-${s.diffs[d].rank}`);
    });
    document.getElementById("s12")!.addEventListener("input", () => {
        speed = 0.5;
        if (playing) {
            stop();
            play();
        }
    });
    document.getElementById("s34")!.addEventListener("input", () => {
        speed = 0.75;
        if (playing) {
            stop();
            play();
        }
    });
    document.getElementById("s1")!.addEventListener("input", () => {
        speed = 1;
        if (playing) {
            stop();
            play();
        }
    });
    document.getElementById("s54")!.addEventListener("input", () => {
        speed = 1.25;
        if (playing) {
            stop();
            play();
        }
    });
    document.getElementById("s32")!.addEventListener("input", () => {
        speed = 1.5;
        if (playing) {
            stop();
            play();
        }
    });
    frame();
}

function init() {
    const name = new URLSearchParams(location.search).get("s");
    if (name)
        load_song(name).then(async s => {
            if (!s.diffs[d])
                d = s.diffs.length - 1;
            await init_song(s, d);
            songselect.style.display = "none";
            player.style.display = "block";
        }).catch(songlist);
    else
        songlist();
}

init();
