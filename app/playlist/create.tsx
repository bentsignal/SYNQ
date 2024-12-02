import { View, Text, StyleSheet, TextInput } from "react-native"
import { useEffect, useState, memo } from "react"
import { Colors } from "@/constants/Colors"
import { Styles } from "@/constants/Styles"
import Bar from "@/components/modals/Bar"
import CustomButton from "@/components/CustomButton"
import { router } from "expo-router"
import { useGlobalContext } from "@/context/GlobalProvider"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { NotificationType } from "@/constants/Types"
import Notifications from "@/components/notifications/Notifications"
import * as Haptics from 'expo-haptics'
import { useThemeContext } from "@/context/ThemeProvider"
import { createPlaylist } from "@/lib/PlaylistManager"

const MemoTextInput = memo(TextInput);

const CreatePlaylist = () => {

  const {

    numModified, haptic,

    addNotification, setNumModified,

  } = useGlobalContext();

  const { theme } = useThemeContext();

  const [name, setName] = useState('');

  const handleCreate = async () => {
    try {
      if (name === '') {
        throw new Error('Name is required');
      }
      await createPlaylist(name);
      if (haptic) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setNumModified(numModified + 1);
      router.back();
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
        style={{ 
          flex: 1,
          width: '100%',
        }}
        contentContainerStyle={Local.inputContainer}
        extraScrollHeight={80}
      >
        <MemoTextInput
          style={Local.textBox}
          placeholder='Playlist name...'
          placeholderTextColor={Colors.altDisabled}
          value={name}
          onChangeText={(text) => setName(text)}
        />
        <View style={Local.buttonContainer}>
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
        <Notifications customStyles={Local.notifications} />
      </KeyboardAwareScrollView>
    </View>
  );
}

const Local = StyleSheet.create({
  wrapper: {
    ...Styles.body,
    backgroundColor: Colors.background,
  },
  textBox: {
    ...Styles.textbox,
    ...Styles.roundedContainer,
    width: '60%',
    marginBottom: 15,
    fontSize: 18,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 200,
  },
  header: {
    ...Styles.h2,
    color: Colors.text,
    marginBottom: 20,
  },
  label: {
    ...Styles.h3,
    color: Colors.text,
    marginBottom: 10,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  notifications: {
    position: 'absolute',
    bottom: 30,
  }
})

export default CreatePlaylist;