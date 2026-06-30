import { memo, useEffect, useState } from "react";
import EditCover from "@/src/components/cover/EditCover";
import CustomButton from "@/src/components/CustomButton";
import Bar from "@/src/components/modals/Bar";
import ModalStyles from "@/src/components/modals/Styles";
import Notifications from "@/src/components/notifications/Notifications";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { CoverType, NotificationType } from "@/src/constants/Types";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { createArtist } from "@/src/controllers/ArtistController";
import { newCover } from "@/src/controllers/ImageController";
import { createPlaylist } from "@/src/controllers/PlaylistController";
import artistBus from "@/src/events/artist";
import { ArtistBusEvent } from "@/src/events/artist/Events";
import playlistBus from "@/src/events/playlist";
import { PlaylistBusEvent } from "@/src/events/playlist/Events";
import { useHaptics } from "@/src/hooks/use-haptics";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MemoTextInput = memo(TextInput);

const CreateArtist = () => {
  const { addNotification } = useGlobalContext();
  const { sendHaptic } = useHaptics();

  const { theme } = useThemeContext();

  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const handleUpdateImage = async () => {
    const cover = await newCover();
    if (cover) {
      setImage(cover);
    }
  };

  const handleCreate = async () => {
    try {
      await createArtist(name, image);
      sendHaptic("success");
      artistBus.emit(ArtistBusEvent.ARTIST_CREATED);
      setTimeout(() => {
        router.back();
      }, 100);
    } catch (error) {
      const trace = error instanceof Error ? error.message : String(error);
      addNotification(
        NotificationType.ERROR,
        "Error",
        trace,
        "Unable to create artist",
        trace,
        () => {},
      );
    }
  };

  return (
    <View style={Local.wrapper}>
      <Bar />
      <Text style={ModalStyles.header}>Create Artist</Text>
      <View style={Styles.divider} />
      <KeyboardAwareScrollView
        style={Local.scrollView}
        contentContainerStyle={Local.scrollViewContent}
      >
        <Text style={Styles.textboxLabel}>Artist Image</Text>
        <View style={Local.coverWrapper}>
          <EditCover
            image={image}
            type={CoverType.PLAYLIST}
            handlePress={() => handleUpdateImage()}
            propOnLoad={() => {}}
          />
        </View>
        <Text style={Styles.textboxLabel}>Name</Text>
        <MemoTextInput
          style={Local.textBox}
          autoCorrect={true}
          editable
          numberOfLines={1}
          placeholder={"Enter artist name..."}
          placeholderTextColor={Colors.altDisabled}
          defaultValue={name}
          onEndEditing={(evt) => setName(evt.nativeEvent.text)}
        />
      </KeyboardAwareScrollView>
      <Notifications customStyles={Local.notifications} />
      <View style={[Local.buttonContainer, { paddingBottom: insets.bottom }]}>
        <CustomButton title="Cancel" handlePress={() => router.back()} />
        <CustomButton
          title="Create"
          disabled={name === ""}
          background={theme}
          handlePress={handleCreate}
        />
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
  textBox: {
    fontSize: 16,
    marginBottom: 20,
    ...Styles.textbox,
    ...Styles.roundedContainer,
    width: "90%",
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
  coverWrapper: {
    width: "90%",
    marginBottom: 20,
  },
  label: {
    ...Styles.h3,
    color: Colors.text,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    width: "100%",
  },
  notifications: {
    position: "absolute",
    bottom: 100,
  },
});

export default CreateArtist;
