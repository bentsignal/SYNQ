import { memo } from "react";
import EditCover from "@/src/features/cover/components/EditCover";
import CustomButton from "@/src/shared/components/CustomButton";
import Bar from "@/src/shared/components/modals/Bar";
import ModalStyles from "@/src/shared/components/modals/Styles";
import Notifications from "@/src/features/notifications/components/Notifications";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { CoverType } from "@/src/constants/Types";
import { useCreatePlaylistForm } from "@/src/features/library/hooks/use-create-library-entity-form";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MemoTextInput = memo(TextInput);

const CreatePlaylist = () => {
  const { theme } = useThemeContext();
  const {
    handleCancel,
    handleCreate,
    handleUpdateImage,
    image,
    name,
    setName,
  } = useCreatePlaylistForm();
  const insets = useSafeAreaInsets();

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
          placeholder={"Enter playlist name..."}
          placeholderTextColor={Colors.altDisabled}
          value={name}
          onChangeText={setName}
        />
      </KeyboardAwareScrollView>
      <Notifications customStyles={Local.notifications} />
      <View style={[Local.buttonContainer, { paddingBottom: insets.bottom }]}>
        <CustomButton title="Cancel" handlePress={handleCancel} />
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
