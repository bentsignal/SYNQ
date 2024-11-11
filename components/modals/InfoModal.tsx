import { Text, View, Dimensions, Image, StyleSheet, } from "react-native";
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

  const Local = StyleSheet.create({
    wrapper: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '95%',
      marginTop: 20,
      marginBottom: 20,
    },
    container: {
      width: '95%',
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 50,
    },
    infoContentContainer: {
      width: '100%',
      marginTop: 20,
    },
    infoStepContainer: {
      width: '100%',
      marginBottom: 20,
    },
    infoStepTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: Colors.text,
      marginBottom: 5,
    },
    infoStepDescription: {
      fontSize: 16,
      color: Colors.infoText,
      marginBottom: 20,
    },
  });

  return (
    <CustomModal
      show={showInfoModal}
      width={'95%'}
    >
      <View style={Local.wrapper}>
        <ModalTitle title={'Instructions'} />
        <VerticalScrollView
          backgroundColor={Colors.popup}
          maxHeight={Dimensions.get('screen').height * 0.58}
          minHeight={Dimensions.get('screen').height * 0.58}
        >
          <View style={Local.container}>
            <InfoContainer 
              title={'Spotify Setup'} 
              contentHeight={980}
            >
              <View style={Local.infoContentContainer}>
                <View style={Local.infoStepContainer}>
                  <Text style={Local.infoStepTitle}>
                    1. Enable local files in Spotify
                  </Text>
                  <Text style={Local.infoStepDescription}>
                    Spotify → Settings → Local Files
                  </Text>
                  <Image 
                    source={require('@/assets/images/local-files-enable.jpg')}
                    style={{width: '100%', height: 200}}
                    resizeMode='contain'
                  />
                </View>
                <View style={Local.infoStepContainer}>
                  <Text style={Local.infoStepTitle}>
                    2. Save your music to:
                  </Text>
                  <Text style={Local.infoStepDescription}>
                    On My iPhone → Spotify
                  </Text>
                  <Image 
                    source={require('@/assets/images/destination-folder.jpg')}
                    style={{ width: '100%', height: 250 }}
                    resizeMode='contain'
                  />
                </View>
                <View style={Local.infoStepContainer}>
                  <Text style={Local.infoStepTitle}>
                    3. Listen in Spotify:
                  </Text>
                  <Text style={Local.infoStepDescription}>
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
              contentHeight={950}
            >
              <View style={Local.infoContentContainer}>
                {/* <View style={Local.infoStepContainer}>
                  <Text style={[Local.infoStepTitle, {marginBottom: 20}]}>
                    1. Hit the blue "Export" button
                  </Text>
                  <Image 
                    source={require('@/assets/images/save-instructions-3.jpg')}
                    style={{ width: '100%', height: 200 }}
                    resizeMode='contain'
                  />
                </View> */}
                <View style={Local.infoStepContainer}>
                  <Text style={[Local.infoStepTitle, {marginBottom: 20}]}>
                    1. Hit "Save to Files" in the popup
                  </Text>
                  <Image 
                    source={require('@/assets/images/save-instructions.jpg')}
                    style={{ width: '100%', height: 250 }}
                    resizeMode='contain'
                  />
                </View>
                <View style={Local.infoStepContainer}>
                  <Text style={Local.infoStepTitle}>
                    2. Find Spotify folder and hit Save:
                  </Text>
                  <Text style={Local.infoStepDescription}>
                    On My iPhone → Spotify
                  </Text>
                  <Image 
                    source={require('@/assets/images/save-instructions-2.jpg')}
                    style={{ width: '100%', height: 250 }}
                    resizeMode='contain'
                  />
                </View>
              </View>
            </InfoContainer>
            <InfoContainer
              title={"Network Transfer"}
              contentHeight={400}
            >
              <View style={Local.infoContentContainer}>
                <View style={Local.infoStepContainer}>
                  <Text style={Local.infoStepTitle}>
                    How does it work?
                  </Text>
                  <Text style={Local.infoStepDescription}>
                    When you go to the Network Transfer tab, a small web server is started
                    on your device, running inside this app. The server is only accessible 
                    from other devices on your Wifi network, and cannot be accessed from elsewhere 
                    without additional setup.
                  </Text>
                  <Text style={Local.infoStepDescription}>
                    To access this web server, go to a web browser on your computer, or any other
                    device on your network. In the address bar, type in the IP address shown on 
                    the Network Transfer page, and the server running on your phone will return 
                    the web page to the web browser. 
                  </Text>
                  <Text style={Local.infoStepDescription}>
                    From there, you can upload files from your web browser, straight into the app.
                    The server will send the files over your local network, never using the internet. 
                  </Text>
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
          customStyles={{ marginTop: 10 }}
        />
      </View>
    </CustomModal>
  );

}

export default InfoModal;