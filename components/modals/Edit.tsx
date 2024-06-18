import { Text, View, Modal, TextInput, ActivityIndicator } from 'react-native'
import { useEffect } from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useState } from 'react'
import CustomButton from '@/components/CustomButton'
import { newCover } from '@/lib/SongManager'
import { EditCover } from '@/components/song/Cover'
import { Colors } from '@/constants/Colors'
import { Styles } from '@/constants/Styles'
import { useGlobalContext } from '@/context/GlobalProvider';

const EditModal = () => {
  
  const { showEdit, setShowEdit, editSong,
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
        animationType='fade'
      >
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.95)'
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
                    marginBottom: 20
                  }}
                >
                  <EditCover 
                    image={editArtwork}
                    handlePress={async () => {
                      setEditLoad(true);
                      const cover = await newCover();
                      setEditLoad(false);
                      setEditArtwork(cover);
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
                    setShowEdit(false);
                    // TODO: Edit
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
        </View>
      </Modal>
    </View>
  );
}

export default EditModal;