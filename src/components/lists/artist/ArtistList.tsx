import { View, Text } from "react-native";
import { ArtistType, PageType } from "@/src/constants/Types";
import List from "@/src/components/List";
import ArtistItem from "@/src/components/lists/artist/ArtistItem";
import { memo } from "react";

const MemoArtist = memo(ArtistItem);

const ArtistList = ({
  artists,
  headerComponent,
  pageType,
  bottomPadding = false,
  gradientStart,
  gradientEnd,
  emptyComponent,
  showEmptyComponent,
  bg,
}: {
  artists: ArtistType[],
  headerComponent?: React.ReactNode,
  bottomPadding?: boolean,
  pageType: PageType,
  gradientStart?: string,
  gradientEnd?: string,
  emptyComponent?: React.ReactNode,
  showEmptyComponent?: boolean,
  bg?: string,
}) => {

  const renderItem = ({item}: {item: ArtistType}) => {
    item.pageType = pageType;
    return (
      <MemoArtist artist={item} allowInteraction={true} bg={bg}/>
    );
  };

  const getKey = (item: ArtistType) => {
    return `${item.id}-${item.name}`;
  }

  return (
    <List 
      data={artists}
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

export default ArtistList;