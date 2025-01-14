import { View, Text, StyleSheet, ScrollView, TextInput } from "react-native";
import { memo } from "react";
import Bar from "@/components/modals/Bar";
import { Colors } from "@/constants/Colors";
import { Styles } from "@/constants/Styles";
import { useEffect, useState } from "react";
import { getPlaylistInfo, updatePlaylist } from "@/lib/controllers/PlaylistController";
import { router } from "expo-router";
import CustomButton from "@/components/CustomButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeContext } from "@/context/ThemeProvider";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { CoverType, NotificationType, PlaylistType } from "@/constants/Types";
import EditCover from "@/components/cover/EditCover";
import { newCover } from "@/lib/controllers/ImageController";
import { useGlobalContext } from "@/context/GlobalProvider";
import * as Haptics from 'expo-haptics';
import Notifications from "@/components/notifications";
import ModalStyles from "@/components/modals/Styles";
import { getArtistInfo, updateArtist } from "@/lib/controllers/ArtistController";

const MemoTextInput = memo(TextInput);

const EditArtist = ({id}: {id: string}) => {
  
  const insets = useSafeAreaInsets();
  const { theme } = useThemeContext();
  const { addNotification, haptic } = useGlobalContext();
  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [originalName, setOriginalName] = useState<string | null>(null);

  const refreshInfo = async () => {
    try {
      const result = await getArtistInfo(parseInt(id));
      setName(result?.name ?? null);
      setOriginalName(result?.name ?? null);
    } catch (error) {
      console.error('error getting artist info:', error);
    }
  }

  const nameInputValidation = async (text: string) => {
    try {
      if (text === '') {
        throw new Error('Name is required');
      }
      else {
        setName(text);
        await updateArtist(parseInt(id), text === originalName ? null : text, image);
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
      await updateArtist(parseInt(id), name === originalName ? null : name, cover);
    }
  }

  useEffect(() => {
    refreshInfo();
  }, [id]);

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
            image={image}
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
          placeholder={'Enter artist name...'}
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

export default EditArtist;