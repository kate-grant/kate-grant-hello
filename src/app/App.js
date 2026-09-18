import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import "@/styles/App.css";
import ScrollContainer from "@/components/layout/ScrollContainer";
import SectionsWrapper from "@/components/layout/SectionsWrapper";
import Hero from "@/sections/hero/Hero";
import Expertise from "@/sections/expertise/Expertise";
function App() {
    return (_jsx(_Fragment, { children: _jsx(ScrollContainer, { children: _jsxs(SectionsWrapper, { children: [_jsx(Hero, {}), _jsx(Expertise, {})] }) }) }));
}
export default App;
