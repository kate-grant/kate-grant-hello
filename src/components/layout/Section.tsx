type SectionProps = {
  id: string;
  className?: string;
  children: React.ReactNode;
  fitScreen?: boolean;
};

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
