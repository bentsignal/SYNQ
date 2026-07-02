import { useEditImportSongController } from "../hooks/use-edit-import-song-controller";
import type { ImportSongDraft } from "../types/import-session";
import { EditImportSongFormView } from "./EditImportSongFormView";

type EditImportSongConnectedFormProps = {
  song: ImportSongDraft;
  updateImportSong: (song: ImportSongDraft) => void;
};

export function EditImportSongConnectedForm({
  song,
  updateImportSong,
}: EditImportSongConnectedFormProps) {
  const {
    actionState,
    album,
    artist,
    error,
    save,
    setAlbum,
    setArtist,
    title,
    track,
    updateTitle,
    updateTrack,
  } = useEditImportSongController({ song, updateImportSong });

  return (
    <EditImportSongFormView
      actionState={actionState}
      album={album}
      artist={artist}
      error={error}
      onChangeAlbum={setAlbum}
      onChangeArtist={setArtist}
      onChangeTitle={updateTitle}
      onChangeTrack={updateTrack}
      onSave={save}
      song={song}
      title={title}
      track={track}
    />
  );
}
