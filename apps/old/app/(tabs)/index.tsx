import InfoModal from "@/src/features/app-shell/components/InfoModal";
import Notifications from "@/src/features/notifications/components/Notifications";
import Option from "@/src/shared/components/Option";
import PageTitle from "@/src/shared/components/PageTitle";
import MiniPlayer from "@/src/features/playback/components/MiniPlayer";
import SettingsButton from "@/src/shared/components/SettingsButton";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { usePremiumContext } from "@/src/features/premium/context/PremiumProvider";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { useGlobalProgressContext } from "@/src/features/app-shell/context/GlobalProgressProvider";
import { useAppShellContext } from "@/src/features/app-shell/context/AppShellProvider";
import { useImportFlowContext } from "@/src/features/import/context/ImportFlowProvider";
import { useIngestStore } from "@/src/features/ingest/hooks/use-ingest";
import { useHomePlaybackEffects } from "@/src/features/playback/hooks/use-home-playback-effects";
import { posthog } from "@/src/lib/posthog";
import { router } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

const Home = () => {
  const { setLoading, setResults } = useImportFlowContext();

  const { setShowInfoModal } = useAppShellContext();
  const { setShowImportAd } = useGlobalProgressContext();

  const { theme } = useThemeContext();
  const { premium } = usePremiumContext();

  const ingestFromFileBrowser = useIngestStore(
    (state) => state.ingestFromFileBrowser,
  );

  useHomePlaybackEffects();

  return (
    <View style={Styles.body}>
      <InfoModal />
      <PageTitle
        title="Home"
        infoHandler={() => setShowInfoModal(true)}
        rightHandComponent={<SettingsButton />}
      />
      <ScrollView
        style={Local.scrollView}
        contentContainerStyle={Local.scrollViewContent}
      >
        {/* <View style={[Local.content]}>
          <View style={Local.welcomeTitleContainer}>
            <Text style={Local.title}>Welcome to SYNQ</Text>
            <Image source={logo} style={Local.logo} />
          </View>
          <Text style={[Styles.description]}>
            The coolest place to listen to your music! Below, you can import files
            from this device, or from another device on your network. You can then
            modify the metadata of the music files, or listen to them here in the app!
          </Text>
        </View> */}
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
              handlePress={() => {
                posthog.capture("check_premium", {
                  premium: premium,
                });
                router.push("/premium");
              }}
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
          handlePress={() => {
            ingestFromFileBrowser();
          }}
        />
        <Option
          title="Network"
          desc="Import from your computer"
          icon={require("@/src/assets/icons/wifi.png")}
          handlePress={() => {
            setLoading(true);
            posthog.capture("import_wifi");
            router.push("/import/wifi");
            setTimeout(() => {
              setResults([]);
              setShowImportAd(true);
            }, 10);
          }}
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
  icon: {
    height: 25,
    width: 25,
  },
  welcomeTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    ...Styles.h3,
    marginVertical: 10,
    color: Colors.text,
  },
  logo: {
    height: 25,
    width: 25,
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

export default Home;
