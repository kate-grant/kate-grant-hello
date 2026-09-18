import AnimatedSVGsContainer from "@/sections/hero/AnimatedSVGContainer";
import SynthPanel from "@/sections/hero/SynthPanel";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FC } from "react";

const HomeBackground: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const asciiChars = useMemo(
    () => [" ", ".", ":", "-", "=", "+", "*", "#", "%", "@"],
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = "12px monospace";
      ctx.textBaseline = "top";

      const time = Date.now() * 0.002;

      for (let y = 0; y < canvas.height; y += 16) {
        for (let x = 0; x < canvas.width; x += 10) {
          const nx = x / canvas.width;
          const ny = y / canvas.height;

          const v1 = Math.sin((nx * 10 + time) * 2);
          const v2 = Math.cos((ny * 10 - time) * 3);
          const v3 = Math.sin((nx * 5 + ny * 5 + time) * 4);
          const value = (v1 + v2 + v3) / 3;

          const normalized = (value + 1) / 2;

          const charIndex = Math.floor(normalized * (asciiChars.length - 1));
          const char = asciiChars[charIndex];

          ctx.fillStyle = "#b0d1b2";
          ctx.fillText(char, x, y);
        }
      }
    };

    const interval = setInterval(draw, 100);
    return () => {
      window.removeEventListener("resize", resize);
      clearInterval(interval);
    };
  }, [asciiChars]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full bg-amber-50 transition-all duration-800 ease-in-out -z-10 pointer-events-none"
    />
  );
};

class SimplexNoise1 {
  private grad3 = [
    [1, 1, 0],
    [-1, 1, 0],
    [1, -1, 0],
    [-1, -1, 0],
    [1, 0, 1],
    [-1, 0, 1],
    [1, 0, -1],
    [-1, 0, -1],
    [0, 1, 1],
    [0, -1, 1],
    [0, 1, -1],
    [0, -1, -1],
  ];
  private perm: number[] = [];

  constructor() {
    this.perm = new Array(512);
    const p = [];
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const n = Math.floor(Math.random() * (i + 1));
      const tmp: number = p[i];
      p[i] = p[n];
      p[n] = tmp;
    }
    for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
  }

  dot(g: number[], x: number, y: number) {
    return g[0] * x + g[1] * y;
  }

  noise(xin: number, yin: number) {
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;

    let n0 = 0,
      n1 = 0,
      n2 = 0;

    let s = (xin + yin) * F2;
    let i = Math.floor(xin + s);
    let j = Math.floor(yin + s);
    let t = (i + j) * G2;
    let X0 = i - t;
    let Y0 = j - t;
    let x0 = xin - X0;
    let y0 = yin - Y0;

    let i1 = 0,
      j1 = 0;
    if (x0 > y0) {
      i1 = 1;
      j1 = 0;
    } else {
      i1 = 0;
      j1 = 1;
    }

    let x1 = x0 - i1 + G2;
    let y1 = y0 - j1 + G2;
    let x2 = x0 - 1 + 2 * G2;
    let y2 = y0 - 1 + 2 * G2;

    let ii = i & 255;
    let jj = j & 255;

    let gi0 = this.perm[ii + this.perm[jj]] % 12;
    let gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
    let gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;

    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
      t0 *= t0;
      n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);
    }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
      t1 *= t1;
      n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
    }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
      t2 *= t2;
      n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
    }

    return 70 * (n0 + n1 + n2);
  }
}

const InfoBackground1: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const noise = useMemo(() => new SimplexNoise1(), []);

  const asciiChars = useMemo(
    () => [" ", "-", "=", "+", "*", "#", "%", "@", "@"],
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.font = "14px monospace";
      ctx.textBaseline = "top";
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const time = Date.now() * -0.0007;

      for (let y = 0; y < canvas.height; y += 16) {
        for (let x = 0; x < canvas.width; x += 10) {
          const nx = x / 100;
          const ny = y / 100;

          let value = noise.noise(nx + time, ny);

          value = (value + 1) / 2;

          value = Math.pow(value, 2.5);

          const charIndex = Math.min(
            asciiChars.length - 1,
            Math.floor(value * asciiChars.length)
          );
          const char = asciiChars[charIndex];

          ctx.fillStyle = "#b0d1b2";
          ctx.fillText(char, x, y);
        }
      }
    };

    const interval = setInterval(draw, 50);

    return () => {
      window.removeEventListener("resize", resize);
      clearInterval(interval);
    };
  }, [asciiChars, noise]);

  return (
    <canvas
      ref={canvasRef}
      className={
        "fixed top-0 left-0 w-full h-full bg-amber-50 transition-all duration-800 ease-in-out -z-10 pointer-events-none"
      }
    />
  );
};

