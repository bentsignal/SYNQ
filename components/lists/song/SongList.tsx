import React, { memo } from 'react';
import { SongType, PageType, SourceType } from '@/constants/Types';
import { useGlobalContext } from '@/context/GlobalProvider';
import Song from '@/components/song';
import EditModal from '@/components/modals/EditModal';
import DeleteModal from '@/components/modals/DeleteModal';
import { generateSongKey } from '@/lib/SongManager';
import List from '@/components/List';
import BottomSheet from '@gorhom/bottom-sheet';

const MemoSong = memo(Song);

const SongList = memo((
  {
    songs, 
    headerComponent, 
    bottomPadding = false,
    pageType, 
    fadeCover = true, 
    fadeSong = false,
    sheetRef,
    sourceId,
    sourceType,
    setScrollPosition,
  }: 
  {
    songs: SongType[], 
    headerComponent?: React.ReactNode,
    bottomPadding?: boolean,
    pageType: PageType,
    fadeCover?: boolean,
    fadeSong?: boolean,
    sheetRef?: React.RefObject<BottomSheet>,
    sourceId?: number,
    sourceType?: SourceType,
    setScrollPosition?: (position: number) => void,
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
        sheetRef={sheetRef}
      />
    );
  };

  return (
    <>
      <EditModal />
      <DeleteModal />
      <List 
        data={songs}
        headerComponent={headerComponent}
        item={renderItem}
        keyExtractor={(song, index) => generateSongKey(song)}
        extra={selectedId}
        setScrollPosition={setScrollPosition}
      />
    </>
  );

});

export default SongList;
