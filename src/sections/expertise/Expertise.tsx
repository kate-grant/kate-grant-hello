import { useEffect, useRef, useState } from "react";
import Card from "@/components/elements/Card";
import Section from "@/components/layout/Section";

type Area = {
  title: string;
  summary: string;
  tools: string[];
};

const AREAS: Area[] = [
  {
    title: "Interfaces",
    summary:
      "Front ends that feel considered at every scale, from design systems down to single moments of motion and sound.",
    tools: ["React", "TypeScript", "D3", "Web Audio"],
  },
  {
    title: "Platforms",
    summary:
      "APIs, data models and services that stay fast and easy to reason about as the product and the team grow.",
    tools: ["Node", "PostgreSQL", "GraphQL", "Observability"],
  },
  {
    title: "Data",
    summary:
      "Pipelines and visualizations that turn raw data into something people can explore, question, and act on.",
    tools: ["Python", "SQL", "ETL", "Visualization"],
  },
  {
    title: "Creative tools",
    summary:
      "Software for makers: editors and workflows that give creative people more room to play.",
    tools: ["WebGL", "Audio", "Communication", "Documentation"],
  },
];

const STEP_VH = 70;

const MOSS = "#5b8042";
const CREAM = "#fdffbf";

const Expertise = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const active = Math.min(
    AREAS.length - 1,
    Math.floor(progress * AREAS.length)
  );

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const p = scrollable > 0 ? -rect.top / scrollable : 0;
      setProgress(Math.min(1, Math.max(0, p)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const goTo = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const scrollable = el.offsetHeight - window.innerHeight;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    window.scrollTo({
      top: top + ((index + 0.5) / AREAS.length) * scrollable,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <Section id="expertise" fitScreen={false}>
      <div
        ref={trackRef}
        className="relative"
        style={{ height: `${100 + AREAS.length * STEP_VH}vh` }}
      >
        <div className="sticky top-0 flex h-screen items-center justify-center px-4 pb-6 pt-28 sm:px-8 md:pb-10">
          <Card
            size="xl"
            variant="dark"
            className="grid h-full max-h-[44rem] grid-rows-[auto_1fr_auto] gap-6 overflow-hidden md:grid-cols-12 md:grid-rows-[1fr_auto] md:gap-x-12 md:gap-y-10"
          >
            <div className="flex flex-col gap-6 md:col-span-5 md:justify-between md:gap-10">
              <div>
                <h2 className="text-balance text-[clamp(2rem,5vw,4rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
                  Hey A Vinyl Bar in Shibuya!
                </h2>
                <h2 className="mt-4 text-balance text-[clamp(1.75rem,4vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
                  I write code that helps humans be human.
                </h2>
                <p className="mt-4 max-w-[38ch] text-base leading-relaxed opacity-75 md:mt-6 md:text-lg">
                  Design-minded full stack engineer building scalable,
                  data-driven creative platforms.
                </p>
              </div>

              <nav aria-label="Areas of expertise">
                <ul className="list-none flex flex-wrap gap-x-5 gap-y-2 md:flex-col md:gap-3">
                  {AREAS.map((area, i) => {
                    const isActive = i === active;
                    return (
                      <li key={area.title}>
                        <button
                          type="button"
                          onClick={() => goTo(i)}
                          aria-current={isActive ? "true" : undefined}
                          className={`flex items-center gap-3 text-left text-sm transition-opacity duration-300 motion-reduce:transition-none md:text-lg ${
                            isActive
                              ? "opacity-100"
                              : "opacity-45 hover:opacity-80"
                          }`}
                        >
                          {area.title}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            <div className="relative min-h-[14rem] md:col-span-7">
              {AREAS.map((area, i) => {
                const state =
                  i === active
                    ? "translate-y-0 opacity-100"
                    : i < active
                    ? "pointer-events-none -translate-y-6 opacity-0"
                    : "pointer-events-none translate-y-6 opacity-0";
                return (
                  <article
                    key={area.title}
                    aria-hidden={i !== active}
                    className={`absolute inset-0 flex flex-col justify-start transition duration-500 ease-out motion-reduce:transition-none md:justify-end ${state}`}
                  >
                    <h3 className="text-2xl font-semibold tracking-tight md:text-4xl">
                      {area.title}
                    </h3>
                    <p className="mt-3 max-w-[48ch] text-base leading-relaxed opacity-80 md:mt-4 md:text-lg">
                      {area.summary}
                    </p>
                    <ul
                      className="mt-5 flex flex-wrap gap-2 md:mt-6 list-none"
                      aria-label={`${area.title} tools`}
                    >
                      {area.tools.map((tool) => (
                        <li
                          key={tool}
                          className="rounded-full px-4 py-1.5 text-sm"
                          style={{ backgroundColor: MOSS, color: CREAM }}
                        >
                          {tool}
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>

            <div
              aria-hidden="true"
              className="h-0.5 w-full overflow-hidden rounded-full bg-black/10 md:col-span-12"
            >
              <div
                className="h-full origin-left"
                style={{
                  backgroundColor: MOSS,
                  transform: `scaleX(${progress})`,
                }}
              />
            </div>
          </Card>
        </div>
      </div>
    </Section>
  );
};

export default Expertise;
