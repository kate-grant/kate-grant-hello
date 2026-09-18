import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import AsciiBackground from "@/components/background/ASCIIBackground";
const fixedStyle = {
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
const ScrollContainer = ({ children }) => {
    const homeRef = useRef(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    useEffect(() => {
        const onScroll = () => {
            if (!homeRef.current)
                return;
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
    return (_jsxs(_Fragment, { children: [_jsx("div", { style: fixedStyle, children: "KATE GRANT" }), _jsx(AsciiBackground, { variant: variant }), _jsx("div", { ref: homeRef, className: "h-2" }), children] }));
};
export default ScrollContainer;
