import { useRef } from "react";

/**
 * The next order comes from a row's action, so rows slide into it; `moved` is
 * the entry that moved, which fades across instead of sliding over the rest.
 */
type SlideNextOrder = { moved: string | null } | null;

/** Marks the next order as one to slide into; the order takes the mark. */
export function useSlideNextOrder() {
  const slideRef = useRef<SlideNextOrder>(null);
  return {
    mark(slide: SlideNextOrder) {
      slideRef.current = slide;
    },
    take() {
      const slide = slideRef.current;
      slideRef.current = null;
      return slide;
    },
  };
}

export type SlideNextOrderMark = ReturnType<typeof useSlideNextOrder>;
