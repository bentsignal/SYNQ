import SheetStyles from "@/src/features/action-sheet/components/Styles";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import { useSongSheetCover } from "@/src/features/action-sheet/hooks/use-song-sheet-cover";
import { CoverType } from "@/src/constants/Types";
import ListCover from "@/src/features/cover/components/ListCover";
import SongInfo from "@/src/features/library/components/song/SongInfo";
import { View } from "react-native";

export default function SongSheetHeader() {
  const { editSong } = useActionSheetContext();
  const { coverImage, emptyCover } = useSongSheetCover(editSong);

  return (
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
  );
}
