import { Text, View, Modal } from 'react-native'
import CheckBox from 'expo-checkbox'
import { useEffect } from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useState } from 'react'
import CustomButton from '@/components/CustomButton'
import { newCover, saveEdits } from '@/lib/SongManager'
import { EditCover } from '@/components/song/Cover'
import { Colors } from '@/constants/Colors'
import { Styles } from '@/constants/Styles'
import { useGlobalContext } from '@/context/GlobalProvider';

const WelcomeModal = () => {
  const {showWelcome, setShowWelcome} = useGlobalContext();
  const [checked, setChecked] = useState(false);
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
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 5,
                padding: 10
              }}
            >
              <CheckBox value={checked} onValueChange={setChecked}/>
              <Text style={Styles.infoText}>Don't show again</Text>
            </View>
            <CustomButton 
              title="Close"
              background={Colors.main}
              handlePress={async () => {
                setShowWelcome(false);
                if (checked) {
                  await AsyncStorage.setItem('showWelcome', 'false')
                }
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default WelcomeModal;