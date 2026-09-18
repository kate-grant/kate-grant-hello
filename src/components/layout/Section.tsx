type SectionProps = {
  id: string;
  className?: string;
  children: React.ReactNode;
  /** Lock the section to one screen tall (default). Set false for sections
   *  that scroll through content, like Expertise. */
  fitScreen?: boolean;
};

// Sections sit at z-index 15: above the pinned hero pills (10), below the
// fixed name pill (20), so content scrolls over the pills but under the name.
const Section = ({
  id,
  className = "",
  children,
  fitScreen = true,
}: SectionProps) => {
  return (
    <section
      id={id}
      className={`${className} ${
        fitScreen ? "h-screen" : ""
      } relative z-[15] box-border snap-start`}
    >
      {children}
    </section>
  );
};

export default Section;
