import { Text, View, Modal, Image, ScrollView } from 'react-native';
import CheckBox from 'expo-checkbox';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import CustomButton from '@/components/CustomButton';
import { Colors } from '@/constants/Colors';
import { Styles } from '@/constants/Styles';
import { useGlobalContext } from '@/context/GlobalProvider';
import { InstructionsModalProps } from '@/constants/Types';

const InstructionsModal = ({dontShowOption}: InstructionsModalProps) => {

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
              paddingTop: 20,
              paddingBottom: 20,
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
              Instructions
            </Text>
            <View
              style={{
                padding: 15
              }}
            >
              <View style={{
                height: 400,
              }}>
                <ScrollView style={{paddingRight: 20}}>
                  <View style={{paddingBottom: 5}}>
                    <Text
                      style={[Styles.infoText, {fontWeight: 'bold', paddingBottom: 5}]}
                    >
                      1. Enable local files in Spotify
                    </Text>
                    <Text
                      style={[Styles.infoText, {
                        paddingTop: 5
                      }]}
                    >
                      Spotify → Settings → Local Files
                    </Text>
                    <Image 
                      source={require('@/assets/images/local-files-enable.jpg')}
                      style={{width: '100%', height: 200}}
                      resizeMode='contain'
                    />
                  </View>
                  <View>
                    <Text
                      style={[Styles.infoText, {fontWeight: 'bold', paddingBottom: 5}]}
                    >
                      2. Save your music to:
                    </Text>
                    <Text
                      style={[Styles.infoText, {paddingBottom: 10, paddingTop: 5}]}
                    >
                      On My iPhone → Spotify
                    </Text>
                    <Image 
                      source={require('@/assets/images/destination-folder.jpg')}
                      style={{
                        width: '100%', 
                        height: 250,
                        marginBottom: 40
                      }}
                      resizeMode='contain'
                    />
                  </View>
                  <View>
                    <Text
                      style={[Styles.infoText, {fontWeight: 'bold', paddingBottom: 5}]}
                    >
                      3. Listen in Spotify:
                    </Text>
                    <Text
                      style={[Styles.infoText, {paddingBottom: 10, paddingTop: 5}]}
                    >
                      Playlists → Local Files
                    </Text>
                    <Image 
                      source={require('@/assets/images/local-files-playlist.jpg')}
                      style={{
                        width: '100%', 
                        height: 250,
                        marginBottom: 40
                      }}
                      resizeMode='contain'
                    />
                  </View>
                </ScrollView>
                <LinearGradient
                  style={{position:'absolute', bottom:0, width:'100%', height:50}}
                  colors={['rgba(24, 24, 24, 0)', 'rgba(24, 24, 24, 1)']}
                  pointerEvents={'none'}
                />
              </View>
            </View>
            {dontShowOption ? <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 5,
                padding: 10
              }}
            >
              <CheckBox value={checked} onValueChange={setChecked}/>
              <Text style={Styles.infoText}>Don't show automatically</Text>
            </View> : <></>}
            <CustomButton 
              title="Close"
              background={Colors.main}
              handlePress={async () => {
                setShowWelcome(false);
                if (checked) {
                  await AsyncStorage.setItem('showWelcome', 'false');
                }
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );

}

export default InstructionsModal;