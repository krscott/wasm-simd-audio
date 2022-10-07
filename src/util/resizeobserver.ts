import { useEffect, useState } from "preact/hooks";

export const useElementRect = <T extends Element>(element: T | null) => {
  const [rect, setRect] = useState<DOMRectReadOnly>(
    () => element?.getBoundingClientRect() ?? new DOMRectReadOnly(0, 0, 0, 0)
  );

  useEffect(() => {
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        console.log(entry);
        if (entry.target === element) {
          setRect(entry.contentRect);
        }
      }
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [element]);

  return rect;
};
