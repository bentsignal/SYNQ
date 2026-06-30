import { memo, useState } from "react";
import EditCover from "@/src/features/cover/components/EditCover";
import CustomButton from "@/src/components/CustomButton";
import Bar from "@/src/components/modals/Bar";
import ModalStyles from "@/src/components/modals/Styles";
import Notifications from "@/src/features/notifications/components/Notifications";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { CoverType, NotificationType } from "@/src/constants/Types";
import { useNotificationsContext } from "@/src/features/notifications/context/NotificationsProvider";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { pickCoverImage } from "@/src/features/images/repository/image-repository";
import { createLibraryPlaylist } from "@/src/features/library/repository/library-entity-repository";
import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import { router } from "expo-router";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MemoTextInput = memo(TextInput);

const CreatePlaylist = () => {
  const { addNotification } = useNotificationsContext();
  const { sendHaptic } = useHaptics();

  const { theme } = useThemeContext();

  const [name, setName] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const insets = useSafeAreaInsets();

  const handleUpdateImage = async () => {
    const cover = await pickCoverImage();
    if (cover) {
      setImage(cover);
    }
  };

  const handleCreate = async () => {
    try {
      await createLibraryPlaylist(name, image);
      sendHaptic("success");
      setTimeout(() => {
        router.back();
      }, 100);
    } catch (error) {
      const trace = error instanceof Error ? error.message : String(error);
      addNotification(
        NotificationType.ERROR,
        "Error",
        trace,
        "Unable to create playlist",
        trace,
        () => {},
      );
    }
  };

  return (
    <View style={Local.wrapper}>
      <Bar />
      <Text style={ModalStyles.header}>Create Playlist</Text>
      <View style={Styles.divider} />
      <KeyboardAwareScrollView
        style={Local.scrollView}
        contentContainerStyle={Local.scrollViewContent}
      >
        <Text style={Styles.textboxLabel}>Cover Image</Text>
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
          placeholder={"Enter playlist name..."}
          placeholderTextColor={Colors.altDisabled}
          value={name}
          onChangeText={setName}
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
    ...Styles.textbox,
    ...Styles.roundedContainer,
    fontSize: 16,
    marginBottom: 20,
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

export default CreatePlaylist;
