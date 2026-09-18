"use client";
import { useEffect, useRef } from "react";
import type { FC } from "react";
import * as d3 from "d3";
import {
  createRetriggerGuard,
  initAudioUnlock,
  noteNameToMidi,
  playNote,
} from "../../utils/midiAudio";

const GRAVITY = 0.1;
const FRICTION = 0.95;
const BOUNCE = -0.3;
const ANGULAR_FRICTION = 0.9;

type ShapeType = "pill" | "custom";

type ShapeTemplate = {
  id: string;
  type: ShapeType;
  text: string;
  image?: string;
  /** MIDI note number played on hover */
  note: number;
  x: number;
  vx: number;
  vy: number;
  angularVelocity: number;
  targetX: number;
  targetY: number;
};

type ShapeNode = {
  id: string;
  type: ShapeType;
  text: string;
  image?: string;
  note: number;
  radius: number;
  width: number;
  height: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  angularVelocity: number;
  targetX: number;
  targetY: number;
  settled?: boolean;
  teeterPhase?: number;
};

const shapes: ShapeTemplate[] = [
  {
    type: "pill",
    text: "React",
    id: "react",
    note: noteNameToMidi("C5"),
    x: 880,
    vx: 0.01,
    vy: 0.076,
    angularVelocity: 4.85,
    targetX: 230,
    targetY: 380,
  },
  {
    type: "pill",
    text: "TypeScript",
    id: "typescript",
    note: noteNameToMidi("E5"),
    x: 950,
    vx: 0.001,
    vy: 0.035,
    angularVelocity: 5.05,
    targetX: 300,
    targetY: 540,
  },
  {
    type: "pill",
    text: "Software Engineer",
    id: "software-engineer",
    note: noteNameToMidi("G5"),
    x: 1000,
    vx: 0.001,
    vy: 0.035,
    angularVelocity: 4.05,
    targetX: 300,
    targetY: 700,
  },
  {
    type: "pill",
    text: "Full Stack",
    id: "full-stack",
    note: noteNameToMidi("A5"),
    x: 700,
    vx: 0.001,
    vy: 0.035,
    angularVelocity: 4.05,
    targetX: 300,
    targetY: 850,
  },
];

