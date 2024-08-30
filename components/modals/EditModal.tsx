import { Text, View, Modal, TextInput } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useState, useEffect } from 'react';
import CustomButton from '@/components/CustomButton';
import Loading from '@/components/Loading';
import { newCover, saveEdits, maybeString } from '@/lib/SongManager';
import { EditCover } from '@/components/song/Cover';
import { Colors } from '@/constants/Colors';
import { Styles } from '@/constants/Styles';
import { useGlobalContext } from '@/context/GlobalProvider';

const EditModal = () => {

  const {

    results, showEdit, editSong,
    selectedSongs, theme, 

    setResults, setShowEdit, setSelectEnabled,
    setShowOverlay, 

  } = useGlobalContext();

  const [title, setTitle] = useState(maybeString(editSong.info?.metadata?.name));
  const [artist, setArtist] = useState(maybeString(editSong.info?.metadata?.artist));
  const [album, setAlbum] = useState(maybeString(editSong.info?.metadata?.album));
  const [cover, setCover] = useState(maybeString(editSong.info?.metadata?.artwork));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showEdit) {
      setTitle(maybeString(editSong.info?.metadata?.name));
      setArtist(maybeString(editSong.info?.metadata?.artist));
      setAlbum(maybeString(editSong.info?.metadata?.album));
      setCover(maybeString(editSong.info?.metadata?.artwork));
    }
  }, [showEdit]);

  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Modal
        transparent={true}
        visible={showEdit}
        animationType='slide'
      >
        <View style={Styles.popupBackdrop}>
          <KeyboardAwareScrollView
            style={{
              width: '100%'
            }}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <View
              style={[ Styles.popupBody, Styles.roundedContainer, {
                width: '90%',
              }]}
            >
              <View
                style={{
                  width: '100%',
                  padding: 20
                }}
              >
                <View
                  style={{
                    width: '100%',
                  }}
                >
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 36,
                      fontWeight: 'bold'
                    }}
                  >
                    {selectedSongs.length > 0 ? 'Edit Songs' : 'Edit Song'}
                  </Text>
                  <View
                    style={{
                      marginTop: 20,
                      marginBottom: 20,
                      alignSelf: 'flex-start'
                    }}
                  >
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
                    {/* <Text 
                      style={[Styles.infoText, {
                        marginTop: 5,
                        fontSize: 12
                      }]
                    }>
                      Supports: jpeg/png/heif
                    </Text> */}
                    { selectedSongs.length == 0 ? 
                      <Text
                        style={{
                          color: 'white',
                          fontWeight: 'bold',
                          marginTop: 10,
                          fontSize: 16
                        }}
                        numberOfLines={1}
                      >
                        {maybeString(editSong.name)}
                      </Text>
                      :
                      <></>
                    }
                  </View>
                  { selectedSongs.length == 0 ? 
                    <>
                      <Text
                        style={Styles.textboxLabel}
                      >
                        Song Title
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
                    :
                    <></>
                  }
                  <Text
                    style={Styles.textboxLabel}
                  >
                    Artist
                  </Text>
                  <TextInput
                    style={[Styles.textbox, Styles.roundedContainer]}
                    autoCorrect={false}
                    editable
                    numberOfLines={1}
                    value={artist}
                    onChangeText={text => setArtist(text)}
                    placeholder={'Enter artist(s)...'}
                    placeholderTextColor={Colors.altDisabled}
                  />
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
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 10,
                    marginTop: 10,
                    marginBottom: 5
                  }}
                >
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
              <View
                style={{
                  position: 'absolute',
                  display: loading ? 'flex' : 'none',
                  width: '100%',
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 20,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)'
                }}
              >
                <Loading height={100} width={200}/>
              </View>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </Modal>
    </View>
  );

}

export default EditModal;