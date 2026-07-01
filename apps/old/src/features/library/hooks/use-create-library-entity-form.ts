import { useCallback, useState } from "react";
import { NotificationType } from "@/src/constants/Types";
import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import { pickCoverImage } from "@/src/features/images/repository/image-repository";
import {
  createLibraryAlbum,
  createLibraryArtist,
  createLibraryPlaylist,
} from "@/src/features/library/repository/library-entity-repository";
import { useNotificationsContext } from "@/src/features/notifications/context/NotificationsProvider";
import { router } from "expo-router";

type CreateEntityArgs = {
  errorMessage: string;
  onCreate: (name: string, image?: string, year?: number) => Promise<unknown>;
};

const navigateBackAfterCreate = () => {
  setTimeout(() => {
    router.back();
  }, 100);
};

const useCreateLibraryEntityForm = ({
  errorMessage,
  onCreate,
}: CreateEntityArgs) => {
  const { addNotification } = useNotificationsContext();
  const { sendHaptic } = useHaptics();

  const [name, setName] = useState("");
  const [year, setYear] = useState<number | undefined>();
  const [image, setImage] = useState<string | undefined>();

  const handleUpdateImage = useCallback(async () => {
    const cover = await pickCoverImage();
    if (cover) {
      setImage(cover);
    }
  }, []);

  const setYearFromText = useCallback((text: string) => {
    setYear(text ? parseInt(text) : undefined);
  }, []);

  const handleCreate = useCallback(async () => {
    try {
      await onCreate(name, image, year);
      sendHaptic("success");
      navigateBackAfterCreate();
    } catch (error) {
      const trace = error instanceof Error ? error.message : String(error);
      addNotification(
        NotificationType.ERROR,
        "Error",
        trace,
        errorMessage,
        trace,
        () => {},
      );
    }
  }, [addNotification, errorMessage, image, name, onCreate, sendHaptic, year]);

  const handleCancel = useCallback(() => {
    router.back();
  }, []);

  return {
    handleCancel,
    handleCreate,
    handleUpdateImage,
    image,
    name,
    setName,
    setYearFromText,
    year,
  };
};

export const useCreatePlaylistForm = () =>
  useCreateLibraryEntityForm({
    errorMessage: "Unable to create playlist",
    onCreate: (name, image) => createLibraryPlaylist(name, image),
  });

export const useCreateAlbumForm = () =>
  useCreateLibraryEntityForm({
    errorMessage: "Unable to create album",
    onCreate: (name, image, year) => createLibraryAlbum(name, year, image),
  });

export const useCreateArtistForm = () =>
  useCreateLibraryEntityForm({
    errorMessage: "Unable to create artist",
    onCreate: (name, image) => createLibraryArtist(name, image),
  });
