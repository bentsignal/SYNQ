import { Text, View, Dimensions, Image, Modal, } from "react-native";
import CustomModal from "./CustomModal";
import VerticalScrollView from "../VerticalScrollView";
import CustomButton from "../CustomButton";
import ModalTitle from "./ModalTitle";
import { useGlobalContext } from "@/context/GlobalProvider";
import { Colors } from "@/constants/Colors";
import { Styles } from "@/constants/Styles";
import InfoContainer from "./InfoContainer";

const NotificationModal = () => {

  const {
      
      showNotificationModal, theme,
      notificationType, notificationMessage,
      notificationTitle, notificationTrace,
      
      setShowNotificationModal, setShowOverlay,
    
  } = useGlobalContext();

  return (
    <CustomModal
      show={showNotificationModal}
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
        <ModalTitle title={notificationTitle}/>
        <VerticalScrollView
          backgroundColor={Colors.popup}
          maxHeight={Dimensions.get('screen').height * 0.3}
          minHeight={Dimensions.get('screen').height * 0.5}
        >
          <View 
            style={[Styles.roundedContainer, {
              width: '95%',
              justifyContent: 'flex-start',
              alignItems: 'center',
              marginTop: 20,
              marginBottom: 20,
              // backgroundColor: Colors.background,
            }]}
          >
            <Text
              style={{
                color: Colors.text,
                fontSize: 18,
                textAlign: 'center',
                marginBottom: 20,
                width: '90%',
              }}
            >
              {notificationMessage}
            </Text>
            {

              notificationTrace !== null && notificationTrace.length > 0 ? 

              <View
                style={{
                  width: '90%',
                }}
              >
                <InfoContainer
                  title={'More Info'}
                  contentHeight={1000}
                >
                  <Text style={Styles.infoStepDescription}>{notificationTrace}</Text>
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
          customStyles={{
            marginTop: 10
          }}
        />
      </View>
    </CustomModal>
  );
}

export default NotificationModal;