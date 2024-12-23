import { View, Text } from "react-native";
import { ArtistType, PageType } from "@/constants/Types";
import List from "@/components/List";
import ArtistItem from "@/components/lists/artist/ArtistItem";
import { memo } from "react";

const MemoArtist = memo(ArtistItem);

const ArtistList = ({
  artists,
  headerComponent,
  pageType,
  bottomPadding = false,
  gradientStart,
  gradientEnd,
}: {
  artists: ArtistType[],
  headerComponent?: React.ReactNode,
  bottomPadding?: boolean,
  pageType: PageType,
  gradientStart?: string,
  gradientEnd?: string,
}) => {

  const renderItem = ({item}: {item: ArtistType}) => {
    item.pageType = pageType;
    return (
      <MemoArtist artist={item} />
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
    />
  );
}

export default ArtistList;