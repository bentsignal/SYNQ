import { Text, View, Modal, TextInput } from 'react-native'
import { useEffect } from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useState } from 'react'
import CustomButton from '@/components/CustomButton'
import { EditCover } from '@/components/song/Cover'
import { Colors } from '@/constants/Colors'
import { Styles } from '@/constants/Styles'
import { useGlobalContext } from '@/context/GlobalProvider';

const EditModal = () => {
  
  const { showEdit, setShowEdit, editSong,
    editTitle, setEditTitle,
    editArtist, setEditArtist,
    editAlbum, setEditAlbum, 
    editArtwork, setEditArtwork
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
            backgroundColor: 'rgba(0, 0, 0, 0.8)'
          }}
        >
          <View
            style={{
              backgroundColor: Colors.popup,
              padding: 20,
              justifyContent: 'center',
              alignItems: 'center',
              width: '90%',
              borderRadius: 10
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
                <EditCover image={editArtwork}/>
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
        </View>
      </Modal>
    </View>
  );
}

export default EditModal;