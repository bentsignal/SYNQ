import { SourceType } from '@/src/constants/Types';
import React, { createContext, useContext, useState } from 'react';

type Props = {
  children?: React.ReactNode;
}

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
}

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
});

export const usePlaybackContext = () => useContext(PlaybackContext);

const PlaybackProvider: React.FC<Props> = ({ children }) => {

  const [sourceId, setSourceId] = useState<number | null>(null);
  const [sourceType, setSourceType] = useState<SourceType | null>(null);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [loop, setLoop] = useState<boolean>(false);
  const [playerInitialized, setPlayerInitialized] = useState<boolean>(false);
  const [addOffset, setAddOffset] = useState<number>(0);

  return (
    <PlaybackContext.Provider value={{ 
      sourceId, setSourceId, 
      sourceType, setSourceType, 
      shuffle, setShuffle,
      loop, setLoop,
      playerInitialized, setPlayerInitialized,
      addOffset, setAddOffset,
    }}>
      {children}
    </PlaybackContext.Provider>


  );

}

export default PlaybackProvider;