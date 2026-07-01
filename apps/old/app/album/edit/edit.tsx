import { memo } from "react";
import EditCover from "@/src/features/cover/components/EditCover";
import CustomButton from "@/src/shared/components/CustomButton";
import ArtistItem from "@/src/features/library/components/lists/artist/ArtistItem";
import Bar from "@/src/shared/components/modals/Bar";
import ModalStyles from "@/src/shared/components/modals/Styles";
import Notifications from "@/src/features/notifications/components";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { CoverType } from "@/src/constants/Types";
import { useAlbumInfoQuery } from "@/src/features/library/hooks/use-album-info-query";
import { useEditAlbumForm } from "@/src/features/library/hooks/use-edit-library-entity-form";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MemoTextInput = memo(TextInput);

const EditAlbum = ({ id }: { id: number }) => {
  const insets = useSafeAreaInsets();
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
    <View style={Local.wrapper}>
      <Bar />
      <Text style={ModalStyles.header}>Edit Album</Text>
      <View style={Styles.divider} />
      <KeyboardAwareScrollView
        style={Local.scrollView}
        contentContainerStyle={Local.scrollViewContent}
      >
        <Text style={Styles.textboxLabel}>Cover Image</Text>
        <View style={Local.coverWrapper}>
          <EditCover
            id={id}
            image={image ?? album?.fullImage}
            type={CoverType.ALBUM}
            handlePress={handleUpdateImage}
            propOnLoad={() => {}}
          />
        </View>
        <Text style={Styles.textboxLabel}>Name</Text>
        <MemoTextInput
          style={Local.textBox}
          autoCorrect={true}
          editable
          numberOfLines={1}
          placeholder={"Enter album name..."}
          placeholderTextColor={Colors.altDisabled}
          value={name ?? ""}
          onChangeText={setName}
          onEndEditing={(evt) => validateName(evt.nativeEvent.text)}
        />
        <Text style={Styles.textboxLabel}>Year</Text>
        <MemoTextInput
          style={Local.textBox}
          autoCorrect={false}
          editable
          numberOfLines={1}
          keyboardType="numeric"
          placeholder={"Enter album year..."}
          placeholderTextColor={Colors.altDisabled}
          value={year?.toString() ?? ""}
          onChangeText={setYearFromText}
          onEndEditing={(evt) => validateYear(evt.nativeEvent.text)}
        />
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
      </KeyboardAwareScrollView>
      <Notifications customStyles={Local.notifications} />
      <View
        style={[Local.bottomButtonsWrapper, { paddingBottom: insets.bottom }]}
      >
        <CustomButton title="Close" handlePress={handleClose} />
      </View>
    </View>
  );
};

const Local = StyleSheet.create({
  wrapper: {
    ...Styles.body,
    backgroundColor: Colors.popup,
    ...ModalStyles.roundedTop,
  },
  scrollView: {
    width: "100%",
    paddingTop: 20,
  },
  scrollViewContent: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    ...Styles.h2,
    color: Colors.text,
    marginBottom: 20,
  },
  coverWrapper: {
    width: "90%",
    marginBottom: 20,
  },
  name: {
    ...Styles.h3,
    color: Colors.infoText,
    width: "90%",
    marginBottom: 20,
  },
  bottomButtonsWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    width: "100%",
  },
  textBox: {
    ...Styles.textbox,
    ...Styles.roundedContainer,
    fontSize: 16,
    marginBottom: 20,
    width: "90%",
  },
  notifications: {
    position: "absolute",
    bottom: 100,
  },
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
