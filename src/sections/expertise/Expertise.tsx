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
    tools: ["React", "TypeScript", "Design Systems", "A/B Testing"],
  },
  {
    title: "Data",
    summary:
      "Pipelines and visualizations that turn raw data into something people can explore, question and act on.",
    tools: ["D3.js", "Functional Programming", "PostgreSQL", "ETL"],
  },
  {
    title: "Platforms",
    summary:
      "The plumbing under the interface: APIs, data models and services that stay fast and easy to reason about as the product and the team grow.",
    tools: ["Node", "GraphQL", "Live Tracing", "Documentation"],
  },
  {
    title: "Sound",
    summary:
      "The industry knowledge from release pipelines to DAWs, from engineer to musician.",
    tools: ["Web Audio", "p5.js", "Track Metadata", "MIDI"],
  },
];

const STEP_VH = 70;
const PINNED_QUERY = "(min-width: 768px) and (min-height: 700px)";

const MOSS = "#5b8042";
const CREAM = "#fdffbf";

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
};

const Intro = ({ pinned }: { pinned: boolean }) => (
  <div>
    <p
      className={`text-balance font-semibold leading-[1.05] tracking-[-0.02em] ${
        pinned
          ? "text-[clamp(2rem,min(5vw,7vh),4rem)]"
          : "text-[clamp(1.75rem,8vw,3rem)]"
      }`}
    >
      Hey, A Vinyl Bar in Shibuya!
    </p>
    <h2
      className={`mt-4 text-balance font-semibold leading-[1.05] tracking-[-0.02em] ${
        pinned
          ? "text-[clamp(1.75rem,min(4vw,6vh),3.5rem)]"
          : "text-[clamp(1.5rem,6.5vw,2.5rem)]"
      }`}
    >
      I write code that helps humans be human.
    </h2>
    <p className="mt-4 max-w-[38ch] text-base leading-relaxed opacity-75 md:mt-6 md:text-lg">
      Design-minded full stack engineer with a degree in music. Most recently, I
      built tools for independent artists in music distribution.
    </p>
  </div>
);

const AreaDetail = ({ area, large }: { area: Area; large: boolean }) => (
  <>
    <h3
      className={`font-semibold tracking-tight ${
        large ? "text-3xl lg:text-4xl" : "text-xl sm:text-2xl"
      }`}
    >
      {area.title}
    </h3>
    <p
      className={`mt-3 max-w-[48ch] leading-relaxed opacity-80 ${
        large ? "text-lg md:mt-4" : "text-base"
      }`}
    >
      {area.summary}
    </p>
    <ul
      className="mt-4 flex list-none flex-wrap gap-2 md:mt-6"
      aria-label={`${area.title} tools`}
    >
      {area.tools.map((tool) => (
        <li
          key={tool}
          className="rounded-full px-3.5 py-1.5 text-sm sm:px-4"
          style={{ backgroundColor: MOSS, color: CREAM }}
        >
          {tool}
        </li>
      ))}
    </ul>
  </>
);

const StackedExpertise = () => (
  <Section id="expertise" fitScreen={false}>
    <div className="px-4 pb-24 pt-28 sm:px-8">
      <Card size="xl" variant="dark" className="mx-auto flex flex-col gap-10">
        <Intro pinned={false} />
        <ul className="flex list-none flex-col" aria-label="Areas of expertise">
          {AREAS.map((area) => (
            <li
              key={area.title}
              className="border-t border-white/10 py-8 last:pb-0"
            >
              <AreaDetail area={area} large={false} />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  </Section>
);

const PinnedExpertise = () => {
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
        <div className="sticky top-0 flex h-screen items-center justify-center px-8 pb-10 pt-28">
          <Card
            size="xl"
            variant="dark"
            className="grid h-full max-h-[44rem] grid-cols-12 grid-rows-[1fr_auto] gap-x-8 gap-y-8 overflow-hidden lg:gap-x-12 lg:gap-y-10"
          >
            <div className="col-span-5 flex min-h-0 flex-col justify-between gap-8">
              <Intro pinned />

              <nav aria-label="Areas of expertise">
                <ul className="flex list-none flex-col gap-1">
                  {AREAS.map((area, i) => {
                    const isActive = i === active;
                    return (
                      <li key={area.title}>
                        <button
                          type="button"
                          onClick={() => goTo(i)}
                          aria-current={isActive ? "true" : undefined}
                          className={`flex items-center py-1 text-left text-base transition-opacity duration-300 motion-reduce:transition-none lg:text-lg ${
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

            <div className="relative col-span-7 min-h-0">
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
                    className={`absolute inset-0 flex flex-col justify-end transition duration-500 ease-out motion-reduce:transition-none ${state}`}
                  >
                    <AreaDetail area={area} large />
                  </article>
                );
              })}
            </div>

            <div
              aria-hidden="true"
              className="col-span-12 h-0.5 w-full overflow-hidden rounded-full bg-white/15"
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

const Expertise = () => {
  const pinned = useMediaQuery(PINNED_QUERY);
  return pinned ? <PinnedExpertise /> : <StackedExpertise />;
};

export default Expertise;
