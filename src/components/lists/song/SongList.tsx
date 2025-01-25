import React, { memo, useEffect, useState } from 'react';
import { SongType, PageType, SourceType } from '@/src/constants/Types';
import { useGlobalContext } from '@/src/context/GlobalProvider';
import Song from '@/src/components/song';
import { generateSongKey } from '@/src/controllers/SongController';
import List from '@/src/components/List';
import { useActiveTrack } from 'react-native-track-player';

const MemoSong = memo(Song);

const SongList = memo((
  {
    songs, 
    headerComponent, 
    footerComponent,
    bottomPadding = false,
    pageType, 
    fadeCover = true, 
    fadeSong = false,
    sourceId,
    sourceType,
    setScrollPosition,
    gradientStart,
    gradientEnd,
    emptyComponent,
    showEmptyComponent,
    lockScroll = false,
  }: 
  {
    songs: SongType[], 
    headerComponent?: React.ReactNode,
    footerComponent?: React.ReactNode,
    bottomPadding?: boolean,
    pageType: PageType,
    fadeCover?: boolean,
    fadeSong?: boolean,
    sourceId?: number,
    sourceType?: SourceType,
    setScrollPosition?: (position: number) => void,
    gradientStart?: string,
    gradientEnd?: string,
    emptyComponent?: React.ReactNode,
    showEmptyComponent?: boolean,
    lockScroll?: boolean,
  }
) => {

  const { selectedId } = useGlobalContext();

  const [activeId, setActiveId] = useState<number | undefined>(undefined);

  const activeTrack = useActiveTrack();

  useEffect(() => {
    if (activeTrack) {
      setActiveId(activeTrack.id);
    }
  }, [activeTrack]);

  const renderItem = ({item} : {item: SongType}) => {
    item.pageType = pageType;
    item.sourceId = sourceId;
    item.sourceType = sourceType;
    return (
      <MemoSong 
        song={item}
        fadeCover={fadeCover}
        fadeSong={fadeSong}
        activeId={activeId}
      />
    );
  };

  return (
    <>
      <List 
        data={songs}
        headerComponent={headerComponent}
        footerComponent={footerComponent}
        item={renderItem}
        keyExtractor={(song, index) => generateSongKey(song)}
        extra={selectedId}
        setScrollPosition={setScrollPosition}
        gradientStart={gradientStart}
        gradientEnd={gradientEnd}
        emptyComponent={emptyComponent}
        showEmptyComponent={showEmptyComponent}
        lockScroll={lockScroll}
      />
    </>
  );

});

export default SongList;
