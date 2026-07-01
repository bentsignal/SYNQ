import SheetOption from "@/src/features/action-sheet/components/SheetOption";
import { useSongOptions } from "@/src/features/action-sheet/hooks/use-song-options";
import {
  CircleMinus,
  CirclePlus,
  Heart,
  HeartMinus,
  ListPlus,
  Share,
  SquarePen,
  Trash,
} from "lucide-react-native";

type SongOptionsProps = {
  name: string;
  library?: boolean;
};

const SongOptions = ({ name, library = false }: SongOptionsProps) => {
  const {
    handleAddToPlaylist,
    handleAddToQueue,
    handleDeleteSong,
    handleEditSong,
    handleExport,
    handleRemoveFromPlaylist,
    handleToggleInLiked,
    inLiked,
    showAddToPlaylist,
    showAddToQueue,
    showDelete,
    showEdit,
    showExport,
    showLikedToggle,
    showRemoveFromPlaylist,
  } = useSongOptions(name, library);

  return (
    <>
      {library && (
        <>
          <SheetOption
            icon={inLiked ? HeartMinus : Heart}
            text={inLiked ? "Remove from Liked Songs" : "Add to Liked Songs"}
            show={showLikedToggle}
            handler={handleToggleInLiked}
          />
          <SheetOption
            icon={CirclePlus}
            text={"Add to Playlist"}
            show={showAddToPlaylist}
            handler={handleAddToPlaylist}
          />
          <SheetOption
            icon={CircleMinus}
            text={"Remove from Playlist"}
            show={showRemoveFromPlaylist}
            handler={handleRemoveFromPlaylist}
          />
          <SheetOption
            icon={ListPlus}
            text={"Add to Queue"}
            show={showAddToQueue}
            handler={handleAddToQueue}
          />
        </>
      )}
      <SheetOption
        icon={SquarePen}
        text={"Edit"}
        show={showEdit}
        handler={handleEditSong}
      />
      <SheetOption
        icon={Trash}
        text={"Delete"}
        show={showDelete}
        handler={handleDeleteSong}
      />
      <SheetOption
        icon={Share}
        text={"Export"}
        show={showExport}
        handler={handleExport}
      />
    </>
  );
};

export default SongOptions;
