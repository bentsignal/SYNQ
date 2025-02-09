import { SourceType } from '@/src/constants/Types';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  incrementAddOffset: () => Promise<void>;
  decrementAddOffset: () => Promise<void>;
  resetAddOffset: () => Promise<void>;
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
  incrementAddOffset: () => Promise.resolve(),
  decrementAddOffset: () => Promise.resolve(),
  resetAddOffset: () => Promise.resolve(),
});


export const usePlaybackContext = () => useContext(PlaybackContext);

const PlaybackProvider: React.FC<Props> = ({ children }) => {

  const [sourceId, setSourceId] = useState<number | null>(null);
  const [sourceType, setSourceType] = useState<SourceType | null>(null);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [loop, setLoop] = useState<boolean>(false);
  const [playerInitialized, setPlayerInitialized] = useState<boolean>(false);
  const [addOffset, setAddOffset] = useState<number>(0);

  const incrementAddOffset = async () => {
    const newOffset = addOffset+1;
    setAddOffset(newOffset);
    await AsyncStorage.setItem('addOffset', newOffset.toString());
  }

  const decrementAddOffset = async () => {
    if (addOffset > 0) {
      const newOffset = addOffset-1;
      setAddOffset(newOffset);
      await AsyncStorage.setItem('addOffset', newOffset.toString());
    }
  }

  const resetAddOffset = async () => {
    setAddOffset(0);
    await AsyncStorage.setItem('addOffset', '0');
  }

  return (
    <PlaybackContext.Provider value={{ 
      sourceId, setSourceId, 
      sourceType, setSourceType, 
      shuffle, setShuffle,
      loop, setLoop,
      playerInitialized, setPlayerInitialized,
      addOffset, setAddOffset,
      incrementAddOffset, decrementAddOffset, resetAddOffset,
    }}>
      {children}

    </PlaybackContext.Provider>


  );

}

export default PlaybackProvider;