import { useEffect, useState } from "react";
import SheetOption from "@/src/components/sheet/SheetOption";
import { PageType } from "@/src/constants/Types";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import { usePremiumContext } from "@/src/context/PremiumProvider";
import { useThemeContext } from "@/src/context/ThemeProvider";
import {
  deleteArtist,
  getSongsFromArtist,
} from "@/src/controllers/ArtistController";
import { exportSongs } from "@/src/controllers/ImportExportController";
import artistBus from "@/src/events/artist";
import { ArtistBusEvent } from "@/src/events/artist/Events";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { router } from "expo-router";
import { Alert } from "react-native";
import { posthog } from "@/lib/posthog";

const ArtistOptions = ({ name }: { name: string }) => {
  const { editArtist, setShowGlobalLoading } = useGlobalContext();

  const { premium } = usePremiumContext();
  const { theme } = useThemeContext();

  const [pageType, setPageType] = useState<PageType>(PageType.IMPORT);

  useEffect(() => {
    if (editArtist.pageType) {
      setPageType(editArtist.pageType);
    }
  }, [editArtist]);

  const actionDelay = 10;

  const handleEdit = () => {
    TrueSheet.dismiss(name);
    posthog.capture("edit_artist");
    setTimeout(() => {
      router.push(`/artist/edit/${editArtist.id}`);
    }, actionDelay);
  };

  const handleExport = async () => {
    try {
      TrueSheet.dismiss(name);
      posthog.capture("export_artist");
      setShowGlobalLoading(true);
      let songs = await getSongsFromArtist(editArtist.id);
      await exportSongs(songs);
      setShowGlobalLoading(false);
    } catch (error) {
      console.log("error exporting song: ", error);
      setShowGlobalLoading(false);
    }
  };

  const executeDelete = async () => {
    try {
      posthog.capture("delete_artist");
      await deleteArtist(editArtist.id);
      artistBus.emit(ArtistBusEvent.ARTIST_DELETED);
    } catch (error) {
      console.log("error deleting artist: ", error);
    }
  };

  const handleDelete = () => {
    TrueSheet.dismiss(name);
    setTimeout(() => {
      Alert.alert(
        "Delete Artist",
        `Are you sure you want to delete ${editArtist.name ?? "this artist"}? (Deleting an artist will not remove their songs & albums)`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              if (pageType === PageType.ARTIST) {
                router.back();
                setTimeout(() => {
                  executeDelete();
                }, 300);
              } else {
                executeDelete();
              }
            },
          },
        ],
      );
    }, actionDelay);
  };

  return (
    <>
      <SheetOption
        icon={require("@/src/assets/icons/edit.png")}
        text={"Edit"}
        show={[PageType.LIBRARY, PageType.ARTIST].includes(pageType)}
        handler={handleEdit}
      />
      <SheetOption
        icon={require("@/src/assets/icons/share.png")}
        text={"Export"}
        show={[PageType.LIBRARY, PageType.ARTIST].includes(pageType) && premium}
        handler={handleExport}
        premiumOnly
      />
      <SheetOption
        icon={require("@/src/assets/icons/delete.png")}
        text={"Delete"}
        show={[PageType.LIBRARY, PageType.ARTIST].includes(pageType)}
        handler={handleDelete}
      />
    </>
  );
};

export default ArtistOptions;
