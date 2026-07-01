import { CoverType } from "@/src/constants/Types";
import CreateLibraryEntityScreen from "@/src/features/library/components/create/CreateLibraryEntityScreen";
import { useCreatePlaylistForm } from "@/src/features/library/hooks/use-create-library-entity-form";

const CreatePlaylist = () => {
  const {
    handleCancel,
    handleCreate,
    handleUpdateImage,
    image,
    name,
    setName,
  } = useCreatePlaylistForm();

  return (
    <CreateLibraryEntityScreen
      coverLabel="Cover Image"
      coverType={CoverType.PLAYLIST}
      handleCancel={handleCancel}
      handleCreate={handleCreate}
      handleUpdateImage={handleUpdateImage}
      image={image}
      name={name}
      namePlaceholder="Enter playlist name..."
      setName={setName}
      title="Create Playlist"
    />
  );
};

export default CreatePlaylist;
