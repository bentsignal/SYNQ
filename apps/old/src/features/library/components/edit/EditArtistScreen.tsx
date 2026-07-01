import { CoverType } from "@/src/constants/Types";
import EditLibraryEntityScreen from "@/src/features/library/components/edit/EditLibraryEntityScreen";
import { useArtistInfoQuery } from "@/src/features/library/hooks/use-artist-info-query";
import { useEditArtistForm } from "@/src/features/library/hooks/use-edit-library-entity-form";

type EditArtistScreenProps = {
  id: number;
};

const EditArtistScreen = ({ id }: EditArtistScreenProps) => {
  const { artist } = useArtistInfoQuery(id);
  const {
    handleClose,
    handleUpdateImage,
    image,
    name,
    setName,
    validateName,
  } = useEditArtistForm({ artist, id });

  return (
    <EditLibraryEntityScreen
      coverId={id}
      coverImage={image ?? artist?.fullImage}
      coverLabel="Artist Image"
      coverType={CoverType.ARTIST}
      handleClose={handleClose}
      handleUpdateImage={handleUpdateImage}
      name={name}
      namePlaceholder="Enter artist name..."
      setName={setName}
      title="Edit Artist"
      validateName={validateName}
    />
  );
};

export default EditArtistScreen;
