import { View, Text, StyleSheet, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { memo, useState, useEffect } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Colors } from "@/constants/Colors";
import { Styles } from "@/constants/Styles";
import Bar from "@/components/modals/Bar";
import { EditCover } from "@/components/song/Cover";
import { CoverType } from "@/constants/Types";
import CustomButton from "@/components/CustomButton";
import Notifications from "@/components/notifications/Notifications";
import { router } from "expo-router";
import { useGlobalContext } from "@/context/GlobalProvider";
import { useThemeContext } from "@/context/ThemeProvider";

const MemoTextInput = memo(TextInput);

const EditSong = ({id}: {id: string}) => {

  const insets = useSafeAreaInsets();
  const { haptic, editSong } = useGlobalContext();
  const { theme } = useThemeContext();

  const [name, setName] = useState('');
  const [image, setImage] = useState('');

  const handleUpdateImage = async () => {
    // await updateSongsInLibrary([id], title, artist, album, cover);
  }

  const handleSave = async () => {
    // await updateSongsInLibrary([id], title, artist, album, cover);
  }

  useEffect(() => {
    if (editSong) {
      setName(editSong.info?.metadata?.name);
      if (editSong.info?.metadata?.artwork) {
        setImage(editSong.info?.metadata?.artwork);
      }
    }
  }, [editSong]);

  return (
    <View style={Local.wrapper}>
      <Bar />
      <Text style={Local.header}>Edit Song</Text>
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
            type={CoverType.SONG}
            handlePress={() => handleUpdateImage()}
            propOnLoad={() => {}}
          />
        </View>
        <Text style={Local.name}>{editSong.name ?? ''}</Text>
        <Text style={Styles.textboxLabel}>Name</Text>
        <MemoTextInput
          style={Local.textBox}
          autoCorrect={true}
          editable
          numberOfLines={1}
          placeholder={'Enter song name...'}
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
  );
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
    ...Styles.h5,
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
});

export default EditSong;