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

const WelcomeModal = () => {
  const {showWelcome, setShowWelcome} = useGlobalContext();
  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Modal
        transparent={true}
        visible={showWelcome}
        animationType='slide'
      >
        <View style={Styles.popupBackdrop}>
          <View
            style={[Styles.popupBody, Styles.roundedContainer, {
              padding: 20,
              width: '90%',
            }]}
          >
            <Text
              style={{
                color: 'white',
                fontSize: 36,
                fontWeight: 'bold'
              }}
            >
              Welcome
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default WelcomeModal;