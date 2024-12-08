import { View, Text, StyleSheet, ScrollView, TextInput } from "react-native";
import { memo } from "react";
import Bar from "@/components/modals/Bar";
import { Colors } from "@/constants/Colors";
import { Styles } from "@/constants/Styles";
import { useEffect, useState } from "react";
import { getPlaylistInfo, updatePlaylist } from "@/lib/PlaylistManager";
import { router } from "expo-router";
import CustomButton from "@/components/CustomButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeContext } from "@/context/ThemeProvider";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { CoverType, NotificationType, PlaylistType } from "@/constants/Types";
import { EditCover } from "@/components/song/Cover";
import { newCover } from "@/lib/SongManager";
import { useGlobalContext } from "@/context/GlobalProvider";
import * as Haptics from 'expo-haptics';
import Notifications from "@/components/notifications";

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

  const nameInputValidation = () => {
    if (name === '') {
      throw new Error('Name is required');
    }
  }

  const handleUpdateImage = async () => {
    const cover = await newCover();
    if (cover) {
      setImage(cover);
    }
  }

  const handleSave = async () => {
    try {
      nameInputValidation();
      await updatePlaylist(parseInt(id), name === originalName ? null : name, image);
      if (haptic) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setTimeout(() => {  
        router.back();
      }, 100);
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

  useEffect(() => {
    refreshInfo();
  }, [id]);

  return (
    <View style={Local.wrapper}>
      <Bar />
      <Text style={Local.header}>Edit Playlist</Text>
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
          value={name}
          onChangeText={text => setName(text)}
        />
      </KeyboardAwareScrollView>
      <Notifications customStyles={Local.notifications} />
      <View style={[Local.bottomButtonsWrapper, { paddingBottom: insets.bottom }]}>
        <CustomButton title="Close" handlePress={() => router.back()} />
        <CustomButton 
          title="Save" 
          handlePress={handleSave} 
          background={theme}
        />
      </View>
    </View>
  )
}

const Local = StyleSheet.create({
  wrapper: {
    ...Styles.body,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: Colors.popup,
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