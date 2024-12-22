import { View, Text, StyleSheet, TextInput } from "react-native"
import { useEffect, useState, memo } from "react"
import { Colors } from "@/constants/Colors"
import { Styles } from "@/constants/Styles"
import Bar from "@/components/modals/Bar"
import CustomButton from "@/components/CustomButton"
import { router } from "expo-router"
import { useGlobalContext } from "@/context/GlobalProvider"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { CoverType, NotificationType } from "@/constants/Types"
import Notifications from "@/components/notifications/Notifications"
import * as Haptics from 'expo-haptics'
import { useThemeContext } from "@/context/ThemeProvider"
import { createPlaylist } from "@/lib/controllers/PlaylistController"
import EditCover from "@/components/cover/EditCover"
import { newCover } from "@/lib/controllers/SongController"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { PlaylistBusEvent } from "@/station/playlist/Events"
import playlistBus from "@/station/playlist"
import ModalStyles from "@/components/modals/Styles"

const MemoTextInput = memo(TextInput);

const CreatePlaylist = () => {

  const { haptic, addNotification } = useGlobalContext();

  const { theme } = useThemeContext();

  const [name, setName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const handleUpdateImage = async () => {
    const cover = await newCover();
    if (cover) {
      setImage(cover);
    }
  }

  const handleCreate = async () => {
    try {
      if (name === '') {
        throw new Error('Name is required');
      }
      await createPlaylist(name, image);
      if (haptic) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      playlistBus.emit(PlaylistBusEvent.PLAYLIST_CREATED);
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
        'Unable to create playlist',
        trace,
        () => {}
      );
    }
  }

  return (
    <View style={Local.wrapper}>
      <Bar />
      <Text style={Local.header}>Create Playlist</Text>
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
          placeholder={'Enter playlist name...'}
          placeholderTextColor={Colors.altDisabled}
          value={name}
          onChangeText={text => setName(text)}
        />
      </KeyboardAwareScrollView>
      <Notifications customStyles={Local.notifications} />
      <View style={[Local.buttonContainer, {paddingBottom: insets.bottom}]}>
        <CustomButton
          title='Cancel'
          handlePress={() => router.back()}
        />
        <CustomButton
          title='Create'
          disabled={name === ''}
          background={theme}
          handlePress={handleCreate}
        />
      </View>
    </View>
  );
}

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
    width: '90%',
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
  label: {
    ...Styles.h3,
    color: Colors.text,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center', 
    gap: 10,
    width: '100%',
  },
  notifications: {
    position: 'absolute',
    bottom: 100,
  }
})

export default CreatePlaylist;