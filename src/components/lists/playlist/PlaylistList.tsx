import List from '@/src/components/List';
import { memo } from 'react';
import { PlaylistType, PageType } from '@/src/constants/Types';
import PlaylistItem from '@/src/components/lists/playlist/PlaylistItem';

const MemoPlaylist = memo(PlaylistItem);

const PlaylistList = memo(({
  playlists,
  headerComponent,
  pageType,
  bottomPadding = false,
  gradientStart,
  gradientEnd,
  bg,
}: {
  playlists: PlaylistType[],
  headerComponent?: React.ReactNode,
  bottomPadding?: boolean,
  pageType: PageType,
  gradientStart?: string,
  gradientEnd?: string,
  bg?: string,
}) => {

  const renderItem = ({item}: {item: PlaylistType}) => {
    item.pageType = pageType;
    return (
      <MemoPlaylist playlist={item} bg={bg} />
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
      gradientStart={gradientStart}
      gradientEnd={gradientEnd}
    />
  );

});

export default PlaylistList;


