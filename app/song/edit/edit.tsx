import { View, Text, StyleSheet, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { memo, useState, useEffect, Fragment } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Colors } from "@/constants/Colors";
import { Styles } from "@/constants/Styles";
import Bar from "@/components/modals/Bar";
import EditCover from "@/components/cover/EditCover";
import { CoverType, PageType } from "@/constants/Types";
import CustomButton from "@/components/CustomButton";
import Notifications from "@/components/notifications/Notifications";
import { router } from "expo-router";
import { useGlobalContext } from "@/context/GlobalProvider";
import { saveEdits, updateSongsInLibrary } from "@/lib/controllers/SongController";
import { useThemeContext } from "@/context/ThemeProvider";
import { newCover } from "@/lib/controllers/SongController";
import * as Haptics from 'expo-haptics';
import ModalStyles from "@/components/modals/Styles";
import ArtistItem from "@/components/lists/artist/ArtistItem";

const MemoTextInput = memo(TextInput);

const EditSong = ({id}: {id: string}) => {

  const insets = useSafeAreaInsets();

  const { haptic, editSong, selectedSongs, results,
    setResults, setSelectedSongs,
    setNumModified, numModified,
    setSelectEnabled, selectEnabled,
   } = useGlobalContext();

  const { theme } = useThemeContext();

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [image, setImage] = useState('');

  const handleUpdateImage = async () => {
    const cover = await newCover();
    if (cover) {
      setImage(cover);
    }
  }

  const handleSave = async () => {
    try {
      if (editSong.pageType === PageType.LIBRARY) {
        await updateSongsInLibrary([editSong.id], title, artist, album, image);
      }
      else if (editSong.pageType === PageType.IMPORT) {
        const newResults = saveEdits(
          results,
          [editSong.id],
          title,
          artist,
          album,
          image
        );
        setResults(newResults);
        setNumModified(numModified + 1);
      }
      else if (selectedSongs.length > 0) {
        const newResults = saveEdits(
          results,
          selectedSongs,
          title,
          artist,
          album,
          image
        );
        setResults(newResults);
        setNumModified(numModified + 1);
      }
      setSelectEnabled(false);
      if (haptic) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setTimeout(() => {
        router.back();
      }, 100);
    }
    catch (error) {
      console.log('error saving edits: ', error);
      router.back();
    }
  }

  const handleClose = () => {
    router.back();
    setSelectedSongs([]);
  }

  useEffect(() => {
    if (editSong) {
      setTitle(editSong.info?.metadata?.name ?? '');
      setArtist(editSong.info?.metadata?.artist ?? '');
      setAlbum(editSong.info?.metadata?.album ?? '');
      if (editSong.info?.metadata?.artwork) {
        setImage(editSong.info?.metadata?.artwork);
      }
    }
  }, [editSong]);

  return (
    <View style={Local.wrapper}>
      <Bar />
      <Text style={ModalStyles.header}>Edit Song</Text>
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
        <Text 
          style={[Local.name, { 
            display: selectedSongs.length === 0 ? 'flex' : 'none',
           }]}
        >
          {editSong.name ?? ''}
        </Text>
        {selectedSongs.length === 0 &&
          <>
            <Text style={Styles.textboxLabel}>Title</Text>
            <MemoTextInput
              style={Local.textBox}
              autoCorrect={true}
              editable
              numberOfLines={1}
              defaultValue={title}
              placeholder={'Enter song name...'}
              placeholderTextColor={Colors.altDisabled}
              onEndEditing={(evt) => setTitle(evt.nativeEvent.text)}
            />
          </>
        }
        <Text style={Styles.textboxLabel}>Artists</Text>
        <CustomButton 
          title={'Manage Artists'}
          handlePress={() => router.push('/artist/add')}
          buttonWidth={'90%'}
          customStyles={{
            marginVertical: 10,
          }}
        />
        <View style={Local.artistWrapper}>
          {[{id: 1, name: 'Artist 1'}, {id: 2, name: 'Artist 2'}, {id: 3, name: 'Artist 3'}].map((artist, index) => (
            <ArtistItem 
              artist={artist}
              key={index}
            />
          ))}
        </View>
        {/* <MemoTextInput
          style={Local.textBox}
          autoCorrect={true}
          editable
          numberOfLines={1}
          placeholder={'Enter song artist...'}
          placeholderTextColor={Colors.altDisabled}
          value={artist}
          onChangeText={text => setArtist(text)}
        /> */}
        <Text style={Styles.textboxLabel}>Album</Text>
        <MemoTextInput
          style={Local.textBox}
          autoCorrect={true}
          editable
          numberOfLines={1}
          placeholder={'Enter song album...'}
          placeholderTextColor={Colors.altDisabled}
          value={album}
          onChangeText={text => setAlbum(text)}
        />
      </KeyboardAwareScrollView>
      <Notifications customStyles={Local.notifications} />
      <View style={[Local.bottomButtonsWrapper, { paddingBottom: insets.bottom }]}>
        <CustomButton 
          title="Close" 
          handlePress={handleClose} 
        />
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
  },
  artistWrapper: {
    width: '100%',
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default EditSong;