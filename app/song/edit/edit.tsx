import { View, Text, StyleSheet, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { memo, useState, useEffect, Fragment } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import Bar from "@/src/components/modals/Bar";
import EditCover from "@/src/components/cover/EditCover";
import { CoverType, PageType, ArtistType, AlbumType } from "@/src/constants/Types";
import CustomButton from "@/src/components/CustomButton";
import Notifications from "@/src/components/notifications/Notifications";
import { router } from "expo-router";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import { saveEdits } from "@/lib/controllers/SongController";
import { updateSongsInLibrary } from "@/lib/controllers/LibraryController";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { newCover } from "@/lib/controllers/ImageController";
import * as Haptics from 'expo-haptics';
import ModalStyles from "@/src/components/modals/Styles";
import ArtistItem from "@/src/components/lists/artist/ArtistItem";
import AlbumItem from "@/src/components/lists/album/AlbumItem";
import { getArtistsFromSong } from "@/lib/controllers/ArtistController";
import { getAlbumsFromSong } from "@/lib/controllers/AlbumController";
import artistBus from "@/src/events/artist/Bus";
import albumBus from "@/src/events/album/Bus";
import { ArtistBusEvent, ArtistToggledOnSongEvent } from "@/src/events/artist/Events";
import { AlbumBusEvent, AlbumToggledOnSongEvent } from "@/src/events/album/Events";

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
  const [artists, setArtists] = useState<ArtistType[]>([]);
  const [albums, setAlbums] = useState<AlbumType[]>([]);

  useEffect(() => {
    artistBus.on(ArtistBusEvent.ARTIST_TOGGLED_ON_SONG, handleArtistToggled);
    albumBus.on(AlbumBusEvent.ALBUM_TOGGLED_ON_SONG, handleAlbumToggled);
    return () => {
      artistBus.off(ArtistBusEvent.ARTIST_TOGGLED_ON_SONG, handleArtistToggled);
      albumBus.off(AlbumBusEvent.ALBUM_TOGGLED_ON_SONG, handleAlbumToggled);
    }
  }, []);

  const handleArtistToggled = (event: ArtistToggledOnSongEvent) => {
    if (event.songId === parseInt(id)) {
      loadArtists();
    }
  }

  const handleAlbumToggled = (event: AlbumToggledOnSongEvent) => {
    if (event.songId === parseInt(id)) {
      loadAlbums();
    }
  }

  useEffect(() => {
    if (editSong) {
      loadArtists();
      loadAlbums();
      setTitle(editSong.info?.metadata?.name ?? '');
      setArtist(editSong.info?.metadata?.artist ?? '');
      setAlbum(editSong.info?.metadata?.album ?? '');
      if (editSong.info?.metadata?.artwork) {
        setImage(editSong.info?.metadata?.artwork);
      }
    }
  }, [editSong]);

  const loadArtists = async () => {
    if (editSong.pageType === PageType.IMPORT) {
      setArtists(editSong.importArtists ?? []);
    }
    else {
      const artists = await getArtistsFromSong(parseInt(id));
      setArtists(artists);
    }
  }

  const loadAlbums = async () => {
    if (editSong.pageType === PageType.IMPORT) {
      setAlbums(editSong.importAlbums ?? []);
    }
    else {
      const albums = await getAlbumsFromSong(parseInt(id));
      setAlbums(albums);
    }
  }

  const handleUpdateImage = async () => {
    const cover = await newCover();
    if (cover) {
      setImage(cover);
      await handleSave({newTitle: title, newImage: cover});
    }
  }

  const handleTitleUpdate = async (text: string) => {
    setTitle(text);
    await handleSave({newTitle: text, newImage: image});
  }

  const handleSave = async ({newTitle, newImage}: {newTitle: string, newImage: string}) => {
    try {
      if ([PageType.LIBRARY, PageType.ARTIST, PageType.ALBUM].includes(editSong.pageType)) {
        await updateSongsInLibrary([editSong.id], newTitle, artist, album, newImage);
      }
      else if (editSong.pageType === PageType.IMPORT) {
        const newResults = saveEdits(
          results,
          [editSong.id],
          newTitle,
          artist,
          album,
          newImage
        );
        setResults(newResults);
        setNumModified(numModified + 1);
      }
      else if (selectedSongs.length > 0) {
        const newResults = saveEdits(
          results,
          selectedSongs,
          newTitle,
          artist,
          album,
          newImage
        );
        setResults(newResults);
        setNumModified(numModified + 1);
      }
      setSelectEnabled(false);
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
              onEndEditing={(evt) => handleTitleUpdate(evt.nativeEvent.text)}
            />
          </>
        }
        <View style={ModalStyles.fieldWrapper}>
          <Text style={ModalStyles.fieldLabel}>Artists</Text>
          <View style={Local.artistWrapper}>
            {artists.length === 0 &&
              <Text style={ModalStyles.emptyListFiller}>No artists</Text>
            }
            {artists.length > 0 && artists.map((artist) => {
              return (
                <ArtistItem
                  key={artist.id}
                  artist={artist}
                  allowInteraction={false}
                />
              )
            })}
          </View>
          <CustomButton 
            title={'Manage Artists'}
            handlePress={() => router.push('/artist/add?sourceType=song')}
            buttonWidth={'90%'}
          />
        </View>
        <View style={ModalStyles.fieldWrapper}>
          <Text style={ModalStyles.fieldLabel}>Albums</Text>
          <View style={Local.albumWrapper}>
            {albums.length === 0 &&
              <Text style={ModalStyles.emptyListFiller}>No albums</Text>
            }
            {albums.length > 0 && albums.map((album) => {
              return (
                <AlbumItem
                  key={album.id}
                  album={album}
                  allowInteraction={false}
                />
              )
            })}
          </View>
          <CustomButton 
            title={'Manage Albums'}
            handlePress={() => router.push('/album/add')}
            buttonWidth={'90%'}
          />
        </View>
      </KeyboardAwareScrollView>
      <Notifications customStyles={Local.notifications} />
      <View style={[Local.bottomButtonsWrapper, { paddingBottom: insets.bottom }]}>
        <CustomButton 
          title="Close" 
          handlePress={handleClose} 
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
    paddingBottom: 80,
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
  fieldWrapper: {
    width: '90%',
    marginVertical: 20,
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
    marginTop: 20,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  albumWrapper: {
    width: '100%',
    marginTop: 20,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default EditSong;