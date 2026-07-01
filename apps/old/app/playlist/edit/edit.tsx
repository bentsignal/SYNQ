import { CoverType } from "@/src/constants/Types";
import EditLibraryEntityScreen from "@/src/features/library/components/edit/EditLibraryEntityScreen";
import { useEditPlaylistForm } from "@/src/features/library/hooks/use-edit-library-entity-form";
import { usePlaylistInfoQuery } from "@/src/features/library/hooks/use-playlist-info-query";

const EditPlaylist = ({ id }: { id: number }) => {
  const { playlist } = usePlaylistInfoQuery(id);
  const {
    handleClose,
    handleUpdateImage,
    image,
    name,
    setName,
    validateName,
  } = useEditPlaylistForm({ id, playlist });

  return (
    <EditLibraryEntityScreen
      coverId={id}
      coverImage={image ?? playlist?.fullImage}
      coverLabel="Cover Image"
      coverType={CoverType.PLAYLIST}
      handleClose={handleClose}
      handleUpdateImage={handleUpdateImage}
      name={name}
      namePlaceholder="Enter playlist name..."
      setName={setName}
      title="Edit Playlist"
      validateName={validateName}
    />
  );
};

export default EditPlaylist;
