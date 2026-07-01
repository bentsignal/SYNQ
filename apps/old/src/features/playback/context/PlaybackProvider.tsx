import { SortOrder, SortType, SourceType } from "@/src/constants/Types";
import { usePlaybackAddOffset } from "@/src/features/playback/hooks/use-playback-add-offset";
import { usePlaybackLifecycleState } from "@/src/features/playback/hooks/use-playback-lifecycle-state";
import { usePlaybackModeState } from "@/src/features/playback/hooks/use-playback-mode-state";
import { usePlaybackQueueFilterState } from "@/src/features/playback/hooks/use-playback-queue-filter-state";
import { usePlaybackQueueRefresh } from "@/src/features/playback/hooks/use-playback-queue-refresh";
import { usePlaybackSourceState } from "@/src/features/playback/hooks/use-playback-source-state";
import React, { createContext, useContext } from "react";

type Props = {
  children?: React.ReactNode;
};

interface PlaybackContextType {
  sourceId: number | null;
  setSourceId: (newValue: number | null) => void;
  sourceType: SourceType | null;
  setSourceType: (newValue: SourceType | null) => void;
  shuffle: boolean;
  setShuffle: (newValue: boolean) => void;
  loop: boolean;
  setLoop: (newValue: boolean) => void;
  playerInitialized: boolean;
  setPlayerInitialized: (newValue: boolean) => void;
  addOffset: number;
  setAddOffset: (newValue: number) => void;
  incrementAddOffset: () => Promise<void>;
  decrementAddOffset: () => Promise<void>;
  resetAddOffset: () => Promise<void>;
  sort: SortType;
  setSort: (newValue: SortType) => void;
  order: SortOrder;
  setOrder: (newValue: SortOrder) => void;
  query: string;
  setQuery: (newValue: string) => void;
  queueRevision: number;
  requestQueueRefresh: () => void;
};

type PlaybackModeContextType = Pick<
  PlaybackContextType,
  "loop" | "setLoop" | "setShuffle" | "shuffle"
>;
type PlaybackSourceContextType = Pick<
  PlaybackContextType,
  "setSourceId" | "setSourceType" | "sourceId" | "sourceType"
>;

const PlaybackContext = createContext<PlaybackContextType>({
  sourceId: null,
  setSourceId: () => {},
  sourceType: null,
  setSourceType: () => {},
  shuffle: false,
  setShuffle: () => {},
  loop: false,
  setLoop: () => {},
  playerInitialized: false,
  setPlayerInitialized: () => {},
  addOffset: 0,
  setAddOffset: () => {},
  incrementAddOffset: () => Promise.resolve(),
  decrementAddOffset: () => Promise.resolve(),
  resetAddOffset: () => Promise.resolve(),
  sort: SortType.DATE,
  setSort: () => {},
  order: SortOrder.DESC,
  setOrder: () => {},
  query: "",
  setQuery: () => {},
  queueRevision: 0,
  requestQueueRefresh: () => {},
});

const PlaybackModeContext = createContext<PlaybackModeContextType>({
  loop: false,
  setLoop: () => {},
  setShuffle: () => {},
  shuffle: false,
});
const PlaybackSourceContext = createContext<PlaybackSourceContextType>({
  setSourceId: () => {},
  setSourceType: () => {},
  sourceId: null,
  sourceType: null,
});

export const usePlaybackContext = () => useContext(PlaybackContext);
export const usePlaybackModeContext = () => useContext(PlaybackModeContext);
export const usePlaybackSourceContext = () => useContext(PlaybackSourceContext);

const PlaybackProvider: React.FC<Props> = ({ children }) => {
  const { setSourceId, setSourceType, sourceId, sourceType } =
    usePlaybackSourceState();
  const { loop, setLoop, setShuffle, shuffle } = usePlaybackModeState();
  const { playerInitialized, setPlayerInitialized } =
    usePlaybackLifecycleState();
  const {
    addOffset,
    decrementAddOffset,
    incrementAddOffset,
    resetAddOffset,
    setAddOffset,
  } = usePlaybackAddOffset();
  const { order, query, setOrder, setQuery, setSort, sort } =
    usePlaybackQueueFilterState();
  const { queueRevision, requestQueueRefresh } = usePlaybackQueueRefresh();

  return (
    <PlaybackModeContext.Provider value={{ loop, setLoop, setShuffle, shuffle }}
    >
      <PlaybackSourceContext.Provider
        value={{ setSourceId, setSourceType, sourceId, sourceType }}
      >
        <PlaybackContext.Provider
          value={{
            sourceId,
            setSourceId,
            sourceType,
            setSourceType,
            shuffle,
            setShuffle,
            loop,
            setLoop,
            playerInitialized,
            setPlayerInitialized,
            addOffset,
            setAddOffset,
            incrementAddOffset,
            decrementAddOffset,
            resetAddOffset,
            sort,
            setSort,
            order,
            setOrder,
            query,
            setQuery,
            queueRevision,
            requestQueueRefresh,
          }}
        >
          {children}
        </PlaybackContext.Provider>
      </PlaybackSourceContext.Provider>
    </PlaybackModeContext.Provider>
  );
};

export default PlaybackProvider;
