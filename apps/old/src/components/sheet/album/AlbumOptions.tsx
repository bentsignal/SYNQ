import { useEffect, useState } from "react";
import SheetOption from "@/src/components/sheet/SheetOption";
import { PageType } from "@/src/constants/Types";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import { usePremiumContext } from "@/src/context/PremiumProvider";
import { exportSongs } from "@/src/controllers/ImportExportController";
import { useGlobalProgressContext } from "@/src/features/app-shell/context/GlobalProgressProvider";
import { deleteLibraryAlbum } from "@/src/features/library/repository/library-entity-repository";
import { getLibraryAlbumSongs } from "@/src/features/library/repository/library-song-repository";
import { posthog } from "@/src/lib/posthog";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { router } from "expo-router";
import {
  ListChevronsUpDown,
  Share,
  SquarePen,
  Trash,
} from "lucide-react-native";
import { Alert } from "react-native";

const AlbumOptions = ({ name }: { name: string }) => {
  const { editAlbum } = useActionSheetContext();
  const { setShowGlobalLoading } = useGlobalProgressContext();
  const { premium } = usePremiumContext();

  const [pageType, setPageType] = useState<PageType>(PageType.IMPORT);

  useEffect(() => {
    if (editAlbum.pageType) {
      setPageType(editAlbum.pageType);
    }
  }, [editAlbum]);

  const actionDelay = 10;

  const handleEdit = () => {
    TrueSheet.dismiss(name);
    posthog.capture("edit_album");
    setTimeout(() => {
      router.push(`/album/edit/${editAlbum.id}`);
    }, actionDelay);
  };

  const handleExport = async () => {
    try {
      TrueSheet.dismiss(name);
      posthog.capture("export_album");
      setShowGlobalLoading(true);
      const songs = await getLibraryAlbumSongs({ albumId: editAlbum.id });
      await exportSongs(songs);
      setShowGlobalLoading(false);
    } catch (error) {
      console.log("error exporting song: ", error);
      setShowGlobalLoading(false);
    }
  };

  const executeDelete = async () => {
    try {
      posthog.capture("delete_album");
      await deleteLibraryAlbum(editAlbum.id);
    } catch (error) {
      console.log("error deleting album: ", error);
    }
  };

  const handleDelete = () => {
    TrueSheet.dismiss(name);
    setTimeout(() => {
      Alert.alert(
        "Delete Album",
        `Are you sure you want to delete ${editAlbum.name ?? "this album"}? (Deleting an album will not remove its songs)`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              if (pageType === PageType.ALBUM) {
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

  const handleReorder = () => {
    TrueSheet.dismiss(name);
    setTimeout(() => {
      router.push(`/album/reorder`);
    }, actionDelay);
  };

  return (
    <>
      <SheetOption
        icon={SquarePen}
        text={"Edit"}
        show={[PageType.LIBRARY, PageType.ALBUM].includes(pageType)}
        handler={handleEdit}
      />
      <SheetOption
        icon={ListChevronsUpDown}
        text={"Reorder"}
        show={[PageType.LIBRARY, PageType.ALBUM].includes(pageType)}
        handler={handleReorder}
      />
      <SheetOption
        icon={Share}
        text={"Export"}
        show={[PageType.LIBRARY, PageType.ALBUM].includes(pageType) && premium}
        handler={handleExport}
        premiumOnly
      />
      <SheetOption
        icon={Trash}
        text={"Delete"}
        show={[PageType.LIBRARY, PageType.ALBUM].includes(pageType)}
        handler={handleDelete}
      />
    </>
  );
};

export default AlbumOptions;
