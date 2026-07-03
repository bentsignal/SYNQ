import { EditImportSongConnectedForm } from "../components/EditImportSongConnectedForm";
import { EditImportSongInvalidState } from "../components/EditImportSongInvalidState";
import { useEditImportSongScreenController } from "../hooks/use-edit-import-song-screen-controller";

export function EditImportSongScreen() {
  const controller = useEditImportSongScreenController();

  if (controller.type === "invalid") {
    return <EditImportSongInvalidState reason={controller.reason} />;
  }

  return (
    <EditImportSongConnectedForm
      song={controller.song}
      updateImportSong={controller.updateImportSong}
    />
  );
}
