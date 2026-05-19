import { useEffect, useState } from "react";

export function useIsNarrow(maxWidth = 640) {
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const onChange = () => setIsNarrow(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [maxWidth]);

  return isNarrow;
}
