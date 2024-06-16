import { Text, View, TouchableOpacity, Modal, TextInput } from 'react-native'

import { useState } from 'react'
import PageTitle from '@/components/PageTitle'
import CustomButton from '@/components/CustomButton'
import { Colors } from '@/constants/Colors'
import { useGlobalContext } from '@/context/GlobalProvider';

const EditModal = () => {
  const { showEdit, setShowEdit, editSong } = useGlobalContext();
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
              <Text
                style={{
                  color: 'white',
                  marginTop: 30,
                  marginBottom: 30,
                  fontSize: 16
                }}
                numberOfLines={1}
              >
                {editSong.name}
              </Text>
              <TextInput 
                editable
                numberOfLines={1}

              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 10,
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