import { useEffect, useState } from "react";
import CustomButton from "@/src/components/CustomButton";
import Notifications from "@/src/components/notifications/Notifications";
import { Colors } from "@/src/constants/Colors";
import CFG from "@/src/constants/Config";
import { Styles } from "@/src/constants/Styles";
import { PageType } from "@/src/constants/Types";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import { useThemeContext } from "@/src/context/ThemeProvider";
import {
  darkenColor,
  getDisabledColor,
} from "@/src/controllers/ColorController";
import { deleteFromLibrary } from "@/src/controllers/LibraryController";
import { removeFromAllPlaylists } from "@/src/controllers/PlaylistController";
import { removeSongs } from "@/src/controllers/SongController";
import { useGlobalProgressContext } from "@/src/features/app-shell/context/GlobalProgressProvider";
import { useSelectionContext } from "@/src/features/selection/context/SelectionProvider";
import { posthog } from "@/src/lib/posthog";
import axios from "axios";
import { router, usePathname } from "expo-router";
import { SquarePen, Trash } from "lucide-react-native";
import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TrackPlayer, { Track } from "react-native-track-player";

export default function ImportControls() {
  const {
    results,
    editSong,
    numModified,
    loading,
    exportDisabled,
    homeState,
    ip,
    transferSize,

    setEditSong,
    setImportState,
    setResults,
    setNumModified,
    setExportDisabled,
    setLoading,
    setTransferSize,
    requestImportFinish,
  } = useGlobalContext();

  const { showGlobalLoading } = useGlobalProgressContext();
  const { selectEnabled, selectedSongs, setSelectEnabled } =
    useSelectionContext();

  const { theme } = useThemeContext();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const [altTitle, setAltTitle] = useState("Cancel");
  const [mainTitle, setMainTitle] = useState("Next");
  const [altDisabled, setAltDisabled] = useState(false);
  const [mainDisabled, setMainDisabled] = useState(false);

  useEffect(() => {
    if (pathname === "/import/files" || pathname === "/import/wifi") {
      setAltTitle("Cancel");
      setMainTitle("Next");
      if (pathname === "/import/files") {
        setAltDisabled(loading);
        setMainDisabled(exportDisabled);
      } else {
        setAltDisabled(transferSize > 0);
        setMainDisabled(exportDisabled);
      }
    } else if (pathname === "/import/export") {
      setAltTitle("Back");
      setMainTitle("Next");
      setAltDisabled(showGlobalLoading);
      setMainDisabled(showGlobalLoading);
    } else if (pathname === "/import/save") {
      setAltTitle("Back");
      setMainTitle("Finish");
      setAltDisabled(exportDisabled);
      setMainDisabled(exportDisabled);
    } else if (pathname === "/import/success") {
      setAltDisabled(true);
      setMainDisabled(true);
    }
  }, [pathname, loading, exportDisabled, showGlobalLoading, transferSize]);

  const Local = StyleSheet.create({
    container: {
      position: "absolute",
      bottom: insets.bottom,
      width: "100%",
      justifyContent: "flex-end",
      alignItems: "center",
    },
    batchButtonContainer: {
      display: selectEnabled && selectedSongs.length > 0 ? "flex" : "none",
      flexDirection: "row",
      gap: 10,
    },
    batchButtonWrapper: {
      backgroundColor: Colors.song,
      padding: 15,
    },
    batchButtonIcon: {
      width: 20,
      height: 20,
      tintColor: Colors.text,
    },
    mainButtonContainer: {
      display: selectEnabled ? "none" : "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
      // padding: 5,
      width: "90%",
    },
    dropdownContainer: {
      width: "90%",
      marginBottom: 10,
    },
  });

  const resetResults = async () => {
    try {
      await axios.get(`http://${ip}${CFG.PORT}/reset`);
    } catch (error) {
      console.log("error resetting results: ", error);
    }
  };

  const altHandle = () => {
    if (pathname === "/import/files" || pathname === "/import/wifi") {
      router.back();
      posthog.capture("import_cancel");
      setTimeout(() => {
        setLoading(false);
        setTransferSize(0);
        setResults([]);
        setExportDisabled(true);
        if (pathname === "/import/wifi") {
          resetResults();
        }
      }, 10);
    } else if (pathname === "/import/export") {
      router.back();
      setLoading(false);
    } else if (pathname === "/import/save") {
      router.back();
    }
  };

  const mainHandle = () => {
    if (pathname === "/import/files" || pathname === "/import/wifi") {
      setImportState(homeState);
      router.push("/import/export");
    } else if (pathname === "/import/export") {
      router.push("/import/save");
    } else if (pathname === "/import/save") {
      requestImportFinish();
      posthog.capture("import_finish", {
        numberOfSongs: results.length,
      });
    }
  };

  const handleEdit = () => {
    setEditSong({});
    router.push(`/song/edit/${editSong.id}`);
  };

  const executeDelete = async () => {
    try {
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
        deleteFromLibrary(editSong.id);
        removeFromAllPlaylists(editSong.id);
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
    } catch (error) {
      console.log("error deleting song: ", error);
    }
    setSelectEnabled(false);
  };

  const handleDelete = () => {
    Alert.alert(
      `${selectedSongs.length > 1 ? "Delete songs" : "Delete song"}`,
      `Are you sure you want to delete ${selectedSongs.length > 1 ? "these songs" : "this song"}?`,
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
  };

  return (
    <View style={Local.container}>
      <Notifications />
      <View style={Local.batchButtonContainer}>
        <TouchableOpacity
          style={[
            Styles.roundedContainer,
            Styles.backgroundBlendShadow,
            Local.batchButtonWrapper,
          ]}
          onPress={handleEdit}
        >
          <SquarePen
            size={20}
            color={Colors.text}
            style={Local.batchButtonIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            Styles.roundedContainer,
            Styles.backgroundBlendShadow,
            Local.batchButtonWrapper,
          ]}
          onPress={handleDelete}
        >
          <Trash size={20} color={Colors.text} style={Local.batchButtonIcon} />
        </TouchableOpacity>
      </View>
      <View
        style={[
          Local.mainButtonContainer,
          {
            display: ["/import/success", "/import/failure"].includes(pathname)
              ? "none"
              : "flex",
          },
        ]}
      >
        <CustomButton
          title={altTitle}
          background={Colors.altButton}
          handlePress={altHandle}
          disabled={altDisabled}
          disabledColor={Colors.altDisabled}
          customStyles={{ flex: 1 }}
        />
        <CustomButton
          title={mainTitle}
          background={theme}
          handlePress={mainHandle}
          disabled={mainDisabled}
          disabledColor={getDisabledColor(theme)}
          customStyles={{ flex: 1 }}
        />
      </View>
    </View>
  );
}
