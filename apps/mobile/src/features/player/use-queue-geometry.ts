import { useSharedValue } from "react-native-reanimated";

/** Where the queue's list is, as the UI thread needs it during a gesture. */
export function useQueueGeometry(count: number) {
  return {
    /** Entries in Up Next. */
    count: useSharedValue(count),
    /** Up Next's top in the scroll view's content. */
    listTop: useSharedValue(0),
    maxScroll: useSharedValue(0),
    scrollY: useSharedValue(0),
    /** A drag is driving `scrollY`; scroll events would only set it back. */
    scrollYIsDriven: useSharedValue(false),
    topInset: useSharedValue(0),
    viewportHeight: useSharedValue(0),
    width: useSharedValue(0),
  };
}

export type QueueGeometry = ReturnType<typeof useQueueGeometry>;
