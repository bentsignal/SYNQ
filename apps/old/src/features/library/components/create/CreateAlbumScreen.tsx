import { CoverType } from "@/src/constants/Types";
import CreateLibraryEntityScreen from "@/src/features/library/components/create/CreateLibraryEntityScreen";
import { useCreateAlbumForm } from "@/src/features/library/hooks/use-create-library-entity-form";

const CreateAlbumScreen = () => {
  const {
    handleCancel,
    handleCreate,
    handleUpdateImage,
    image,
    name,
    setName,
    setYearFromText,
    year,
  } = useCreateAlbumForm();

  return (
    <CreateLibraryEntityScreen
      coverLabel="Album Image"
      coverType={CoverType.ALBUM}
      handleCancel={handleCancel}
      handleCreate={handleCreate}
      handleUpdateImage={handleUpdateImage}
      image={image}
      name={name}
      namePlaceholder="Enter album name..."
      setName={setName}
      setYearFromText={setYearFromText}
      title="Create Album"
      year={year}
      yearLabel="Year"
      yearPlaceholder="Enter album year..."
    />
  );
};

export default CreateAlbumScreen;
