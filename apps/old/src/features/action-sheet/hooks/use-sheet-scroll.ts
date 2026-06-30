import { useCallback, useRef, useState } from "react";
import { ScrollView } from "react-native";

export function useSheetScroll() {
  const [scrollEnabled, setScrollEnabled] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const handleSheetChange = useCallback((index: number) => {
    if (index === 0) {
      setScrollEnabled(false);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    if (index === 1) {
      setScrollEnabled(true);
    }
  }, []);

  return {
    handleSheetChange,
    scrollEnabled,
    scrollRef,
  };
}
