import { memo, useEffect, useState } from "react";
import EditCover from "@/src/features/cover/components/EditCover";
import CustomButton from "@/src/shared/components/CustomButton";
import Bar from "@/src/shared/components/modals/Bar";
import ModalStyles from "@/src/shared/components/modals/Styles";
import Notifications from "@/src/features/notifications/components";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { CoverType, NotificationType } from "@/src/constants/Types";
import { useNotificationsContext } from "@/src/features/notifications/context/NotificationsProvider";
import { pickCoverImage } from "@/src/features/images/repository/image-repository";
import { useArtistInfoQuery } from "@/src/features/library/hooks/use-artist-info-query";
import { updateLibraryArtist } from "@/src/features/library/repository/library-entity-repository";
import { router } from "expo-router";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MemoTextInput = memo(TextInput);

const EditArtist = ({ id }: { id: number }) => {
  const insets = useSafeAreaInsets();
  const { addNotification } = useNotificationsContext();
  const { artist } = useArtistInfoQuery(id);
  const [image, setImage] = useState<string | undefined>();
  const [name, setName] = useState<string | undefined>();
  const [originalName, setOriginalName] = useState<string | undefined>();

  const nameInputValidation = async (text: string) => {
    try {
      if (text === "") {
        throw new Error("Name is required");
      } else {
        setName(text);
        await updateLibraryArtist({
          id,
          name: text === originalName ? undefined : text,
          image,
        });
      }
    } catch (error) {
      const trace = error instanceof Error ? error.message : String(error);
      addNotification(
        NotificationType.ERROR,
        "Error",
        trace,
        "Unable to update playlist",
        trace,
        () => {},
      );
    }
  };

  const handleUpdateImage = async () => {
    const cover = await pickCoverImage();
    if (cover) {
      setImage(cover);
      await updateLibraryArtist({
        id,
        name: name === originalName ? undefined : name,
        image: cover,
      });
    }
  };

  useEffect(() => {
    setName(artist?.name);
    setOriginalName(artist?.name);
  }, [artist]);

  return (
    <View style={Local.wrapper}>
      <Bar />
      <Text style={ModalStyles.header}>Edit Artist</Text>
      <View style={Styles.divider} />
      <KeyboardAwareScrollView
        style={Local.scrollView}
        contentContainerStyle={Local.scrollViewContent}
      >
        <Text style={Styles.textboxLabel}>Artist Image</Text>
        <View style={Local.coverWrapper}>
          <EditCover
            id={id}
            image={image ?? artist?.fullImage}
            type={CoverType.ARTIST}
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
          value={name ?? ""}
          onChangeText={setName}
          onEndEditing={(evt) => nameInputValidation(evt.nativeEvent.text)}
        />
      </KeyboardAwareScrollView>
      <Notifications customStyles={Local.notifications} />
      <View
        style={[Local.bottomButtonsWrapper, { paddingBottom: insets.bottom }]}
      >
        <CustomButton title="Close" handlePress={() => router.back()} />
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
});

export default EditArtist;
