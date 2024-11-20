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
    console.log(item);
    return (
      <MemoPlaylist playlist={item} />
    );
  };

  return (
    <List 
      data={playlists}
      headerComponent={headerComponent}
      item={renderItem}
      keyExtractor={(item, index) => item.id.toString()}
      bottomPadding={bottomPadding}
    />
  );

});

export default PlaylistList;


