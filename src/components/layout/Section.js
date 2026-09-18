import { jsx as _jsx } from "react/jsx-runtime";
// Sections sit at z-index 15: above the pinned hero pills (10), below the
// fixed name pill (20), so content scrolls over the pills but under the name.
const Section = ({ id, className = "", children, fitScreen = true, }) => {
    return (_jsx("section", { id: id, className: `${className} ${fitScreen ? "h-screen" : ""} relative z-[15] box-border snap-start`, children: children }));
};
export default Section;
