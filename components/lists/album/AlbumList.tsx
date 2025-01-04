import { View, Text } from "react-native";
import { AlbumType, PageType } from "@/constants/Types";
import List from "@/components/List";
import AlbumItem from "@/components/lists/album/AlbumItem";
import { memo } from "react";

const MemoAlbum = memo(AlbumItem);

const AlbumList = ({
  albums,
  headerComponent,
  pageType,
  bottomPadding = false,
  gradientStart,
  gradientEnd,
}: {
  albums: AlbumType[],
  headerComponent?: React.ReactNode,
  bottomPadding?: boolean,
  pageType: PageType,
  gradientStart?: string,
  gradientEnd?: string,
}) => {

  const renderItem = ({item}: {item: AlbumType}) => {
    item.pageType = pageType;
    return (
      <MemoAlbum album={item} allowInteraction={true}/>
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
    />
  );
}

export default AlbumList; 