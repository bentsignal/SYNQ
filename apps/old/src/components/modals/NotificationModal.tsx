import { Text, View, Dimensions, Image, Modal, StyleSheet } from "react-native";
import CustomModal from "./CustomModal";
import VerticalScrollView from "../VerticalScrollView";
import CustomButton from "../CustomButton";
import ModalTitle from "./ModalTitle";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import InfoContainer from "./InfoContainer";
import { useThemeContext } from "@/src/context/ThemeProvider";

const NotificationModal = () => {

  const {
      
      showNotificationModal,
      notificationType, notificationMessage,
      notificationTitle, notificationTrace,
      
      setShowNotificationModal, setShowOverlay,
    
  } = useGlobalContext();

  const { theme } = useThemeContext();

  const Local = StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '95%',
      marginTop: 20,
      marginBottom: 20,
    },
    contentContainer: {
      ...Styles.roundedContainer,
      width: '95%',
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 20,
    },
    message: {
      color: Colors.text,
      fontSize: 18,
      textAlign: 'center',
      marginBottom: 20,
      width: '90%',
    },
    traceWrapper: {
      width: '90%',
    },
    button: {
      marginTop: 10,
    }
  });

  return (
    <CustomModal
      show={showNotificationModal}
      width={'95%'}
    >
      <View style={Local.container}>
        <ModalTitle title={notificationTitle}/>
        <VerticalScrollView
          backgroundColor={Colors.popup}
          maxHeight={Dimensions.get('screen').height * 0.3}
          minHeight={Dimensions.get('screen').height * 0.5}
        >
          <View style={Local.contentContainer}>
            <Text style={Local.message}>
              {notificationMessage}
            </Text>
            {

              notificationTrace !== null && notificationTrace !== undefined && notificationTrace.length > 0 ? 

              <View style={Local.traceWrapper}>
                <InfoContainer
                  title={'More Info'}
                  contentHeight={3000}
                >
                  <Text style={Styles.description}>{notificationTrace}</Text>
                </InfoContainer>
              </View>

              : null

            }
            
          </View>
        </VerticalScrollView>
        <CustomButton 
          title='Close'
          background={theme}
          handlePress={() => {
            setShowOverlay(false);
            setShowNotificationModal(false);
          }}
          customStyles={Local.button}
        />
      </View>
    </CustomModal>
  );
}

export default NotificationModal;