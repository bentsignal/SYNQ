import { useEffect, useState } from "react";
import SheetOption from "@/src/components/sheet/SheetOption";
import { PageType, SourceType } from "@/src/constants/Types";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import { usePremiumContext } from "@/src/features/premium/context/PremiumProvider";
import { exportSongs } from "@/src/features/export/lib/export-songs";
import {
  addSongToLibraryPlaylist,
  isSongInLibraryPlaylist,
  removeSongFromLibraryPlaylist,
} from "@/src/features/library/repository/library-entity-repository";
import { deleteLibrarySong } from "@/src/features/library/repository/library-song-repository";
import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import usePlayer from "@/src/features/playback/hooks/use-player";
import { useGlobalProgressContext } from "@/src/features/app-shell/context/GlobalProgressProvider";
import { useImportFlowContext } from "@/src/features/import/context/ImportFlowProvider";
import { removeImportSongs } from "@/src/features/import/lib/import-song-edits";
import { useSelectionContext } from "@/src/features/selection/context/SelectionProvider";
import { posthog } from "@/src/lib/posthog";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { router } from "expo-router";
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
import { Alert } from "react-native";

type SongOptionsProps = {
  name: string;
  library?: boolean;
};

const SongOptions = ({ name, library = false }: SongOptionsProps) => {
  const {
    editSong,
    numModified,
    setNumModified,
  } = useActionSheetContext();
  const { results, setExportDisabled, setResults } = useImportFlowContext();

  const { setShowImportAd, setShowGlobalLoading } =
    useGlobalProgressContext();
  const { selectedSongs } = useSelectionContext();

  const { addSongToQueue, removeSongsFromQueue } = usePlayer();
  const { premium } = usePremiumContext();
  const { sendHaptic } = useHaptics();
  const [pageType, setPageType] = useState<PageType>(PageType.IMPORT);
  const [inLiked, setinLiked] = useState(false);

  useEffect(() => {
    if (editSong.pageType) {
      try {
        setPageType(editSong.pageType);
        refreshinLiked(editSong.id);
      } catch (error) {
        console.log("error getting options for new song: ", error);
      }
    }
  }, [editSong]);

  const actionDelay = 10;

  const refreshinLiked = async (songId: number) => {
    const liked = await isSongInLibraryPlaylist(2, songId);
    setinLiked(liked);
  };

  const handleAddToQueue = () => {
    TrueSheet.dismiss(name);
    sendHaptic("light");
    setTimeout(async () => {
      await addSongToQueue(editSong);
    }, actionDelay);
  };

  const handleEditSong = () => {
    TrueSheet.dismiss(name);
    posthog.capture("edit_song");
    setTimeout(() => {
      router.push(`/song/edit/${editSong.id}`);
    }, actionDelay);
  };

  const handleExport = async () => {
    try {
      posthog.capture("export_song");
      TrueSheet.dismiss(name);
      if (pageType === PageType.IMPORT && !premium) {
        setShowImportAd(true);
      } else {
        setShowImportAd(false);
      }
      setShowGlobalLoading(true);
      await exportSongs([editSong]);
      setNumModified(numModified + 1);
      setShowGlobalLoading(false);
    } catch (error) {
      console.log("error exporting song: ", error);
      setShowGlobalLoading(false);
    }
  };

  const executeDelete = async () => {
    posthog.capture("delete_song");
    // handle bulk delete
    if (selectedSongs.length > 0) {
      const newResults = await removeImportSongs(results, selectedSongs);
      if (newResults.length <= 0) {
        setExportDisabled(true);
        router.replace("/(tabs)");
      }
      setResults(newResults);
    }
    // remove from library
    else if (editSong.pageType === PageType.LIBRARY) {
      await deleteLibrarySong(editSong.id);
      await removeSongsFromQueue([editSong.id]);
      setNumModified(numModified + 1);
    }
    // remove from import
    else if (editSong.pageType === PageType.IMPORT) {
      const ids = selectedSongs.length > 0 ? selectedSongs : [editSong.id];
      const newResults = await removeImportSongs(results, ids);
      if (newResults.length <= 0) {
        setExportDisabled(true);
      }
      if (newResults.length === 0) {
        router.replace("/(tabs)");
      }
      setResults(newResults);
    }
  };

  const handleDeleteSong = () => {
    TrueSheet.dismiss(name);
    setTimeout(() => {
      Alert.alert(
        `${selectedSongs.length > 1 ? "Delete songs" : "Delete song"}`,
        `Are you sure you want to delete ${editSong.fileName ?? "this song"}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              executeDelete();
            },
          },
        ],
      );
    }, actionDelay);
  };

  const handleAddToPlaylist = () => {
    posthog.capture("add_to_playlist");
    TrueSheet.dismiss(name);
    setTimeout(() => {
      router.push("/playlist/add");
    }, 200);
  };

  const handleRemoveFromPlaylist = async () => {
    posthog.capture("remove_from_playlist");
    TrueSheet.dismiss(name);
    try {
      if (editSong.sourceId === undefined) {
        return;
      }
      await removeSongFromLibraryPlaylist(editSong.sourceId, editSong.id);
    } catch (error) {
      console.log("error removing from playlist: ", error);
    }
  };

  const handleToggleinLiked = async () => {
    posthog.capture("toggle_in_liked");
    TrueSheet.dismiss(name);
    try {
      if (inLiked) {
        await removeSongFromLibraryPlaylist(2, editSong.id);
        setinLiked(false);
      } else {
        await addSongToLibraryPlaylist(2, editSong.id);
        setinLiked(true);
      }
    } catch (error) {
      console.log("error toggling in favorites: ", error);
    }
  };

  const exportIncludes = [
    PageType.LIBRARY,
    PageType.PLAYER,
    PageType.ARTIST,
    PageType.ALBUM,
    PageType.IMPORT,
  ].includes(pageType);
  const deleteExports = [PageType.LIBRARY, PageType.IMPORT].includes(pageType);

  return (
    <>
      {library && (
        <>
          <SheetOption
            icon={inLiked ? HeartMinus : Heart}
            text={inLiked ? "Remove from Liked Songs" : "Add to Liked Songs"}
            show={[
              PageType.LIBRARY,
              PageType.PLAYER,
              PageType.ARTIST,
              PageType.ALBUM,
            ].includes(pageType)}
            handler={handleToggleinLiked}
          />
          <SheetOption
            icon={CirclePlus}
            text={"Add to Playlist"}
            show={[
              PageType.LIBRARY,
              PageType.PLAYER,
              PageType.ARTIST,
              PageType.ALBUM,
            ].includes(pageType)}
            handler={handleAddToPlaylist}
          />
          <SheetOption
            icon={CircleMinus}
            text={"Remove from Playlist"}
            show={
              [PageType.LIBRARY, PageType.PLAYER].includes(pageType) &&
              editSong.sourceId !== undefined &&
              editSong.sourceId !== 1 &&
              editSong.sourceType === SourceType.PLAYLIST
            }
            handler={handleRemoveFromPlaylist}
          />
          <SheetOption
            icon={ListPlus}
            text={"Add to Queue"}
            show={[
              PageType.LIBRARY,
              PageType.QUEUE,
              PageType.PLAYER,
              PageType.ARTIST,
              PageType.ALBUM,
            ].includes(pageType)}
            handler={handleAddToQueue}
          />
        </>
      )}
      <SheetOption
        icon={SquarePen}
        text={"Edit"}
        show={[
          PageType.LIBRARY,
          PageType.IMPORT,
          PageType.ARTIST,
          PageType.ALBUM,
        ].includes(pageType)}
        handler={handleEditSong}
      />
      <SheetOption
        icon={Trash}
        text={"Delete"}
        show={premium ? deleteExports : deleteExports && library}
        handler={handleDeleteSong}
      />
      <SheetOption
        icon={Share}
        text={"Export"}
        show={premium ? exportIncludes : exportIncludes && library}
        handler={handleExport}
      />
    </>
  );
};

export default SongOptions;
