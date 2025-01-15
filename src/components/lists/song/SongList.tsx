import React, { memo } from 'react';
import { SongType, PageType, SourceType } from '@/constants/Types';
import { useGlobalContext } from '@/src/context/GlobalProvider';
import Song from '@/src/components/song';
import DeleteModal from '@/src/components/modals/DeleteModal';
import { generateSongKey } from '@/lib/controllers/SongController';
import List from '@/src/components/List';

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
  }
) => {

  const { selectedId } = useGlobalContext();

  const renderItem = ({item} : {item: SongType}) => {
    item.pageType = pageType;
    item.sourceId = sourceId;
    item.sourceType = sourceType;
    return (
      <MemoSong 
        song={item}
        fadeCover={fadeCover}
        fadeSong={fadeSong}
      />
    );
  };

  return (
    <>
      <DeleteModal />
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
      />
    </>
  );

});

export default SongList;
