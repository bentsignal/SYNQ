import { View, ScrollView, StyleSheet, Text, Image } from 'react-native';
import { useGlobalContext } from "@/context/GlobalProvider";
import { Styles } from "@/constants/Styles";
import { importFiles } from "@/lib/controllers/ImportExportController";
import PageTitle from '@/components/PageTitle';
import Option from "@/components/Option";
import WiFi from "@/components/import/wifi/WiFi";
import Files from "@/components/import/files/Files";
import { Success, Failure } from "@/components/Outcome";
import InfoModal from "@/components/modals/InfoModal";
import Notifications from "@/components/notifications/Notifications";
import ExportPrompt from "@/components/import/ExportPrompt";
import SavePrompt from "@/components/import/SavePrompt";  
import SettingsButton from "@/components/SettingsButton";
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';
import { router } from 'expo-router';
import { usePremiumContext } from '@/context/PremiumProvider';

const Home = () => {

  const { 

    serverStarted,
    
    setServerStarted, setShowInfoModal,
    setLoading, setTransferProgress, 
    setTransferSize, setLoadAnimInProgress, 
    setExportDisabled, setResults,
    setShowImportAd,
  
  } = useGlobalContext();

  const { homeState, setHomeState } = useGlobalContext();
  const { logo } = useThemeContext();
  const { premium } = usePremiumContext();

  const browseFiles = () => {
    setLoading(true);
    const updateCountdown = (value: number) => setTransferProgress(value);
    const updateSize = (value: number) => {
      setTransferSize(value)
      if (value > 2) {
        setLoadAnimInProgress(true);
      }
    };
    importFiles(updateCountdown, updateSize).then((results) => {
      setTransferSize(-1);
      setTransferProgress(-1);
      setLoading(false);
      if (results.length > 0) {
        setExportDisabled(false);
        setResults(results);
      }
      else {
        setHomeState(0);
      }
    })
    .catch((error) => {
      console.log(error);
      setLoading(false);
      setHomeState(4);
    })
  }

  if (homeState === 1) {
    return (
      <WiFi />
    );
  }
  else if (homeState === 2) {
    return (
      <Files />
    );
  }
  else if (homeState === 3) {
    return (
      <Success />
    );
  }
  else if (homeState === 4) {
    return (
      <Failure />
    );
  }
  else if (homeState === 5) {
    return (
      <ExportPrompt />
    );
  }
  else if (homeState === 6) {
    return (
      <SavePrompt />
    );
  }
  else {
    return (
      <View style={Styles.body}>
        <InfoModal />
        <ScrollView
          style={Local.scrollView}
          contentContainerStyle={Local.scrollViewContent}
        >
          <PageTitle 
            title='Home'
            rightHandComponent={<SettingsButton />} 
          />
          <View style={[Local.content]}>
            <View style={Local.welcomeTitleContainer}>
              <Text style={Local.title}>Welcome to SYNQ</Text>
              <Image source={logo} style={Local.logo} />
            </View>
            <Text style={[Styles.description]}>
              The coolest place to listen to your music! Below, you can import files
              from this device, or from another device on your network. You can then
              modify the metadata of the music files, or listen to them here in the app!
            </Text>
          </View>
          {!premium && (
            <>
              <Text style={[Local.title, Local.content]}>Premium</Text>
              <Option
                title="Premium"
                desc={premium ? "Manage your subcription" : 'Unlock all features'}
                icon={require('@/assets/icons/premium.png')}
                disabled={false}
                handlePress={() => router.push("/premium")}
              />
            </>
          )}
          <Text style={[Local.title, Local.content, { marginTop: 20, marginBottom: 20 }]}>Import Music</Text>
          <Option
            title='Files'
            desc='Import from your files'
            icon={require('@/assets/icons/folder.png')}
            disabled={false}
            handlePress={() => {
              setLoading(true);
              setHomeState(2);
              setResults([]);
              setShowImportAd(true);
              setTimeout(() => {
                browseFiles();
              }, 10);
            }}
          />
          <Option 
            title='Network'
            desc='Import from your computer'
            icon={require('@/assets/icons/wifi.png')}
            disabled={false}
            handlePress={() => {
              setShowImportAd(true);
              setLoading(true);
              setResults([]);
              setHomeState(1);
            }}
          />
        </ScrollView>
        <Notifications customStyles={Local.notifications}/>
      </View>
    );
  }
  
}

const Local = StyleSheet.create({
  notifications: {
    position: 'absolute',
    bottom: 0,
  },
  scrollView: {
    width: '100%',
  },
  scrollViewContent: {
    alignItems: 'center',
  },
  content: {
    width: '90%',
  },
  icon: {
    height: 25,
    width: 25,
  },
  welcomeTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  }
});

export default Home;