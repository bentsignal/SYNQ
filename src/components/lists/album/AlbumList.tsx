import { AlbumType, PageType } from "@/src/constants/Types";
import List from "@/src/components/List";
import AlbumItem from "@/src/components/lists/album/AlbumItem";
import { memo } from "react";

const MemoAlbum = memo(AlbumItem);

const AlbumList = ({
  albums,
  headerComponent,
  pageType,
  bottomPadding = false,
  gradientStart,
  gradientEnd,
  emptyComponent,
  bg,
  showEmptyComponent,
}: {
  albums: AlbumType[],
  headerComponent?: React.ReactNode,
  bottomPadding?: boolean,
  pageType: PageType,
  gradientStart?: string,
  gradientEnd?: string,
  emptyComponent?: React.ReactNode,
  bg?: string,
  showEmptyComponent?: boolean,
}) => {

  const renderItem = ({item}: {item: AlbumType}) => {
    item.pageType = pageType;
    return (
      <MemoAlbum album={item} allowInteraction={true} bg={bg}/>
    );
  };

  const getKey = (item: AlbumType) => {
    return `${item.id}-${item.name}`;
  }

  return (
    <List 
      data={albums}
      headerComponent={headerComponent}
      item={renderItem}
      keyExtractor={getKey}
      bottomPadding={bottomPadding}
      gradientStart={gradientStart}
      gradientEnd={gradientEnd}
      emptyComponent={emptyComponent}
      showEmptyComponent={showEmptyComponent}
    />
  );
}

export default AlbumList; 