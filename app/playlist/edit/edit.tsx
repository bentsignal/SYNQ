import { View, Text, StyleSheet, ScrollView, TextInput } from "react-native";
import { memo } from "react";
import Bar from "@/src/components/modals/Bar";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { useEffect, useState } from "react";
import { getPlaylistInfo, updatePlaylist } from "@/lib/controllers/PlaylistController";
import { router } from "expo-router";
import CustomButton from "@/src/components/CustomButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { CoverType, NotificationType, PlaylistType } from "@/src/constants/Types";
import EditCover from "@/src/components/cover/EditCover";
import { newCover } from "@/lib/controllers/ImageController";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import * as Haptics from 'expo-haptics';
import Notifications from "@/src/components/notifications";
import ModalStyles from "@/src/components/modals/Styles";

const MemoTextInput = memo(TextInput);

const EditPlaylist = ({id}: {id: string}) => {
  
  const insets = useSafeAreaInsets();
  const { theme } = useThemeContext();
  const { addNotification, haptic } = useGlobalContext();
  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [originalName, setOriginalName] = useState<string | null>(null);

  const refreshInfo = async () => {
    try {
      const result = await getPlaylistInfo(parseInt(id));
      setName(result.name);
      setOriginalName(result.name);
    } catch (error) {
      console.error('error getting playlist info:', error);
    }
  }

  const nameInputValidation = async (text: string) => {
    try {
      if (text === '') {
        throw new Error('Name is required');
      }
      else {
        setName(text);
        await updatePlaylist(parseInt(id), text === originalName ? null : text, image);
      }
    }
    catch (error) {
      const trace = error instanceof Error ? error.message : String(error);
      addNotification(
        NotificationType.ERROR,
        'Error',
        trace,
        'Unable to update playlist',
        trace,
        () => {}
      );  
    }
  }

  const handleUpdateImage = async () => {
    const cover = await newCover();
    if (cover) {
      setImage(cover);
      await updatePlaylist(parseInt(id), name === originalName ? null : name, cover);
    }
  }

  useEffect(() => {
    refreshInfo();
  }, [id]);

  return (
    <View style={Local.wrapper}>
      <Bar />
      <Text style={ModalStyles.header}>Edit Playlist</Text>
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
          placeholder={'Enter playlist name...'}
          placeholderTextColor={Colors.altDisabled}
          defaultValue={name}
          onEndEditing={(evt) => nameInputValidation(evt.nativeEvent.text)}
        />
      </KeyboardAwareScrollView>
      <Notifications customStyles={Local.notifications} />
      <View style={[Local.bottomButtonsWrapper, { paddingBottom: insets.bottom }]}>
        <CustomButton title="Close" handlePress={() => router.back()} />
      </View>
    </View>
  )
}

const Local = StyleSheet.create({
  wrapper: {
    ...Styles.body,
    backgroundColor: Colors.popup,
    ...ModalStyles.roundedTop,
  },
  scrollView: {
    width: '100%',
    paddingTop: 20,
  },
  scrollViewContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    ...Styles.h2,
    color: Colors.text,
    marginBottom: 20,
  },
  coverWrapper: {
    width: '90%',
    marginBottom: 20,
  },
  name: {
    ...Styles.h3,
    color: Colors.infoText,
    width: '90%',
    marginBottom: 20,
  },
  bottomButtonsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center', 
    gap: 10,
    width: '100%',
  },
  textBox: {
    fontSize: 16,
    marginBottom: 20,
    ...Styles.textbox,
    ...Styles.roundedContainer,
    width: '90%',
  },
  notifications: {
    position: 'absolute',
    bottom: 100,
  }
})

export default EditPlaylist;