class SimplexNoise2 {
  private grad3 = [
    [1, 1, 0],
    [-1, 1, 0],
    [1, -1, 0],
    [-1, -1, 0],
    [1, 0, 1],
    [-1, 0, 1],
    [1, 0, -1],
    [-1, 0, -1],
    [0, 1, 1],
    [0, -1, 1],
    [0, 1, -1],
    [0, -1, -1],
  ];
  private perm: number[] = [];

  constructor() {
    this.perm = new Array(512);
    const p = [];
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const n = Math.floor(Math.random() * (i + 1));
      const tmp: number = p[i];
      p[i] = p[n];
      p[n] = tmp;
    }
    for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
  }

  dot(g: number[], x: number, y: number) {
    return g[0] * x + g[1] * y;
  }

  noise(xin: number, yin: number) {
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;

    let n0 = 0,
      n1 = 0,
      n2 = 0;

    let s = (xin + yin) * F2;
    let i = Math.floor(xin + s);
    let j = Math.floor(yin + s);
    let t = (i + j) * G2;
    let X0 = i - t;
    let Y0 = j - t;
    let x0 = xin - X0;
    let y0 = yin - Y0;

    let i1 = 0,
      j1 = 0;
    if (x0 > y0) {
      i1 = 1;
      j1 = 0;
    } else {
      i1 = 0;
      j1 = 1;
    }

    let x1 = x0 - i1 + G2;
    let y1 = y0 - j1 + G2;
    let x2 = x0 - 1 + 2 * G2;
    let y2 = y0 - 1 + 2 * G2;

    let ii = i & 255;
    let jj = j & 255;

    let gi0 = this.perm[ii + this.perm[jj]] % 12;
    let gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
    let gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;

    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
      t0 *= t0;
      n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);
    }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
      t1 *= t1;
      n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
    }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
      t2 *= t2;
      n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
    }

    return 70 * (n0 + n1 + n2);
  }
}

const InfoBackground2: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const noise = useMemo(() => new SimplexNoise2(), []);

  const asciiChars = useMemo(
    () => [" ", ".", ":", "-", "=", "+", "*", "#", "%", "@"],
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.font = "13px monospace";
      ctx.textBaseline = "top";
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const time = Date.now() * 0.0009;

      for (let y = 0; y < canvas.height; y += 12) {
        for (let x = 0; x < canvas.width; x += 10) {
          const nx = x / 90;
          const ny = y / 60;

          let baseNoise = noise.noise(nx, ny + time);

          let midNoise = noise.noise(nx * 2 + 100, ny * 3 + time * 1.3);

          let fineNoise = noise.noise(nx * 8 + 200, ny * 10 + time * 3);

          let combined = baseNoise * 0.6 + midNoise * 0.25 + fineNoise * 0.15;

          combined = (combined + 1) / 2;

          const densityMod =
            (noise.noise(nx * 1.5, ny * 1.5 - time * 2) + 1) / 2;

          let value = combined * densityMod;

          value = Math.pow(value, 3);

          const charIndex = Math.min(
            asciiChars.length - 1,
            Math.floor(value * asciiChars.length)
          );

          const char = asciiChars[charIndex];

          ctx.fillStyle = "#b0d1b2";
          ctx.fillText(char, x, y);
        }
      }
    };

    const interval = setInterval(draw, 40);

    return () => {
      window.removeEventListener("resize", resize);
      clearInterval(interval);
    };
  }, [asciiChars, noise]);

  return (
    <canvas
      ref={canvasRef}
      className={
        "fixed top-0 left-0 w-full h-full bg-amber-50 transition-all duration-800 ease-in-out -z-10 pointer-events-none"
      }
    />
  );
};

type AsciiBackgroundVariant = "home" | "info";

type AsciiBackgroundProps = {
  variant: AsciiBackgroundVariant;
};

const getRandomHomeBackground = () =>
  Math.round(Math.random()) === 0 ? HomeBackground : InfoBackground1;

const AsciiBackground: FC<AsciiBackgroundProps> = ({ variant }) => {
  const [CurrentComponent, setCurrentComponent] = useState<FC>(() =>
    variant === "home" ? getRandomHomeBackground() : InfoBackground2
  );
  const [PrevComponent, setPrevComponent] = useState<FC | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const newComponent =
      variant === "home" ? getRandomHomeBackground() : InfoBackground2;

    setPrevComponent(() => CurrentComponent);
    setCurrentComponent(() => newComponent);
    setTransitioning(true);

    const timeout = setTimeout(() => {
      setPrevComponent(null);
      setTransitioning(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [variant, CurrentComponent]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: -1,
      }}
    >
      {PrevComponent && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: transitioning ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        >
          <PrevComponent />
        </div>
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 1,
          transition: "opacity 0.5s ease",
        }}
      >
        <CurrentComponent />
      </div>
      <SynthPanel />
      <AnimatedSVGsContainer />
    </div>
  );
};

export default AsciiBackground;
