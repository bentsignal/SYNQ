import { Text, View, Dimensions, Modal } from "react-native";
import CustomModal from "./CustomModal";
import VerticalScrollView from "../VerticalScrollView";
import CustomButton from "../CustomButton";
import ModalTitle from "./ModalTitle";
import { useGlobalContext } from "@/context/GlobalProvider";
import { Colors } from "@/constants/Colors";
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
            <InfoContainer title={'Export to Spotify'}>
              {textComponents}
            </InfoContainer>
            <InfoContainer title={'Edit a song'}>
              {textComponents}
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