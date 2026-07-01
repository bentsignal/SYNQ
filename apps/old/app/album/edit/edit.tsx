import CustomButton from "@/src/shared/components/CustomButton";
import ArtistItem from "@/src/features/library/components/lists/artist/ArtistItem";
import ModalStyles from "@/src/shared/components/modals/Styles";
import { CoverType } from "@/src/constants/Types";
import EditLibraryEntityScreen from "@/src/features/library/components/edit/EditLibraryEntityScreen";
import { useAlbumInfoQuery } from "@/src/features/library/hooks/use-album-info-query";
import { useEditAlbumForm } from "@/src/features/library/hooks/use-edit-library-entity-form";
import { StyleSheet, Text, View } from "react-native";

const EditAlbum = ({ id }: { id: number }) => {
  const { album, artists } = useAlbumInfoQuery(id);
  const {
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
  } = useEditAlbumForm({ album, id });

  return (
    <EditLibraryEntityScreen
      coverId={id}
      coverImage={image ?? album?.fullImage}
      coverLabel="Cover Image"
      coverType={CoverType.ALBUM}
      handleClose={handleClose}
      handleUpdateImage={handleUpdateImage}
      name={name}
      namePlaceholder="Enter album name..."
      setName={setName}
      setYearFromText={setYearFromText}
      title="Edit Album"
      validateName={validateName}
      validateYear={validateYear}
      year={year}
      yearLabel="Year"
      yearPlaceholder="Enter album year..."
    >
      <View style={[ModalStyles.fieldWrapper, { paddingBottom: 20 }]}>
        <Text style={ModalStyles.fieldLabel}>Artists</Text>
        <View style={Local.artistWrapper}>
          {artists.length === 0 && (
            <Text style={ModalStyles.emptyListFiller}>No artists</Text>
          )}
          {artists.length > 0 &&
            artists.map((artist) => {
              return (
                <ArtistItem
                  key={artist.id}
                  artist={artist}
                  allowInteraction={false}
                />
              );
            })}
        </View>
        <CustomButton
          title={"Add Artists"}
          handlePress={handleAddAlbumArtists}
          buttonWidth={"90%"}
        />
      </View>
    </EditLibraryEntityScreen>
  );
};

const Local = StyleSheet.create({
  artistWrapper: {
    width: "100%",
    marginTop: 20,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
  },
});

export default EditAlbum;
