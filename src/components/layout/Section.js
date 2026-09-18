import { jsx as _jsx } from "react/jsx-runtime";
const Section = ({ id, className = "", children, fitScreen = true, }) => {
    return (_jsx("section", { id: id, className: `${className} ${fitScreen ? "h-screen" : ""} relative z-[15] box-border snap-start`, children: children }));
};
export default Section;
