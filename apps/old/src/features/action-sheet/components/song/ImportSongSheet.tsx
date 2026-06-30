import React, { useRef, useState } from "react";
import ListCover from "@/src/features/cover/components/ListCover";
import Sheet from "@/src/features/action-sheet/components";
import SheetStyles from "@/src/features/action-sheet/components/Styles";
import SongInfo from "@/src/features/library/components/song/SongInfo";
import { CoverType } from "@/src/constants/Types";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import { Dimensions, ScrollView, View } from "react-native";
import SongOptions from "./SongOptions";
import { useSongSheetCover } from "@/src/features/action-sheet/hooks/use-song-sheet-cover";

type SongSheetProps = {
  name: string;
};

export default function ImportSongSheet({ name }: SongSheetProps) {
  const { editSong } = useActionSheetContext();
  const [scrollEnabled, setScrollEnabled] = useState(false);
  const { coverImage, emptyCover } = useSongSheetCover(editSong);
  const scrollRef = useRef<ScrollView>(null);

  const onChange = (index: number) => {
    if (index === 0) {
      setScrollEnabled(false);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } else if (index === 1) {
      setScrollEnabled(true);
    }
  };

  return (
    <Sheet name={name} onChange={onChange}>
      <View style={SheetStyles.infoContainer}>
        <ListCover
          type={CoverType.SONG}
          image={coverImage}
          propOnLoad={() => {}}
          empty={emptyCover}
        />
        <SongInfo
          fileName={editSong.fileName}
          title={editSong.title}
          artist={editSong.artist}
          album={editSong.album}
        />
      </View>
      <ScrollView
        ref={scrollRef}
        scrollEnabled={scrollEnabled}
        style={{
          height: Dimensions.get("window").height,
        }}
        contentContainerStyle={{
          paddingBottom: 300,
        }}
      >
        <SongOptions name={name} />
      </ScrollView>
    </Sheet>
  );
}
