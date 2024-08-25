import { Text, View, Dimensions, Image, } from "react-native";
import CustomModal from "./CustomModal";
import VerticalScrollView from "../VerticalScrollView";
import CustomButton from "../CustomButton";
import ModalTitle from "./ModalTitle";
import { useGlobalContext } from "@/context/GlobalProvider";
import { Colors } from "@/constants/Colors";
import { Styles } from "@/constants/Styles";
import InfoContainer from "./InfoContainer";

const InfoModal = () => {

  const { 

    showInfoModal, theme, 
    
    setShowInfoModal, setShowOverlay,
  
  } = useGlobalContext();

  const textComponents = Array.from({ length: 20 }, (_, index) => (
    <Text style={{color: 'white'}} key={index}>Text {index + 1}</Text>
  ));

  return (
    <CustomModal
      show={showInfoModal}
      width={'95%'}
    >
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          width: '95%',
          marginTop: 20,
          marginBottom: 20,
        }}
      >
        <ModalTitle title={'Instructions'} />
        <VerticalScrollView
          backgroundColor={Colors.popup}
          maxHeight={Dimensions.get('screen').height * 0.58}
          minHeight={Dimensions.get('screen').height * 0.58}
        >
          <View
            style={{
              width: '95%',
              justifyContent: 'flex-start',
              alignItems: 'center',
              marginTop: 20,
              marginBottom: 50
            }}
          >
            <InfoContainer 
              title={'Spotify Setup'} 
              contentHeight={980}
            >
              <View style={Styles.infoContentContainer}>
                <View style={Styles.infoStepContainer}>
                  <Text style={Styles.infoStepTitle}>
                    1. Enable local files in Spotify
                  </Text>
                  <Text style={Styles.infoStepDescription}>
                    Spotify → Settings → Local Files
                  </Text>
                  <Image 
                    source={require('@/assets/images/local-files-enable.jpg')}
                    style={{width: '100%', height: 200}}
                    resizeMode='contain'
                  />
                </View>
                <View style={Styles.infoStepContainer}>
                  <Text style={Styles.infoStepTitle}>
                    2. Save your music to:
                  </Text>
                  <Text style={Styles.infoStepDescription}>
                    On My iPhone → Spotify
                  </Text>
                  <Image 
                    source={require('@/assets/images/destination-folder.jpg')}
                    style={{ width: '100%', height: 250 }}
                    resizeMode='contain'
                  />
                </View>
                <View style={Styles.infoStepContainer}>
                  <Text style={Styles.infoStepTitle}>
                    3. Listen in Spotify:
                  </Text>
                  <Text style={Styles.infoStepDescription}>
                    Playlists → Local Files
                  </Text>
                  <Image 
                    source={require('@/assets/images/local-files-playlist.jpg')}
                    style={{ width: '100%', height: 250 }}
                    resizeMode='contain'
                  />
                </View>
              </View>
            </InfoContainer>
            <InfoContainer 
              title={'How to Export'}
              contentHeight={900}
            >
              <View style={Styles.infoContentContainer}>
                <View style={Styles.infoStepContainer}>
                  <Text style={[Styles.infoStepTitle, {marginBottom: 20}]}>
                    1. Hit the blue "Export" button
                  </Text>
                  <Image 
                    source={require('@/assets/images/save-instructions-3.jpg')}
                    style={{width: '100%', height: 200, marginBottom: 40}}
                    resizeMode='contain'
                  />
                  <Text style={[Styles.infoStepTitle, {marginBottom: 20}]}>
                    2. Hit "Save to Files" in the popup
                  </Text>
                  <Image 
                    source={require('@/assets/images/save-instructions.jpg')}
                    style={{width: '100%', height: 200, marginBottom: 40}}
                    resizeMode='contain'
                  />
                </View>
                <View>
                  <Text style={Styles.infoStepTitle}>
                    3. Find Spotify folder and hit Save:
                  </Text>
                  <Text style={Styles.infoStepDescription}>
                    On My iPhone → Spotify
                  </Text>
                  <Image 
                    source={require('@/assets/images/save-instructions-2.jpg')}
                    style={{
                      width: '100%', 
                      height: 250,
                      marginBottom: 40
                    }}
                    resizeMode='contain'
                  />
                </View>
              </View>
            </InfoContainer>
          </View>
        </VerticalScrollView>
        <CustomButton 
          title='Close'
          background={theme}
          handlePress={() => {
            setShowOverlay(false);
            setShowInfoModal(false);
          }}
          customStyles={{
            marginTop: 10
          }}
        />
      </View>
    </CustomModal>
  );

}

export default InfoModal;