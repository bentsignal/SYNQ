import List from '@/components/List';
import { memo } from 'react';
import { PlaylistType, PageType } from '@/constants/Types';
import Playlist from '@/components/playlist';
import BottomSheet from '@gorhom/bottom-sheet';

const MemoPlaylist = memo(Playlist);

const PlaylistList = memo(({
  playlists,
  headerComponent,
  pageType,
  bottomPadding = false,
  sheetRef,
}: {
  playlists: PlaylistType[],
  headerComponent?: React.ReactNode,
  bottomPadding?: boolean,
  pageType: PageType,
  sheetRef?: React.RefObject<BottomSheet>,
}) => {

  const renderItem = ({item}: {item: PlaylistType}) => {
    item.pageType = pageType;
    return (
      <MemoPlaylist playlist={item} sheetRef={sheetRef} />
    );
  };

  const getKey = (item: PlaylistType) => {
    return `${item.id}-${item.name}-${item.songCount}`;
  }

  return (
    <List 
      data={playlists}
      headerComponent={headerComponent}
      item={renderItem}
      keyExtractor={getKey}
      bottomPadding={bottomPadding}
    />
  );

});

export default PlaylistList;


