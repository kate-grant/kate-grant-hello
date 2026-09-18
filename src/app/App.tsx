import "@/styles/App.css";
import ScrollContainer from "@/components/layout/ScrollContainer";
import SectionsWrapper from "@/components/layout/SectionsWrapper";
import Hero from "@/sections/hero/Hero";
import Expertise from "@/sections/expertise/Expertise";
import Contact from "@/sections/contact/Contact";

function App() {
  return (
    <>
      <ScrollContainer>
        <SectionsWrapper>
          <Hero />
          <Expertise />
          <Contact />
        </SectionsWrapper>
      </ScrollContainer>
    </>
  );
}

export default App;
