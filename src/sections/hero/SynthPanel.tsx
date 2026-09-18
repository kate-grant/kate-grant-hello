import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type {
  FC,
  KeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import {
  DEFAULT_SYNTH_SETTINGS,
  getSynthSettings,
  isAudioReady,
  playNote,
  resetSynthSettings,
  resumeAudio,
  setSynthSettings,
  subscribeAudioState,
  subscribeSynthSettings,
  type SynthSettings,
} from "@/utils/midiAudio";

const CREAM = "#fdffbf";
const MOSS = "#5b8042";
const MOSS_LIT = "#9ccc6a";
const TRACK = "rgba(253, 255, 191, 0.16)";

// knob

type Curve = "lin" | "log";
const ARC = 135;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

const toNorm = (v: number, min: number, max: number, curve: Curve) =>
  clamp01(
    curve === "log"
      ? Math.log(v / min) / Math.log(max / min)
      : (v - min) / (max - min)
  );

const fromNorm = (n: number, min: number, max: number, curve: Curve) =>
  curve === "log" ? min * Math.pow(max / min, n) : min + n * (max - min);

function polar(c: number, r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [c + r * Math.sin(a), c - r * Math.cos(a)];
}

function arcPath(c: number, r: number, from: number, to: number) {
  const [x1, y1] = polar(c, r, from);
  const [x2, y2] = polar(c, r, to);
  const large = to - from > 180 ? 1 : 0;
  return `M${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

type KnobProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  defaultValue: number;
  curve?: Curve;
  format: (v: number) => string;
  onChange: (v: number) => void;
};

const SIZE = 36;
const C = SIZE / 2;

const Knob: FC<KnobProps> = ({
  label,
  value,
  min,
  max,
  defaultValue,
  curve = "lin",
  format,
  onChange,
}) => {
  const norm = toNorm(value, min, max, curve);
  const angle = -ARC + norm * ARC * 2;

  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ y: number; n: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [reveal, setReveal] = useState(false);

  const normRef = useRef(norm);
  normRef.current = norm;
  const setNorm = (n: number) =>
    onChange(fromNorm(clamp01(n), min, max, curve));
  const setNormRef = useRef(setNorm);
  setNormRef.current = setNorm;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY || e.deltaX;
      const step = e.shiftKey ? 0.005 : 0.03;
      setNormRef.current(normRef.current - Math.sign(delta) * step);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, n: norm };
    setDragging(true);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const sensitivity = e.shiftKey ? 600 : 150;
    setNorm(drag.current.n + (drag.current.y - e.clientY) / sensitivity);
  };
  const endDrag = () => {
    drag.current = null;
    setDragging(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 0.01 : 0.04;
    const next: Record<string, number> = {
      ArrowUp: norm + step,
      ArrowRight: norm + step,
      ArrowDown: norm - step,
      ArrowLeft: norm - step,
      PageUp: norm + 0.2,
      PageDown: norm - 0.2,
      Home: 0,
      End: 1,
    };
    if (!(e.key in next)) return;
    e.preventDefault();
    setNorm(next[e.key]);
  };

  return (
    <div
      ref={ref}
      className="synth-knob"
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(norm * 100)}
      aria-valuetext={format(value)}
      title="Drag, scroll or use arrow keys. Double-click to reset."
      data-active={dragging || reveal}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerEnter={() => setReveal(true)}
      onPointerLeave={() => setReveal(false)}
      onFocus={() => setReveal(true)}
      onBlur={() => setReveal(false)}
      onDoubleClick={() => onChange(defaultValue)}
      onKeyDown={onKeyDown}
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-hidden="true"
      >
        <path
          d={arcPath(C, 16, -ARC, ARC)}
          stroke={TRACK}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
        />
        {norm > 0.001 && (
          <path
            d={arcPath(C, 16, -ARC, angle)}
            stroke={MOSS_LIT}
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
          />
        )}
        <circle cx={C} cy={C} r={11.5} fill={CREAM} />
        <line
          x1={C}
          y1={C - 3}
          x2={C}
          y2={C - 10}
          stroke="#000"
          strokeWidth={2.5}
          strokeLinecap="round"
          transform={`rotate(${angle} ${C} ${C})`}
        />
      </svg>
      <span className="synth-label">
        {dragging || reveal ? format(value) : label}
      </span>
    </div>
  );
};

type KnobKey = Exclude<keyof SynthSettings, "wave" | "octave">;

const pct = (v: number) => `${Math.round(v * 100)}%`;
const time = (v: number) =>
  v < 1 ? `${Math.round(v * 1000)}ms` : `${v.toFixed(2)}s`;
const hz = (v: number) =>
  v >= 1000 ? `${(v / 1000).toFixed(1)}kHz` : `${Math.round(v)}Hz`;

const KNOBS: {
  key: KnobKey;
  label: string;
  min: number;
  max: number;
  curve?: Curve;
  format: (v: number) => string;
}[] = [
  {
    key: "cutoff",
    label: "tone",
    min: 150,
    max: 12000,
    curve: "log",
    format: hz,
  },
  {
    key: "resonance",
    label: "reso",
    min: 0.5,
    max: 14,
    format: (v) => v.toFixed(1),
  },
  { key: "shimmer", label: "shimmer", min: 0, max: 1, format: pct },
  {
    key: "attack",
    label: "attack",
    min: 0.002,
    max: 1,
    curve: "log",
    format: time,
  },
  {
    key: "release",
    label: "release",
    min: 0.05,
    max: 3,
    curve: "log",
    format: time,
  },
  { key: "echo", label: "echo", min: 0, max: 1, format: pct },
  {
    key: "echoTime",
    label: "echo time",
    min: 0.05,
    max: 1,
    curve: "log",
    format: time,
  },
  { key: "space", label: "space", min: 0, max: 1, format: pct },
  { key: "volume", label: "volume", min: 0, max: 1, format: pct },
];

const WAVES: { type: OscillatorType; label: string; path: string }[] = [
  { type: "sine", label: "Sine", path: "M1 6 Q5.5 -2 10 6 T19 6" },
  {
    type: "triangle",
    label: "Triangle",
    path: "M1 9 L5.5 3 L10 9 L14.5 3 L19 9",
  },
  { type: "sawtooth", label: "Saw", path: "M1 9 L10 3 L10 9 L19 3 L19 9" },
  { type: "square", label: "Square", path: "M1 9 V3 H7 V9 H13 V3 H19" },
];

// panel

const CSS = `
.synth-root, .synth-root * { box-sizing: border-box; }
.synth-root { position: fixed; top: 20px; right: 20px; z-index: 2147483000; pointer-events: auto; isolation: isolate; color: ${CREAM};
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; }
.synth-root button { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; }
.synth-root :focus-visible { outline: 2px solid ${CREAM}; outline-offset: 2px; border-radius: 6px; }
.synth-root .synth-panel { position: relative; width: 204px; padding: 14px 14px 10px; background: #000;
  border: 1px solid rgba(253,255,191,0.14); border-radius: 16px; }
.synth-root .synth-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.synth-root .synth-status { display: flex; align-items: center; gap: 6px; font-size: 11px; color: rgba(253,255,191,0.8); }
.synth-root .synth-led { width: 7px; height: 7px; border-radius: 50%; background: rgba(253,255,191,0.22); }
.synth-root .synth-led[data-on="true"] { background: ${MOSS_LIT}; box-shadow: 0 0 6px ${MOSS_LIT}; }
.synth-root .synth-icon-btn { width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center;
  color: rgba(253,255,191,0.7); }
.synth-root .synth-icon-btn:hover { color: ${CREAM}; background: rgba(253,255,191,0.1); }
.synth-root .synth-waves { display: flex; gap: 2px; }
.synth-root .synth-wave { width: 24px; height: 20px; border-radius: 6px; display: grid; place-items: center;
  color: rgba(253,255,191,0.5); }
.synth-root .synth-wave:hover { color: ${CREAM}; }
.synth-root .synth-wave[aria-pressed="true"] { background: ${MOSS}; color: ${CREAM}; }
.synth-root .synth-octave { display: flex; align-items: center; gap: 2px; font-size: 11px; }
.synth-root .synth-octave output { width: 20px; text-align: center; font-variant-numeric: tabular-nums; }
.synth-root .synth-octave button:disabled { opacity: 0.3; cursor: default; }
.synth-root .synth-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px 0; justify-items: center; margin-top: 12px; }
.synth-root .synth-knob { display: flex; flex-direction: column; align-items: center; gap: 2px;
  cursor: ns-resize; touch-action: none; user-select: none; }
.synth-root .synth-label { font-size: 10px; width: 58px; text-align: center; white-space: nowrap;
  color: rgba(253,255,191,0.7); font-variant-numeric: tabular-nums; }
.synth-root .synth-knob[data-active="true"] .synth-label { color: ${CREAM}; }
.synth-root .synth-reset { font-size: 10px; color: rgba(253,255,191,0.55); padding: 2px 4px; border-radius: 4px; }
.synth-root .synth-reset:hover { color: ${CREAM}; }
.synth-root .synth-screw { position: absolute; width: 6px; height: 6px; border-radius: 50%;
  border: 1px solid rgba(253,255,191,0.28); }
.synth-root .synth-screw::after { content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 1px;
  margin-top: -0.5px; background: rgba(253,255,191,0.35); transform: rotate(-35deg); }
.synth-root .synth-toggle { width: 44px; height: 44px; border-radius: 50%; background: #000;
  border: 1px solid rgba(253,255,191,0.14); display: grid; place-items: center; position: relative; }
.synth-root .synth-toggle .synth-led { position: absolute; top: 8px; right: 8px; }
@media (prefers-reduced-motion: no-preference) {
  .synth-root .synth-panel { animation: synth-in 160ms ease-out; }
  @keyframes synth-in { from { opacity: 0; transform: translateY(-4px); } }
}
`;

const Screws = () => (
  <>
    <span className="synth-screw" style={{ top: 7, left: 7 }} />
    <span className="synth-screw" style={{ top: 7, right: 7 }} />
    <span className="synth-screw" style={{ bottom: 7, left: 7 }} />
    <span className="synth-screw" style={{ bottom: 7, right: 7 }} />
  </>
);

const SynthPanel: FC = () => {
  const settings = useSyncExternalStore(
    subscribeSynthSettings,
    getSynthSettings,
    getSynthSettings
  );
  const audioOn = useSyncExternalStore(
    subscribeAudioState,
    isAudioReady,
    () => false
  );
  const [open, setOpen] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 900
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const preview = async () => {
    if (await resumeAudio()) playNote(72); // C5
  };

  if (!mounted) return null;

  return createPortal(
    <div className="synth-root" data-synth-panel>
      <style>{CSS}</style>

      {!open ? (
        <button
          type="button"
          className="synth-toggle"
          aria-label="Open sound controls"
          aria-expanded={false}
          onClick={() => setOpen(true)}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
            <circle cx="11" cy="11" r="9" fill={CREAM} />
            <line
              x1="11"
              y1="10"
              x2="15.5"
              y2="5.5"
              stroke="#000"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
          <span className="synth-led" data-on={audioOn} />
        </button>
      ) : (
        <div className="synth-panel" role="group" aria-label="Sound controls">
          <Screws />

          <div className="synth-row">
            <span className="synth-status" aria-live="polite">
              <span className="synth-led" data-on={audioOn} />
              {audioOn ? "sound on" : "click to enable"}
            </span>
            <span style={{ display: "flex", gap: 2 }}>
              <button
                type="button"
                className="synth-icon-btn"
                aria-label="Play test note"
                onClick={preview}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  aria-hidden="true"
                >
                  <path d="M2 1 L9 5 L2 9 Z" fill="currentColor" />
                </svg>
              </button>
              <button
                type="button"
                className="synth-icon-btn"
                aria-label="Close sound controls"
                aria-expanded={true}
                onClick={() => setOpen(false)}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  aria-hidden="true"
                >
                  <path
                    d="M1.5 5 H8.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </span>
          </div>

          <div className="synth-row" style={{ marginTop: 12 }}>
            <div className="synth-waves" role="group" aria-label="Waveform">
              {WAVES.map((w) => (
                <button
                  key={w.type}
                  type="button"
                  className="synth-wave"
                  aria-label={w.label}
                  aria-pressed={settings.wave === w.type}
                  onClick={() => setSynthSettings({ wave: w.type })}
                >
                  <svg
                    width="20"
                    height="12"
                    viewBox="0 0 20 12"
                    aria-hidden="true"
                  >
                    <path
                      d={w.path}
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              ))}
            </div>

            <div className="synth-octave" role="group" aria-label="Octave">
              <button
                type="button"
                className="synth-icon-btn"
                aria-label="Octave down"
                disabled={settings.octave <= -2}
                onClick={() =>
                  setSynthSettings({ octave: settings.octave - 1 })
                }
              >
                −
              </button>
              <output aria-label="Octave">
                {settings.octave > 0 ? `+${settings.octave}` : settings.octave}
              </output>
              <button
                type="button"
                className="synth-icon-btn"
                aria-label="Octave up"
                disabled={settings.octave >= 2}
                onClick={() =>
                  setSynthSettings({ octave: settings.octave + 1 })
                }
              >
                +
              </button>
            </div>
          </div>

          <div className="synth-grid">
            {KNOBS.map((k) => (
              <Knob
                key={k.key}
                label={k.label}
                value={settings[k.key]}
                min={k.min}
                max={k.max}
                curve={k.curve}
                defaultValue={DEFAULT_SYNTH_SETTINGS[k.key]}
                format={k.format}
                onChange={(v) =>
                  setSynthSettings({ [k.key]: v } as Partial<SynthSettings>)
                }
              />
            ))}
          </div>

          <div
            className="synth-row"
            style={{ justifyContent: "flex-end", marginTop: 6 }}
          >
            <button
              type="button"
              className="synth-reset"
              onClick={resetSynthSettings}
            >
              reset
            </button>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

export default SynthPanel;
