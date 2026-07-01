import { SortOrder, SortType, SourceType } from "@/src/constants/Types";
import { usePlaybackAddOffset } from "@/src/features/playback/hooks/use-playback-add-offset";
import { usePlaybackQueueRefresh } from "@/src/features/playback/hooks/use-playback-queue-refresh";
import { usePlaybackSourceState } from "@/src/features/playback/hooks/use-playback-source-state";
import React, { createContext, useContext, useState } from "react";

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

export const usePlaybackContext = () => useContext(PlaybackContext);

const PlaybackProvider: React.FC<Props> = ({ children }) => {
  const { setSourceId, setSourceType, sourceId, sourceType } =
    usePlaybackSourceState();
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [loop, setLoop] = useState<boolean>(false);
  const [playerInitialized, setPlayerInitialized] = useState<boolean>(false);
  const {
    addOffset,
    decrementAddOffset,
    incrementAddOffset,
    resetAddOffset,
    setAddOffset,
  } = usePlaybackAddOffset();
  const [sort, setSort] = useState<SortType>(SortType.DATE);
  const [order, setOrder] = useState<SortOrder>(SortOrder.DESC);
  const [query, setQuery] = useState<string>("");
  const { queueRevision, requestQueueRefresh } = usePlaybackQueueRefresh();

  return (
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
  );
};

export default PlaybackProvider;
