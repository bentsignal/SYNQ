import { useEffect, useState } from "react";
import SheetOption from "@/src/components/sheet/SheetOption";
import { PageType, SourceType } from "@/src/constants/Types";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import { usePremiumContext } from "@/src/context/PremiumProvider";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { exportSongs } from "@/src/controllers/ImportExportController";
import { deleteFromLibrary } from "@/src/controllers/LibraryController";
import { getTrackFromSong } from "@/src/features/playback/lib/player-track-service";
import {
  addToPlaylist,
  isSongInPlaylist,
  removeFromAllPlaylists,
  removeFromPlaylist,
} from "@/src/controllers/PlaylistController";
import { removeSongs } from "@/src/controllers/SongController";
import { useHaptics } from "@/src/hooks/use-haptics";
import usePlayer from "@/src/features/playback/hooks/use-player";
import { useGlobalProgressContext } from "@/src/features/app-shell/context/GlobalProgressProvider";
import { useImportFlowContext } from "@/src/features/import/context/ImportFlowProvider";
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
import TrackPlayer, { Track } from "react-native-track-player";

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

  const { addToQueue } = usePlayer();
  const { premium } = usePremiumContext();
  const { theme } = useThemeContext();
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
    const liked = await isSongInPlaylist(2, songId);
    setinLiked(liked);
  };

  const handleAddToQueue = () => {
    TrueSheet.dismiss(name);
    sendHaptic("light");
    setTimeout(async () => {
      const newTrack = await getTrackFromSong(editSong, theme);
      if (newTrack) {
        await addToQueue(newTrack);
      }
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
      const newResults = await removeSongs(results, selectedSongs);
      if (newResults.length <= 0) {
        setExportDisabled(true);
        router.replace("/(tabs)");
      }
      setResults(newResults);
    }
    // remove from library
    else if (editSong.pageType === PageType.LIBRARY) {
      await removeFromAllPlaylists(editSong.id);
      await deleteFromLibrary(editSong.id);
      // remove from queue and next up if applicable
      const queue = await TrackPlayer.getQueue();
      const indiciesToRemove = queue
        .map((track: Track, index: number) =>
          track.id === editSong.id ? index : -1,
        )
        .filter((index) => index !== -1);
      await TrackPlayer.remove(indiciesToRemove);
      setNumModified(numModified + 1);
    }
    // remove from import
    else if (editSong.pageType === PageType.IMPORT) {
      const ids = selectedSongs.length > 0 ? selectedSongs : [editSong.id];
      const newResults = await removeSongs(results, ids);
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
      await removeFromPlaylist(editSong.sourceId, editSong.id);
    } catch (error) {
      console.log("error removing from playlist: ", error);
    }
  };

  const handleToggleinLiked = async () => {
    posthog.capture("toggle_in_liked");
    TrueSheet.dismiss(name);
    try {
      if (inLiked) {
        await removeFromPlaylist(2, editSong.id);
        setinLiked(false);
      } else {
        await addToPlaylist(2, editSong.id);
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
