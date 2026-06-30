import { useEffect, useState } from "react";
import SheetOption from "@/src/features/action-sheet/components/SheetOption";
import { PageType } from "@/src/constants/Types";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import { usePremiumContext } from "@/src/features/premium/context/PremiumProvider";
import { exportSongs } from "@/src/features/export/lib/export-songs";
import { useGlobalProgressContext } from "@/src/features/app-shell/context/GlobalProgressProvider";
import { deleteLibraryArtist } from "@/src/features/library/repository/library-entity-repository";
import { getLibraryArtistSongs } from "@/src/features/library/repository/library-song-repository";
import { posthog } from "@/src/lib/posthog";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { router } from "expo-router";
import { Share, SquarePen, Trash } from "lucide-react-native";
import { Alert } from "react-native";

const ArtistOptions = ({ name }: { name: string }) => {
  const { editArtist } = useActionSheetContext();
  const { setShowGlobalLoading } = useGlobalProgressContext();

  const { premium } = usePremiumContext();

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
      const songs = await getLibraryArtistSongs({ artistId: editArtist.id });
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
      await deleteLibraryArtist(editArtist.id);
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
        icon={SquarePen}
        text={"Edit"}
        show={[PageType.LIBRARY, PageType.ARTIST].includes(pageType)}
        handler={handleEdit}
      />
      <SheetOption
        icon={Share}
        text={"Export"}
        show={[PageType.LIBRARY, PageType.ARTIST].includes(pageType) && premium}
        handler={handleExport}
        premiumOnly
      />
      <SheetOption
        icon={Trash}
        text={"Delete"}
        show={[PageType.LIBRARY, PageType.ARTIST].includes(pageType)}
        handler={handleDelete}
      />
    </>
  );
};

export default ArtistOptions;
