import { Text, View, Dimensions, Modal } from "react-native";
import CustomModal from "./CustomModal";
import VerticalScrollView from "../VerticalScrollView";
import CustomButton from "../CustomButton";
import ModalTitle from "./ModalTitle";
import { useGlobalContext } from "@/context/GlobalProvider";
import { Colors } from "@/constants/Colors";

const InfoModal = () => {

  const { 

    showInfoModal,
    
    setShowInfoModal, setShowOverlay,
  
  } = useGlobalContext();

  const textComponents = Array.from({ length: 100 }, (_, index) => (
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
        >
          <View
            style={{
              width: '100%',
              justifyContent: 'flex-start',
              alignItems: 'center',
              marginTop: 20,
              marginBottom: 50
            }}
          >
            {textComponents}
            <Text style={{color: 'white', backgroundColor: 'red', width: '100%'}}>Test Info</Text>
          </View>
        </VerticalScrollView>
        <CustomButton 
          title='Close'
          background={Colors.main}
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