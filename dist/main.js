"use strict";
const ti = document.getElementById("t");
const pi = document.getElementById("p");
const diff = document.getElementById("diff");
const songselect = document.getElementById("songselect");
const player = document.getElementById("player");
let t = Number.parseFloat(ti.value);
let playing = false;
let startTime = -Infinity;
let speed = 1;
const audioContext = new AudioContext();
let audioBuffer = null;
let source = null;
function escapeHTML(s) {
    return s.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/'/g, "&apos;").replace(/"/g, "&quot;");
}
async function songlist() {
    let s = "";
    for (const song of await fetch("/beatmaps/songs.json").then(res => res.json())) {
        const data = await fetch(`/beatmaps/${encodeURIComponent(song)}/index.json`).then(res => res.json());
        s += `<a href="?s=${escapeHTML(encodeURIComponent(song))}#0"><img src="/assets/cover/${data.cover}"/><h2>${escapeHTML(data.title)}</h2><p>${escapeHTML(data.artist)}</p></a>`;
    }
    songselect.innerHTML = s;
}
async function init_song(s, d) {
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
            catch (e) { }
        }
        pi.checked = playing = true;
    }
    function stop() {
        if (source) {
            try {
                source.stop();
            }
            catch (e) { }
            try {
                source.disconnect();
            }
            catch (e) { }
            source = null;
        }
        pi.checked = playing = false;
    }
    function frame() {
        requestAnimationFrame(frame);
        render_beatmap(s.diffs[Number.parseInt(diff.value)], t);
        if (playing)
            ti.value = t = (1000 * (audioContext.currentTime - startTime) * speed - s.offset) * (s.bpm / 60000);
    }
    diff.innerHTML = s.diffs.map((b, i) => `<option value="${i}"${i == d ? " selected=\"selected\"" : ""}>${escapeHTML(b.name)} ${b.diff}</option>`).join();
    const buf = await fetch(`/assets/music/${encodeURIComponent(s.music)}`).then(res => res.arrayBuffer());
    audioBuffer = await audioContext.decodeAudioData(buf);
    ti.min = ti.value = s.start;
    ti.max = s.end;
    ti.addEventListener("input", () => {
        t = Number.parseFloat(ti.value);
        if (playing) {
            stop();
            play();
        }
    });
    ti.addEventListener("dblclick", () => playing ? stop() : play());
    pi.addEventListener("input", () => (playing = pi.checked) ? play() : stop());
    diff.addEventListener("input", () => location.hash = diff.value);
    document.getElementById("s12").addEventListener("input", () => {
        speed = 0.5;
        if (playing) {
            stop();
            play();
        }
    });
    document.getElementById("s34").addEventListener("input", () => {
        speed = 0.75;
        if (playing) {
            stop();
            play();
        }
    });
    document.getElementById("s1").addEventListener("input", () => {
        speed = 1;
        if (playing) {
            stop();
            play();
        }
    });
    document.getElementById("s54").addEventListener("input", () => {
        speed = 1.25;
        if (playing) {
            stop();
            play();
        }
    });
    document.getElementById("s32").addEventListener("input", () => {
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
        load_song(name).then(s => {
            init_song(s, Number.parseInt(location.hash.slice(1)));
            songselect.style.display = "none";
            player.style.display = "block";
        }).catch(songlist);
    else
        songlist();
}
init();
