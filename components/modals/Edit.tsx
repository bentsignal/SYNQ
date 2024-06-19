import { Text, View, Modal, TextInput, ActivityIndicator, ScrollView } from 'react-native'
import { useEffect } from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useState } from 'react'
import CustomButton from '@/components/CustomButton'
import { newCover, saveEdits } from '@/lib/SongManager'
import { EditCover } from '@/components/song/Cover'
import { Colors } from '@/constants/Colors'
import { Styles } from '@/constants/Styles'
import { useGlobalContext } from '@/context/GlobalProvider';

const EditModal = () => {
  
  const { 
    fileResults, setFileResults,
    showEdit, setShowEdit, editSong,
    editFilename, setEditFilename,
    editURI, setEditURI,
    editData, setEditData,
    editTitle, setEditTitle,
    editArtist, setEditArtist,
    editAlbum, setEditAlbum, 
    editArtwork, setEditArtwork,
    editLoad, setEditLoad
   } = useGlobalContext();

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
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.95)'
          }}
        >
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
              style={{
                backgroundColor: Colors.popup,
                justifyContent: 'center',
                alignItems: 'center',
                width: '90%',
                borderRadius: 10
              }}
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
                    Edit song
                  </Text>
                  <View
                    style={{
                      marginTop: 20,
                      marginBottom: 20,
                      alignSelf: 'flex-start'
                    }}
                  >
                    <EditCover 
                      image={editArtwork}
                      handlePress={async () => {
                        setEditLoad(true);
                        const cover = await newCover();
                        if (cover != '') {
                          setEditArtwork(cover);
                        }
                        setEditLoad(false);
                      }}
                    />
                    <Text
                      style={{
                        color: 'white',
                        fontWeight: 'bold',
                        marginTop: 10,
                        fontSize: 16
                      }}
                      numberOfLines={1}
                    >
                      {editSong.name}
                    </Text>
                  </View>
                  <Text
                    style={Styles.textboxLabel}
                  >
                    Song Title
                  </Text>
                  <TextInput 
                    style={Styles.textbox}
                    autoCorrect={false}
                    editable
                    numberOfLines={1}
                    value={editTitle}
                    onChangeText={text => setEditTitle(text)}
                    placeholder={'Enter song title...'}
                  />
                  <Text
                    style={Styles.textboxLabel}
                  >
                    Artist
                  </Text>
                  <TextInput
                    style={Styles.textbox}
                    autoCorrect={false}
                    editable
                    numberOfLines={1}
                    value={editArtist}
                    onChangeText={text => setEditArtist(text)}
                    placeholder={'Enter artist(s)...'}
                  />
                  <Text
                    style={Styles.textboxLabel}
                  >
                    Album
                  </Text>
                  <TextInput
                    style={Styles.textbox}
                    autoCorrect={false}
                    editable
                    numberOfLines={1}
                    value={editAlbum}
                    onChangeText={text => setEditAlbum(text)}
                    placeholder={'Enter album name...'}
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
                      setShowEdit(false);
                    }}
                  />
                  <CustomButton 
                    title='Save'
                    background={Colors.green}
                    handlePress={() => {
                      setEditLoad(true);
                      setTimeout(() => {
                        const newResults = saveEdits(
                          fileResults,
                          editURI,
                          editData,
                          editTitle,
                          editArtist,
                          editAlbum,
                          editArtwork
                        )
                        setFileResults(newResults);
                        setEditLoad(false);
                        setShowEdit(false);
                      }, 1000)
                    }}
                  />
                </View>
              </View>
              <View
                style={{
                  position: 'absolute',
                  display: editLoad ? 'flex' : 'none',
                  width: '100%',
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 20,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)'
                }}
              >
                <ActivityIndicator />
              </View>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </Modal>
    </View>
  );
}

export default EditModal;