import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import InfoModal from "@/src/features/app-shell/components/InfoModal";
import { useHomeScreenActions } from "@/src/features/app-shell/hooks/use-home-screen-actions";
import Notifications from "@/src/features/notifications/components/Notifications";
import MiniPlayer from "@/src/features/playback/components/MiniPlayer";
import Option from "@/src/shared/components/Option";
import PageTitle from "@/src/shared/components/PageTitle";
import SettingsButton from "@/src/shared/components/SettingsButton";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

const HomeScreen = () => {
  const {
    importFromFiles,
    importFromNetwork,
    openPremium,
    premium,
    showInfo,
    theme,
  } = useHomeScreenActions();

  return (
    <View style={Styles.body}>
      <InfoModal />
      <PageTitle
        title="Home"
        infoHandler={showInfo}
        rightHandComponent={<SettingsButton />}
      />
      <ScrollView
        style={Local.scrollView}
        contentContainerStyle={Local.scrollViewContent}
      >
        <Image
          source={require("@/src/assets/images/homepage.png")}
          style={Local.banner}
        />
        {!premium && (
          <>
            <Text style={[Local.title, Local.content, Local.premiumTitle]}>
              Premium
            </Text>
            <Option
              title="Premium"
              desc={premium ? "Manage your subcription" : "Unlock all features"}
              icon={require("@/src/assets/icons/premium.png")}
              handlePress={openPremium}
              iconTint={theme}
            />
          </>
        )}
        <Text
          style={[
            Local.title,
            Local.content,
            { marginTop: 20, marginBottom: 20 },
          ]}
        >
          Import Music
        </Text>
        <Option
          title="Files"
          desc="Import from your files"
          icon={require("@/src/assets/icons/folder.png")}
          handlePress={importFromFiles}
        />
        <Option
          title="Network"
          desc="Import from your computer"
          icon={require("@/src/assets/icons/wifi.png")}
          handlePress={importFromNetwork}
        />
      </ScrollView>
      <MiniPlayer />
      <Notifications customStyles={Local.notifications} />
    </View>
  );
};

const Local = StyleSheet.create({
  notifications: {
    position: "absolute",
    bottom: 0,
  },
  scrollView: {
    width: "100%",
  },
  scrollViewContent: {
    alignItems: "center",
  },
  content: {
    width: "90%",
  },
  title: {
    ...Styles.h3,
    marginVertical: 10,
    color: Colors.text,
  },
  premiumTitle: {
    marginBottom: 15,
    marginTop: 20,
  },
  banner: {
    width: "90%",
    height: 100,
    borderRadius: 10,
    marginTop: 5,
  },
});

export default HomeScreen;
