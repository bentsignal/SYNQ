import List from '@/components/List';
import { memo } from 'react';
import { PlaylistType, PageType } from '@/constants/Types';
import PlaylistItem from '@/components/lists/playlist/PlaylistItem';

const MemoPlaylist = memo(PlaylistItem);

const PlaylistList = memo(({
  playlists,
  headerComponent,
  pageType,
  bottomPadding = false,
}: {
  playlists: PlaylistType[],
  headerComponent?: React.ReactNode,
  bottomPadding?: boolean,
  pageType: PageType,
}) => {

  const renderItem = ({item}: {item: PlaylistType}) => {
    item.pageType = pageType;
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


