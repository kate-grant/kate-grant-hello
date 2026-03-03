import { useEffect, useRef, useState, type CSSProperties } from "react";
import AsciiBackground from "@/components/background/ASCIIBackground";

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
  backgroundColor: "#000",
  color: "#fdffbf",
};

const ScrollContainer: React.FC = () => {
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
      <div
        ref={homeRef}
        style={{
          minHeight: "100vh",
        }}
      ></div>
    </>
  );
};

export default ScrollContainer;
