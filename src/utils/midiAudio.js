// src/utils/midiAudio.ts
// Tiny Web Audio synth driven by MIDI note numbers, with a shared settings
// store (for UI controls) and a small effects chain: filter -> echo + space.
export const DEFAULT_SYNTH_SETTINGS = {
    wave: "triangle",
    octave: 0,
    attack: 0.005,
    release: 0.6,
    cutoff: 6000,
    resonance: 1,
    shimmer: 0.4,
    echo: 0.2,
    echoTime: 0.28,
    space: 0.25,
    volume: 0.6,
};
const NOTE_NAMES = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
];
const MAX_VOICES = 12;
// ---------- MIDI helpers ----------
export const midiToFreq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
/** "C4" -> 60, "F#5" -> 78, "Bb3" -> 58 */
export function noteNameToMidi(name) {
    const match = /^([A-Ga-g])([#b]?)(-?\d+)$/.exec(name.trim());
    if (!match)
        throw new Error(`Invalid note name: "${name}"`);
    const [, letter, accidental, octave] = match;
    let pitchClass = NOTE_NAMES.indexOf(letter.toUpperCase());
    if (accidental === "#")
        pitchClass += 1;
    if (accidental === "b")
        pitchClass -= 1;
    return (parseInt(octave, 10) + 1) * 12 + pitchClass;
}
/** 60 -> "C4" */
export const midiToNoteName = (midi) => `${NOTE_NAMES[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;
/** Map an index onto a scale so any number of items stays in key. */
export const PENTATONIC_MAJOR = [0, 2, 4, 7, 9];
export function scaleNote(index, root = 72, intervals = PENTATONIC_MAJOR) {
    const octave = Math.floor(index / intervals.length);
    return root + octave * 12 + intervals[index % intervals.length];
}
// ---------- Settings store (works with React's useSyncExternalStore) ----------
let settings = { ...DEFAULT_SYNTH_SETTINGS };
const settingsListeners = new Set();
export const getSynthSettings = () => settings;
export function setSynthSettings(patch) {
    settings = { ...settings, ...patch };
    applySettings();
    settingsListeners.forEach((l) => l());
}
export function resetSynthSettings() {
    setSynthSettings(DEFAULT_SYNTH_SETTINGS);
}
export function subscribeSynthSettings(listener) {
    settingsListeners.add(listener);
    return () => {
        settingsListeners.delete(listener);
    };
}
export function setMasterVolume(volume) {
    setSynthSettings({ volume: Math.max(0, Math.min(1, volume)) });
}
let ctx = null;
let fx = null;
const voices = [];
const audioListeners = new Set();
const notifyAudio = () => audioListeners.forEach((l) => l());
export const isAudioReady = () => ctx?.state === "running";
/** Subscribe to audio on/off changes (for a status light). */
export function subscribeAudioState(listener) {
    audioListeners.add(listener);
    return () => {
        audioListeners.delete(listener);
    };
}
/** Decaying noise, used as a cheap reverb impulse response. */
function makeImpulse(c, seconds = 2.2, decay = 3) {
    const length = Math.floor(c.sampleRate * seconds);
    const buffer = c.createBuffer(2, length, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
        const data = buffer.getChannelData(ch);
        for (let i = 0; i < length; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
        }
    }
    return buffer;
}
//  voices -> input -> filter -> master -> compressor -> out
//                       |-> delaySend -> delay -> tone -> feedback -> (delay)
//                       |                           '-> master
//                       '-> reverbSend -> convolver -> master
function buildFx(c) {
    const input = c.createGain();
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    const master = c.createGain();
    const compressor = c.createDynamicsCompressor();
    input.connect(filter);
    filter.connect(master);
    const delaySend = c.createGain();
    const delay = c.createDelay(2);
    const delayTone = c.createBiquadFilter();
    delayTone.type = "lowpass";
    delayTone.frequency.value = 3000;
    const delayFeedback = c.createGain();
    filter
        .connect(delaySend)
        .connect(delay)
        .connect(delayTone)
        .connect(delayFeedback)
        .connect(delay);
    delayTone.connect(master);
    const reverbSend = c.createGain();
    const reverb = c.createConvolver();
    reverb.buffer = makeImpulse(c);
    filter.connect(reverbSend).connect(reverb).connect(master);
    master.connect(compressor).connect(c.destination);
    return { input, filter, delaySend, delay, delayFeedback, reverbSend, master };
}
function applySettings() {
    if (!ctx || !fx)
        return;
    const t = ctx.currentTime;
    const s = settings;
    const k = 0.03; // smoothing time constant, avoids clicks while turning knobs
    fx.filter.frequency.setTargetAtTime(s.cutoff, t, k);
    fx.filter.Q.setTargetAtTime(s.resonance, t, k);
    fx.delaySend.gain.setTargetAtTime(s.echo * 0.7, t, k);
    fx.delayFeedback.gain.setTargetAtTime(0.25 + s.echo * 0.4, t, k);
    fx.delay.delayTime.setTargetAtTime(s.echoTime, t, 0.08);
    fx.reverbSend.gain.setTargetAtTime(s.space * 0.8, t, k);
    fx.master.gain.setTargetAtTime(s.volume * 0.8, t, k);
}
function getContext() {
    if (typeof window === "undefined")
        return null; // SSR / prerender safety
    if (!ctx) {
        const Ctor = window.AudioContext ??
            window
                .webkitAudioContext;
        if (!Ctor)
            return null;
        ctx = new Ctor();
        fx = buildFx(ctx);
        // Set initial values directly so the first note isn't mid-ramp
        fx.filter.frequency.value = settings.cutoff;
        fx.filter.Q.value = settings.resonance;
        fx.delaySend.gain.value = settings.echo * 0.7;
        fx.delayFeedback.gain.value = 0.25 + settings.echo * 0.4;
        fx.delay.delayTime.value = settings.echoTime;
        fx.reverbSend.gain.value = settings.space * 0.8;
        fx.master.gain.value = settings.volume * 0.8;
        ctx.addEventListener("statechange", notifyAudio);
        notifyAudio();
    }
    return ctx;
}
/** Resume audio from inside a click/key handler. Resolves true if sound is on. */
export async function resumeAudio() {
    const c = getContext();
    if (!c)
        return false;
    try {
        await c.resume();
    }
    catch {
        /* ignore */
    }
    return c.state === "running";
}
/**
 * Browsers only allow audio after a real user gesture (click, key, tap).
 * Hover does NOT count, so this listens for the first gesture anywhere on
 * the page and resumes the AudioContext. Returns a cleanup function.
 */
export function initAudioUnlock() {
    if (typeof window === "undefined")
        return () => { };
    const events = ["pointerdown", "keydown", "touchstart"];
    const cleanup = () => events.forEach((e) => window.removeEventListener(e, unlock, true));
    function unlock() {
        void resumeAudio().then((ok) => {
            if (ok)
                cleanup();
        });
    }
    if (isAudioReady())
        return () => { };
    events.forEach((e) => window.addEventListener(e, unlock, true));
    return cleanup;
}
function fadeOutFast(voice, now) {
    const g = voice.gain.gain;
    if (typeof g.cancelAndHoldAtTime === "function") {
        g.cancelAndHoldAtTime(now);
    }
    else {
        g.cancelScheduledValues(now);
        g.setValueAtTime(g.value, now);
    }
    g.setTargetAtTime(0, now, 0.01);
    voice.oscs.forEach((o) => o.stop(now + 0.06));
}
/** Play a single MIDI note. Silently does nothing until audio is unlocked. */
export function playNote(midi, opts = {}) {
    const c = getContext();
    if (!c || !fx)
        return;
    if (c.state !== "running") {
        void c.resume().catch(() => { });
        return;
    }
    const s = settings;
    const { velocity = 100, duration = 0.25, pan = 0, wave = s.wave, attack = s.attack, decay = 0.12, sustain = 0.35, release = s.release, shimmer = s.shimmer, } = opts;
    const now = c.currentTime;
    const peak = (Math.max(0, Math.min(127, velocity)) / 127) * 0.6;
    const freq = midiToFreq(midi + s.octave * 12);
    // Voice stealing: fade out the oldest note if too many are ringing.
    if (voices.length >= MAX_VOICES) {
        const oldest = voices.shift();
        if (oldest)
            fadeOutFast(oldest, now);
    }
    // Envelope
    const gain = c.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(peak, now + attack);
    gain.gain.setTargetAtTime(peak * sustain, now + attack, decay / 3);
    const releaseStart = now + attack + duration;
    gain.gain.setTargetAtTime(0, releaseStart, release / 5);
    const end = releaseStart + release;
    // Body tone + a quiet, slightly detuned octave layer for shimmer
    const body = c.createOscillator();
    body.type = wave;
    body.frequency.value = freq;
    const shimmerOsc = c.createOscillator();
    shimmerOsc.type = "sine";
    shimmerOsc.frequency.value = freq * 2;
    shimmerOsc.detune.value = 4;
    const shimmerGain = c.createGain();
    shimmerGain.gain.value = shimmer * 0.6;
    body.connect(gain);
    shimmerOsc.connect(shimmerGain).connect(gain);
    // Stereo pan (StereoPannerNode is missing in very old Safari)
    let panner = null;
    if (typeof c.createStereoPanner === "function") {
        panner = c.createStereoPanner();
        panner.pan.value = Math.max(-1, Math.min(1, pan));
        gain.connect(panner).connect(fx.input);
    }
    else {
        gain.connect(fx.input);
    }
    const voice = { gain, oscs: [body, shimmerOsc] };
    voices.push(voice);
    body.start(now);
    shimmerOsc.start(now);
    body.stop(end);
    shimmerOsc.stop(end);
    body.onended = () => {
        [body, shimmerOsc, shimmerGain, gain, panner].forEach((n) => n?.disconnect());
        const i = voices.indexOf(voice);
        if (i !== -1)
            voices.splice(i, 1);
    };
}
/**
 * Per-key cooldown so jittery hover (shapes teetering under a still cursor)
 * doesn't machine-gun the same note. Returns true if the key may fire.
 */
export function createRetriggerGuard(cooldownMs = 150) {
    const last = new Map();
    return (key) => {
        const t = performance.now();
        if (t - (last.get(key) ?? -Infinity) < cooldownMs)
            return false;
        last.set(key, t);
        return true;
    };
}
