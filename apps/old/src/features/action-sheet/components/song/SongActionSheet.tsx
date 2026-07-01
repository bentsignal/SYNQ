import Sheet from "@/src/features/action-sheet/components";
import SheetStyles from "@/src/features/action-sheet/components/Styles";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import { useSheetScroll } from "@/src/features/action-sheet/hooks/use-sheet-scroll";
import { useSongSheetCover } from "@/src/features/action-sheet/hooks/use-song-sheet-cover";
import { CoverType } from "@/src/constants/Types";
import ListCover from "@/src/features/cover/components/ListCover";
import SongInfo from "@/src/features/library/components/song/SongInfo";
import { Dimensions, ScrollView, View } from "react-native";
import SongOptions from "./SongOptions";

type SongActionSheetProps = {
  library?: boolean;
  name: string;
};

export default function SongActionSheet({
  library = false,
  name,
}: SongActionSheetProps) {
  const { editSong } = useActionSheetContext();
  const { coverImage, emptyCover } = useSongSheetCover(editSong);
  const { handleSheetChange, scrollEnabled, scrollRef } = useSheetScroll();

  return (
    <Sheet name={name} onChange={handleSheetChange}>
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
        <SongOptions name={name} library={library} />
      </ScrollView>
    </Sheet>
  );
}
