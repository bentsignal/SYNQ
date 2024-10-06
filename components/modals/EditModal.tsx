import { Text, View, Modal, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useState, useEffect } from 'react';
import CustomButton from '@/components/CustomButton';
import Loading from '@/components/Loading';
import { newCover, saveEdits } from '@/lib/SongManager';
import { EditCover } from '@/components/song/Cover';
import { Colors } from '@/constants/Colors';
import { Styles } from '@/constants/Styles';
import { useGlobalContext } from '@/context/GlobalProvider';
import { maybe } from '@/lib/Util';

const EditModal = () => {

  const {

    results, showEdit, editSong,
    selectedSongs, theme, 

    setResults, setShowEdit, setSelectEnabled,
    setShowOverlay, 

  } = useGlobalContext();

  const [title, setTitle] = useState(maybe(editSong.info?.metadata?.name));
  const [artist, setArtist] = useState(maybe(editSong.info?.metadata?.artist));
  const [album, setAlbum] = useState(maybe(editSong.info?.metadata?.album));
  const [cover, setCover] = useState(maybe(editSong.info?.metadata?.artwork));
  const [single, setSingle] = useState(false);
  const [loading, setLoading] = useState(false);

  const Local = StyleSheet.create({
    container: {
      width: '90%',
      maxWidth: 400,
      marginVertical: 100,
      alignSelf: 'center'
    },
    textColor: {
      color: Colors.text
    },
    contentWrapper: {
      width: '100%',
      padding: 20
    },
    contentContainer: {
      width: '100%',
    },
    coverContainer: {
      marginTop: 20,
      marginBottom: 20,
      alignSelf: 'flex-start'
    },
    fileName: {
      marginTop: 10,
    },
    artistContainer: {
      flexDirection: 'row',
      marginBottom: 15,
      maxHeight: 50,
    },
    artistInput: {
      marginBottom: 0,
      flex: 1,
    },
    addButton: {
      width: 50,
      marginBottom: 15,
      marginLeft: 10,
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: Colors.altButton,
    },
    addButtonLine: {
      backgroundColor: 'black',
      borderRadius: 2,
      position: 'absolute',
    },
    albumSingleContainer: {
      flexDirection: 'row',
      width: '100%',
      height: 50,
      maxHeight: 50,
      marginBottom: 15,
    },
    albumSingleButton: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    singleButton: {
      backgroundColor: single ? theme : Colors.altButton,
      borderTopLeftRadius: 15,
      borderBottomLeftRadius: 15,
    },
    albumButton: {
      backgroundColor: single ? Colors.altButton : theme,
      borderTopRightRadius: 15,
      borderBottomRightRadius: 15,
    },
    controlButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
      marginTop: 10,
      marginBottom: 5
    },
    loadingWrapper: {
      position: 'absolute',
      display: loading ? 'flex' : 'none',
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.6)'
    }
  });

  useEffect(() => {
    if (showEdit) {
      setTitle(maybe(editSong.info?.metadata?.name));
      setArtist(maybe(editSong.info?.metadata?.artist));
      setAlbum(maybe(editSong.info?.metadata?.album));
      setCover(maybe(editSong.info?.metadata?.artwork));
    }
  }, [showEdit]);

  return (
    <Modal
      transparent={true}
      visible={showEdit}
      animationType='slide'
    >
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={[Styles.popupBackdrop, { minHeight: '100%' }]}>
          <View style={[Styles.popupBody, Styles.roundedContainer, Local.container]}>
            <View style={Local.contentWrapper}>
              <View style={Local.contentContainer}>
                <Text style={[Local.textColor, Styles.h1]}>
                  {selectedSongs.length > 0 ? 'Edit Songs' : 'Edit Song'}
                </Text>
                <View style={Local.coverContainer}>
                  <EditCover 
                    image={cover}
                    handlePress={async () => {
                      setLoading(true);
                      const cover = await newCover();
                      if (cover) {
                        setCover(cover)
                      }
                      setLoading(false);
                    }}
                  />
                  { selectedSongs.length === 0 
                    ? <Text
                        style={[Styles.h5, Local.fileName, Local.textColor]}
                        numberOfLines={1}
                      >
                        {maybe(editSong.name)}
                      </Text>
                    : <></>
                  }
                </View>
                { selectedSongs.length == 0 
                  ? <>
                      <Text style={Styles.textboxLabel}>
                        Title
                      </Text>
                      <TextInput 
                        style={[Styles.textbox, Styles.roundedContainer]}
                        autoCorrect={false}
                        editable
                        numberOfLines={1}
                        value={title}
                        onChangeText={text => setTitle(text)}
                        placeholder={'Enter song title...'}
                        placeholderTextColor={Colors.altDisabled}
                      />
                    </>
                  : <></>
                }
                <Text
                  style={Styles.textboxLabel}
                >
                  Artists
                </Text>
                <View style={Local.artistContainer}>
                  <TextInput
                    style={[Styles.textbox, Styles.roundedContainer, Local.artistInput]}
                    autoCorrect={false}
                    editable
                    numberOfLines={1}
                    value={artist}
                    onChangeText={text => setArtist(text)}
                    placeholder={'Add artist...'}
                    placeholderTextColor={Colors.altDisabled}
                  />
                  <TouchableOpacity 
                    style={[Styles.roundedContainer, Local.addButton]}
                    activeOpacity={0.6}
                  >
                    <View style={[Local.addButtonLine, { width: 15, height: 3.5 }]} />
                    <View style={[Local.addButtonLine, { width: 3.5, height: 15 }]} />
                  </TouchableOpacity>
                </View>
                {
                  selectedSongs.length > 0 || !single ?
                  <>
                  <Text
                      style={Styles.textboxLabel}
                    >
                      Album
                    </Text>
                    <TextInput
                      style={[Styles.textbox, Styles.roundedContainer]}
                      autoCorrect={false}
                      editable
                      numberOfLines={1}
                      value={album}
                      onChangeText={text => setAlbum(text)}
                      placeholder={'Enter album name...'}
                      placeholderTextColor={Colors.altDisabled}
                    />
                  </>
                  :
                  <></>
                }
                { selectedSongs.length === 0 ?
                  <>
                    <View style={[Styles.roundedContainer, Local.albumSingleContainer]}>
                      <TouchableOpacity
                        style={[Local.albumSingleButton, Local.singleButton]}
                        activeOpacity={0.9}
                        onPress={() => {
                          setSingle(true);
                        }}
                      >
                        <Text style={Styles.h5}>
                          Single
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[Local.albumSingleButton, Local.albumButton]}
                        activeOpacity={0.9}
                        onPress={() => {
                          setSingle(false);
                        }}
                      >
                        <Text style={Styles.h5}>
                          Album
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                  :
                  <></>
                }
                
              </View>
              <View style={Local.controlButtonContainer}>
                <CustomButton 
                  title='Cancel'
                  background={Colors.altButton}
                  handlePress={() => {
                    setShowOverlay(false);
                    setShowEdit(false);
                  }}
                />
                <CustomButton 
                  title='Save'
                  background={theme}
                  handlePress={() => {
                    setLoading(true);
                    setTimeout(() => {
                      const ids = selectedSongs.length > 0 ? selectedSongs : [editSong.id];
                      const newResults = saveEdits(
                        results,
                        ids,
                        title,
                        artist,
                        album,
                        cover
                      );
                      setResults(newResults);
                      setLoading(false);
                      setShowOverlay(false);
                      setShowEdit(false);
                      setSelectEnabled(false);
                    }, 1000)
                  }}
                />
              </View>
            </View>
            <View style={Local.loadingWrapper}>
              <Loading height={100} width={200}/>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </Modal>
  );

}

export default EditModal;