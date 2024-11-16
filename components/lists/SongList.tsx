import { StyleSheet } from 'react-native';
import React, { memo } from 'react';
import { SongType, PageType } from '@/constants/Types';
import { useGlobalContext } from '@/context/GlobalProvider';
import Song from '@/components/song/Song';
import EditModal from '@/components/modals/EditModal';
import DeleteModal from '@/components/modals/DeleteModal';
import { generateSongKey } from '@/lib/SongManager';
import List from '@/components/List';

const MemoSong = memo(Song);

const SongList = memo((
  {
    songs, 
    headerComponent, 
    bottomPadding = false,
    pageType, 
    fadeCover = true, 
    fadeSong = false
  }: 
  {
    songs: SongType[], 
    headerComponent?: React.ReactNode,
    bottomPadding?: boolean,
    pageType: PageType,
    fadeCover?: boolean,
    fadeSong?: boolean
  }
) => {

  const { selectedId } = useGlobalContext();

  const Local = StyleSheet.create({
    list: {
      width: '100%'
    },
    listContent: {
      paddingBottom: 100,
      display: 'flex',
      alignItems: 'center'
    },
  });

  const renderItem = ({item} : {item: SongType}) => {
    item.pageType = pageType;
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
      <EditModal />
      <DeleteModal />
      <List 
        data={songs}
        headerComponent={headerComponent}
        item={renderItem}
        keyExtractor={(song, index) => generateSongKey(song)}
        extra={selectedId}
      />
    </>
  );

});

export default SongList;
