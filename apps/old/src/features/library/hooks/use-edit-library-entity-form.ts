import { useCallback, useEffect, useState } from "react";
import { NotificationType } from "@/src/constants/Types";
import { pickCoverImage } from "@/src/features/images/repository/image-repository";
import {
  updateLibraryAlbum,
  updateLibraryArtist,
  updateLibraryPlaylist,
} from "@/src/features/library/repository/library-entity-repository";
import { useNotificationsContext } from "@/src/features/notifications/context/NotificationsProvider";
import { router } from "expo-router";

type EditableEntity = {
  name?: string;
  year?: number;
};

type UpdateEntityArgs = {
  id: number;
  name?: string;
  year?: number | null;
  image?: string;
};

type EditEntityArgs = {
  entity?: EditableEntity | null;
  errorMessage: string;
  id: number;
  onUpdate: (args: UpdateEntityArgs) => Promise<unknown>;
};

const getChangedYear = (
  nextYear: number | undefined,
  originalYear: number | undefined,
) => {
  return nextYear === originalYear ? undefined : nextYear ?? null;
};

const useEditLibraryEntityForm = ({
  entity,
  errorMessage,
  id,
  onUpdate,
}: EditEntityArgs) => {
  const { addNotification } = useNotificationsContext();
  const [image, setImage] = useState<string | undefined>();
  const [name, setName] = useState<string | undefined>();
  const [year, setYear] = useState<number | undefined>();
  const [originalName, setOriginalName] = useState<string | undefined>();
  const [originalYear, setOriginalYear] = useState<number | undefined>();

  const notifyError = useCallback(
    (error: unknown) => {
      const trace = error instanceof Error ? error.message : String(error);
      addNotification(
        NotificationType.ERROR,
        "Error",
        trace,
        errorMessage,
        trace,
        () => {},
      );
    },
    [addNotification, errorMessage],
  );

  const getUpdatePayload = useCallback(
    ({
      nextImage = image,
      nextName = name,
      nextYear = year,
    }: {
      nextImage?: string;
      nextName?: string;
      nextYear?: number;
    } = {}) => ({
      id,
      image: nextImage,
      name: nextName === originalName ? undefined : nextName,
      year: getChangedYear(nextYear, originalYear),
    }),
    [id, image, name, originalName, originalYear, year],
  );

  const validateName = useCallback(
    async (text: string) => {
      try {
        if (text === "") {
          throw new Error("Name is required");
        }

        setName(text);
        await onUpdate(getUpdatePayload({ nextName: text }));
      } catch (error) {
        notifyError(error);
      }
    },
    [getUpdatePayload, notifyError, onUpdate],
  );

  const setYearFromText = useCallback((text: string) => {
    setYear(text ? parseInt(text) : undefined);
  }, []);

  const validateYear = useCallback(
    async (text: string) => {
      try {
        const yearNum = text ? parseInt(text, 10) : undefined;
        if (Number.isNaN(yearNum)) {
          throw new Error("Year must be a number");
        }

        setYear(yearNum);
        await onUpdate(getUpdatePayload({ nextYear: yearNum }));
      } catch (error) {
        notifyError(error);
      }
    },
    [getUpdatePayload, notifyError, onUpdate],
  );

  const handleUpdateImage = useCallback(async () => {
    const cover = await pickCoverImage();
    if (!cover) {
      return;
    }

    try {
      setImage(cover);
      await onUpdate(getUpdatePayload({ nextImage: cover }));
    } catch (error) {
      notifyError(error);
    }
  }, [getUpdatePayload, notifyError, onUpdate]);

  const handleClose = useCallback(() => {
    router.back();
  }, []);

  const handleAddAlbumArtists = useCallback(() => {
    router.push("/artist/add?sourceType=album");
  }, []);

  useEffect(() => {
    setName(entity?.name);
    setYear(entity?.year);
    setOriginalName(entity?.name);
    setOriginalYear(entity?.year);
  }, [entity]);

  return {
    handleAddAlbumArtists,
    handleClose,
    handleUpdateImage,
    image,
    name,
    setName,
    setYearFromText,
    validateName,
    validateYear,
    year,
  };
};

export const useEditPlaylistForm = ({
  id,
  playlist,
}: {
  id: number;
  playlist?: EditableEntity | null;
}) =>
  useEditLibraryEntityForm({
    entity: playlist,
    errorMessage: "Unable to update playlist",
    id,
    onUpdate: updateLibraryPlaylist,
  });

export const useEditArtistForm = ({
  artist,
  id,
}: {
  artist?: EditableEntity | null;
  id: number;
}) =>
  useEditLibraryEntityForm({
    entity: artist,
    errorMessage: "Unable to update artist",
    id,
    onUpdate: updateLibraryArtist,
  });

export const useEditAlbumForm = ({
  album,
  id,
}: {
  album?: EditableEntity | null;
  id: number;
}) =>
  useEditLibraryEntityForm({
    entity: album,
    errorMessage: "Unable to update album",
    id,
    onUpdate: updateLibraryAlbum,
  });
