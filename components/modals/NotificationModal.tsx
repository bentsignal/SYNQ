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
      notificationTitle,
      
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
          maxHeight={Dimensions.get('screen').height * 0.4}
          minHeight={Dimensions.get('screen').height * 0.20}
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
            <Text
              style={{
                color: Colors.text,
                fontSize: 18,
                textAlign: 'center'
              }}
            >
              {notificationMessage}
            </Text>
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