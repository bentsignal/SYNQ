import { View, Text, StyleSheet, TextInput } from "react-native"
import { useEffect, useState, memo } from "react"
import { Colors } from "@/constants/Colors"
import { Styles } from "@/constants/Styles"
import Bar from "@/components/modals/Bar"
import CustomButton from "@/components/CustomButton"
import { router } from "expo-router"
import { useGlobalContext } from "@/context/GlobalProvider"
import { PlaylistType } from "@/constants/Types"
import PlaylistDataManager from "@/lib/data/PlaylistDataManager"
import PlaylistList from "@/components/lists/PlaylistList"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"

const MemoTextInput = memo(TextInput);

const CreatePlaylist = () => {

  const {

    theme, numModified,

    addNotification

  } = useGlobalContext();

  const [playlists, setPlaylists] = useState<PlaylistType[]>([]);

  useEffect(() => {
    const db = PlaylistDataManager.getInstance();
    db.getPlaylists().then((results) => {
      setPlaylists(results);
    });
  }, [numModified]);

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
        <Text style={Local.label}>Name</Text>
        <MemoTextInput
          style={Local.textBox}
          placeholder='Playlist name...'
          placeholderTextColor={Colors.altDisabled}
        />
        <View style={Local.buttonContainer}>
          <CustomButton
            title='Cancel'
            handlePress={() => {
              router.back();
            }}
          />
          <CustomButton
            title='Create'
            background={theme}
            handlePress={() => {
              console.log('create');
            }}
          />
        </View>
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
  }
})

export default CreatePlaylist;