import { CoverType } from "@/src/constants/Types";
import CreateLibraryEntityScreen from "@/src/features/library/components/create/CreateLibraryEntityScreen";
import { useCreateArtistForm } from "@/src/features/library/hooks/use-create-library-entity-form";

const CreateArtist = () => {
  const {
    handleCancel,
    handleCreate,
    handleUpdateImage,
    image,
    name,
    setName,
  } = useCreateArtistForm();

  return (
    <CreateLibraryEntityScreen
      coverLabel="Artist Image"
      coverType={CoverType.ARTIST}
      handleCancel={handleCancel}
      handleCreate={handleCreate}
      handleUpdateImage={handleUpdateImage}
      image={image}
      name={name}
      namePlaceholder="Enter artist name..."
      setName={setName}
      title="Create Artist"
    />
  );
};

export default CreateArtist;