const AnimatedSVGsContainer: FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const getScale = () => {
      const width = window.innerWidth;
      if (width < 400) return 1.2;
      if (width < 600) return 1.5;
      if (width < 900) return 2;
      return 3;
    };

    const SCALE = getScale();

    const width = window.innerWidth;
    const height = window.innerHeight;
    const expandedWidth = width * 1.1;
    const expandedHeight = height * 1.1;

    const svg = d3.select(svgRef.current);
    svg.attr("width", expandedWidth).attr("height", expandedHeight);

    const pillPadding = 30 * SCALE;
    const pillHeight = 60 * SCALE;
    const circleRadiusMin = 40 * SCALE;
    const circleRadiusMax = 60 * SCALE;
    const pillCornerRadius = pillHeight / 2;
    const fontSize = 32 * SCALE;

    const nodes: ShapeNode[] = shapes.map((shape) => {
      if (shape.type === "pill") {
        const textLength = shape.text.length;
        const w = textLength * 15 * SCALE + pillPadding * 2;
        const h = pillHeight;

        const startY = -h - Math.random() * 100;

        return {
          ...shape,
          width: w,
          height: h,
          radius: Math.max(w, h) / 2,
          y: startY,
          vx: (Math.random() - 0.5) * 1.2,
          vy: Math.random() * 1 + 0.5,
          angle: 0,
          angularVelocity: (Math.random() - 0.5) * 0.05,
          settled: false,
          teeterPhase: Math.random() * Math.PI * 2,
        };
      } else {
        const radius =
          circleRadiusMin + Math.random() * (circleRadiusMax - circleRadiusMin);
        const w = radius * 2;
        const h = radius * 2;

        const startY = -radius * 2 - Math.random() * 100;

        return {
          ...shape,
          width: w,
          height: h,
          radius,
          y: startY,
          vx: (Math.random() - 0.5) * 1.2,
          vy: Math.random() * 1 + 0.5,
          angle: 0,
          angularVelocity: (Math.random() - 0.5) * 0.05,
          settled: false,
          teeterPhase: Math.random() * Math.PI * 2,
        };
      }
    });

    const groups = svg
      .selectAll<SVGGElement, ShapeNode>("g.shape")
      .data(nodes, (d) => d.id)
      .join(
        (enter) => {
          const g = enter.append("g").attr("class", "shape");

          g.filter((d) => d.type === "pill")
            .append("rect")
            .attr("fill", "#5b8042")
            .attr("rx", pillCornerRadius)
            .attr("ry", pillCornerRadius);

          g.filter((d) => d.type === "pill")
            .append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("font-size", `${fontSize}px`)
            .attr("fill", "#fdffbf");

          // SVG image shape here
          g.filter((d) => d.type === "custom")
            .append("image")
            .attr("href", (d) => d.image ?? "")
            .attr("preserveAspectRatio", "xMidYMid meet");

          return g;
        },
        (update) => update,
        (exit) => exit.remove()
      );

    const disposeAudioUnlock = initAudioUnlock();
    const canTrigger = createRetriggerGuard(150);

    let pointer: { x: number; y: number } | null = null;
    const hovered = new Set<string>();

    const onPointerMove = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY };
    };
    const onPointerLeave = () => {
      pointer = null;
    };

    window.addEventListener("pointermove", onPointerMove, {
      passive: true,
      capture: true,
    });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("blur", onPointerLeave);

    function hitTest(d: ShapeNode, px: number, py: number): boolean {
      const dx = px - d.x;
      const dy = py - d.y;
      if (d.type !== "pill") {
        const r = d.width / 2;
        return dx * dx + dy * dy <= r * r;
      }
      const cos = Math.cos(d.angle);
      const sin = Math.sin(d.angle);
      const lx = dx * cos + dy * sin;
      const ly = -dx * sin + dy * cos;
      const r = d.height / 2;
      const halfLine = Math.max(0, d.width / 2 - r);
      const cx = Math.max(-halfLine, Math.min(halfLine, lx));
      return (lx - cx) ** 2 + ly ** 2 <= r * r;
    }

    function checkHover() {
      const svgEl = svgRef.current;
      if (!pointer || !svgEl) {
        hovered.clear();
        return;
      }
      const under = document.elementFromPoint(pointer.x, pointer.y);
      if (under?.closest("[data-occludes-shapes], [data-synth-panel]")) {
        hovered.clear();
        return;
      }
      const rect = svgEl.getBoundingClientRect();
      const px = pointer.x - rect.left;
      const py = pointer.y - rect.top;

      nodes.forEach((d) => {
        const inside = hitTest(d, px, py);
        if (inside && !hovered.has(d.id)) {
          hovered.add(d.id);
          if (canTrigger(d.id)) {
            const pan = Math.max(
              -1,
              Math.min(1, (d.x / expandedWidth) * 2 - 1)
            );
            playNote(d.note, { pan, velocity: 100 });
          }
        } else if (!inside) {
          hovered.delete(d.id);
        }
      });
    }

    let frameId: number;

    function tick() {
      nodes.forEach((d) => {
        if (!d.settled) {
          if (d.y < d.targetY || d.vy < 0) {
            d.vy += GRAVITY;
            d.angularVelocity *= 1.01;
          } else {
            if (d.y > d.targetY) d.y = d.targetY;
            if (Math.abs(d.vy) > 0.05) {
              d.vy *= BOUNCE;
              d.angularVelocity *= BOUNCE;
            } else {
              d.vy = 0;
              d.settled = true;
              d.angularVelocity = (Math.random() - 0.5) * 0.005;
            }
            d.vx *= 0.98;
          }
        } else {
          d.teeterPhase! += 0.02;
          d.angle += Math.sin(d.teeterPhase!) * 0.003;
          d.vx *= 0.95;
        }

        d.x += d.vx;
        d.y += d.vy;
        d.vx *= FRICTION;
        d.angularVelocity *= ANGULAR_FRICTION;
        d.angle += d.angularVelocity;

        const halfW = d.width / 2;
        if (d.x - halfW < 0) {
          d.x = halfW;
          d.vx *= BOUNCE;
          d.angularVelocity *= BOUNCE;
        }
        if (d.x + halfW > expandedWidth) {
          d.x = expandedWidth - halfW;
          d.vx *= BOUNCE;
          d.angularVelocity *= BOUNCE;
        }
      });

      render();
      checkHover();
      frameId = requestAnimationFrame(tick);
    }

    function render() {
      groups.attr(
        "transform",
        (d) => `translate(${d.x},${d.y}) rotate(${(d.angle * 180) / Math.PI})`
      );

      groups
        .select("rect")
        .attr("x", (d) => -d.width / 2)
        .attr("y", (d) => -d.height / 2)
        .attr("width", (d) => d.width)
        .attr("height", (d) => d.height);

      groups
        .select("text")
        .text((d) => d.text)
        .attr("x", 0)
        .attr("y", 0);

      groups
        .select("image")
        .attr("x", (d) => -d.width / 2)
        .attr("y", (d) => -d.height / 2)
        .attr("width", (d) => d.width)
        .attr("height", (d) => d.height);
    }

    frameId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", onPointerMove, {
        capture: true,
      });
      document.documentElement.removeEventListener(
        "pointerleave",
        onPointerLeave
      );
      window.removeEventListener("blur", onPointerLeave);
      disposeAudioUnlock();
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      style={{
        position: "fixed",
        top: "-15%",
        left: "-15%",
        zIndex: 10,
        pointerEvents: "none",
        overflow: "visible",
      }}
    />
  );
};

export default AnimatedSVGsContainer;
