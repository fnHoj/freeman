"use strict";
const tttt = document.getElementById("t");
const pppp = document.getElementById("p");
let t = Number.parseFloat(tttt.value);
let playing = false;
let startTime = -Infinity;
const audioContext = new AudioContext();
let audioBuffer = null;
let source = null;
load_song("UmiyuriKaiteitan").then(async (s) => {
    function play(t) {
        const offset = s.offset / 1000 + t * 60 / s.bpm;
        source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        startTime = audioContext.currentTime - offset;
        if (offset > 0)
            source.start(0, offset);
        else
            source.start(startTime, 0);
    }
    const buf = await fetch(`/assets/music/${encodeURIComponent(s.music)}`).then(res => res.arrayBuffer());
    audioBuffer = await audioContext.decodeAudioData(buf);
    tttt.addEventListener("input", () => {
        t = Number.parseFloat(tttt.value);
        pppp.checked = playing = false;
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
    });
    pppp.addEventListener("input", () => {
        if (playing = pppp.checked)
            play(t);
        else if (source) {
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
    });
    function frame() {
        requestAnimationFrame(frame);
        render_beatmap(s.diffs[0], t);
        if (playing)
            tttt.value = t = (1000 * (audioContext.currentTime - startTime) - s.offset) * (s.bpm / 60000);
    }
    frame();
});
