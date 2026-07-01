import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import CustomButton from "@/src/shared/components/CustomButton";
import VerticalScrollView from "@/src/shared/components/VerticalScrollView";
import CustomModal from "@/src/shared/components/modals/CustomModal";
import InfoContainer from "@/src/shared/components/modals/InfoContainer";
import ModalTitle from "@/src/shared/components/modals/ModalTitle";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { useAppShellContext } from "@/src/features/app-shell/context/AppShellProvider";
import { useNotificationsContext } from "@/src/features/notifications/context/NotificationsProvider";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";

const NotificationModal = () => {
  const {
    showNotificationModal,
    notificationMessage,
    notificationTitle,
    notificationTrace,
    setShowNotificationModal,
  } = useNotificationsContext();

  const { setShowOverlay } = useAppShellContext();

  const { theme } = useThemeContext();
  const { height } = useWindowDimensions();

  const Local = StyleSheet.create({
    container: {
      justifyContent: "center",
      alignItems: "center",
      width: "95%",
      marginTop: 20,
      marginBottom: 20,
    },
    contentContainer: {
      ...Styles.roundedContainer,
      width: "95%",
      justifyContent: "flex-start",
      alignItems: "center",
      marginTop: 20,
      marginBottom: 20,
    },
    message: {
      color: Colors.text,
      fontSize: 18,
      textAlign: "center",
      marginBottom: 20,
      width: "90%",
    },
    traceWrapper: {
      width: "90%",
    },
    button: {
      marginTop: 10,
    },
  });

  return (
    <CustomModal show={showNotificationModal} width="95%">
      <View style={Local.container}>
        <ModalTitle title={notificationTitle} />
        <VerticalScrollView
          backgroundColor={Colors.popup}
          maxHeight={height * 0.3}
          minHeight={height * 0.5}
        >
          <View style={Local.contentContainer}>
            <Text style={Local.message}>{notificationMessage}</Text>
            {notificationTrace !== null &&
            notificationTrace !== undefined &&
            notificationTrace.length > 0 ? (
              <View style={Local.traceWrapper}>
                <InfoContainer title="More Info" contentHeight={3000}>
                  <Text style={Styles.description}>{notificationTrace}</Text>
                </InfoContainer>
              </View>
            ) : null}
          </View>
        </VerticalScrollView>
        <CustomButton
          title="Close"
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
};

export default NotificationModal;
