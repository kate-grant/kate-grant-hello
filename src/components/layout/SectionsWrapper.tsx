import { useEffect, useState } from "react";
import type { FC } from "react";

const SectionsWrapper: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function onResize() {
      setIsMobile(window.innerWidth <= 767);
    }
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return <>{children}</>;
};

export default SectionsWrapper;
