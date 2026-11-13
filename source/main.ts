const ti = document.getElementById("t") as HTMLInputElement;
const pi = document.getElementById("p") as HTMLInputElement;
const diff = document.getElementById("diff") as HTMLSelectElement;
let t = Number.parseFloat(ti.value);
let playing = false;
let startTime = -Infinity;
let speed = 1;

const audioContext = new AudioContext();
let audioBuffer: AudioBuffer | null = null;
let source: AudioBufferSourceNode | null = null;

load_song("UmiyuriKaiteitan").then(async s => {
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

    diff.innerHTML = s.diffs.map((b, i) => `<option value="${i}">${b.name.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</option>`).join();
    const buf = await fetch(`/assets/music/${encodeURIComponent(s.music)}`).then(res => res.arrayBuffer());
    audioBuffer = await audioContext.decodeAudioData(buf);
    ti.addEventListener("input", () => {
        t = Number.parseFloat(ti.value);
        if (playing) {
            stop();
            play();
        }
    });
    ti.addEventListener("dblclick", () => playing ? stop() : play());
    pi.addEventListener("input", () => (playing = pi.checked) ? play() : stop());
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
    function frame() {
        requestAnimationFrame(frame);
        render_beatmap(s.diffs[Number.parseInt(diff.value)], t);
        if (playing)
            ti.value = t = (1000 * (audioContext.currentTime - startTime) * speed - s.offset) * (s.bpm / 60000) as any;
    }
    frame();
});
