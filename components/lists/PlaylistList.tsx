import List from '@/components/List';
import { memo } from 'react';
import { PlaylistType, PageType } from '@/constants/Types';
import Playlist from '@/components/playlist/Playlist';

const MemoPlaylist = memo(Playlist);

const PlaylistList = memo(({
  playlists,
  headerComponent,
  bottomPadding = false,
}: {
  playlists: PlaylistType[],
  headerComponent?: React.ReactNode,
  bottomPadding?: boolean,
}) => {

  const renderItem = ({item}: {item: PlaylistType}) => {
    return (
      <MemoPlaylist playlist={item} />
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


