import { useEffect, useRef, useState, type CSSProperties } from "react";
import AsciiBackground from "@/components/background/ASCIIBackground";
import type { FC } from "react";
import AnimatedSVGsContainer from "@/sections/hero/AnimatedSVGContainer";

const fixedStyle: CSSProperties = {
  position: "fixed",
  top: 40,
  left: "50%",
  transform: "translateX(-50%)",
  fontSize: "2.5rem",
  fontWeight: "bold",
  fontFamily: "sans-serif",
  zIndex: 20,
  userSelect: "none",
  padding: "0 2em",
  borderRadius: "500px",
  backgroundColor: "rgba(0, 0, 0, 0.75)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  color: "#fdffbf",
};

const ScrollContainer: FC<{ children: React.ReactNode }> = ({ children }) => {
  const homeRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (!homeRef.current) return;

      const rect = homeRef.current.getBoundingClientRect();
      const vh = window.innerHeight;

      const distance = -rect.top;
      const total = vh;
      const raw = distance / total;
      const t = Math.max(0, Math.min(1, raw));

      setScrollProgress(t);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const variant = scrollProgress < 0.5 ? "home" : "info";

  return (
    <>
      <div style={fixedStyle}>KATE GRANT</div>
      <AsciiBackground variant={variant} />
      <div ref={homeRef} className={"h-2"}></div>
      {children}
    </>
  );
};

export default ScrollContainer;
