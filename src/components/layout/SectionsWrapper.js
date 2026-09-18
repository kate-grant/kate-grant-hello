import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
const SectionsWrapper = ({ children }) => {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        function onResize() {
            setIsMobile(window.innerWidth <= 767);
        }
        window.addEventListener("resize", onResize);
        onResize();
        return () => window.removeEventListener("resize", onResize);
    }, []);
    return _jsx(_Fragment, { children: children });
};
export default SectionsWrapper;
