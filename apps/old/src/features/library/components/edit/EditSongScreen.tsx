import { memo } from "react";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { CoverType } from "@/src/constants/Types";
import EditCover from "@/src/features/cover/components/EditCover";
import EditSongRelationSection from "@/src/features/library/components/edit/EditSongRelationSection";
import AlbumItem from "@/src/features/library/components/lists/album/AlbumItem";
import ArtistItem from "@/src/features/library/components/lists/artist/ArtistItem";
import { useEditSongForm } from "@/src/features/library/hooks/use-edit-song-form";
import Notifications from "@/src/features/notifications/components/Notifications";
import CustomButton from "@/src/shared/components/CustomButton";
import Bar from "@/src/shared/components/modals/Bar";
import ModalStyles from "@/src/shared/components/modals/Styles";
import { getDurationString } from "@/src/lib/util";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MemoTextInput = memo(TextInput);

type EditSongScreenProps = {
  id: number;
};

const EditSongScreen = ({ id }: EditSongScreenProps) => {
  const insets = useSafeAreaInsets();
  const {
    albums,
    artists,
    editSong,
    handleAddAlbums,
    handleAddArtists,
    handleClose,
    handleTitleUpdate,
    handleUpdateImage,
    image,
    selectedSongs,
    title,
  } = useEditSongForm(id);

  return (
    <View style={Local.wrapper}>
      <Bar />
      <Text style={ModalStyles.header}>Edit Song</Text>
      <View style={Styles.divider} />
      <KeyboardAwareScrollView
        style={Local.scrollView}
        contentContainerStyle={Local.scrollViewContent}
      >
        <Text style={Styles.textboxLabel}>Cover Image</Text>
        <View style={Local.coverWrapper}>
          <EditCover
            id={id}
            image={image}
            type={CoverType.SONG}
            handlePress={() => handleUpdateImage()}
            propOnLoad={() => {}}
          />
        </View>
        <View style={Local.fileInfoContainer}>
          <Text
            style={[
              Local.name,
              {
                display: selectedSongs.length === 0 ? "flex" : "none",
              },
            ]}
          >
            {editSong.fileName ?? ""}
          </Text>
          <Text style={Local.duration}>
            {getDurationString(editSong.duration ?? 0, true)}
          </Text>
        </View>
        {selectedSongs.length === 0 && (
          <>
            <Text style={Styles.textboxLabel}>Title</Text>
            <MemoTextInput
              style={Local.textBox}
              autoCorrect={true}
              editable
              numberOfLines={1}
              defaultValue={title}
              placeholder={"Enter song name..."}
              placeholderTextColor={Colors.altDisabled}
              onEndEditing={(evt) => handleTitleUpdate(evt.nativeEvent.text)}
            />
          </>
        )}
        <EditSongRelationSection
          actionTitle={"Add to Albums"}
          emptyLabel={"No albums"}
          hasItems={albums.length > 0}
          onAction={handleAddAlbums}
          title={"Albums"}
        >
          {albums.map((album) => {
            return (
              <AlbumItem
                key={album.id}
                album={album}
                allowInteraction={false}
              />
            );
          })}
        </EditSongRelationSection>
        <EditSongRelationSection
          actionTitle={"Add Artists"}
          emptyLabel={"No artists"}
          hasItems={artists.length > 0}
          onAction={handleAddArtists}
          title={"Artists"}
        >
          {artists.map((artist) => {
            return (
              <ArtistItem
                key={artist.id}
                artist={artist}
                allowInteraction={false}
              />
            );
          })}
        </EditSongRelationSection>
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
    paddingBottom: 80,
  },
  coverWrapper: {
    width: "90%",
    marginBottom: 20,
  },
  fileInfoContainer: {
    width: "90%",
    marginBottom: 20,
    gap: 5,
  },
  name: {
    ...Styles.h5,
    color: Colors.text,
    width: "90%",
  },
  duration: {
    ...Styles.h6,
    color: Colors.infoText,
    width: "90%",
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
});

export default EditSongScreen;
