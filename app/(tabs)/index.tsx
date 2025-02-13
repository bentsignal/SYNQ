import { View, ScrollView, StyleSheet, Text, Image } from 'react-native';
import { useGlobalContext } from "@/src/context/GlobalProvider";
import { Styles } from "@/src/constants/Styles";
import { importFiles } from "@/src/controllers/ImportExportController";
import PageTitle from '@/src/components/PageTitle';
import Option from "@/src/components/Option";
import InfoModal from "@/src/components/modals/InfoModal";
import Notifications from "@/src/components/notifications/Notifications";
import SettingsButton from "@/src/components/SettingsButton";
import { Colors } from '@/src/constants/Colors';
import { useThemeContext } from '@/src/context/ThemeProvider';
import { router } from 'expo-router';
import { usePremiumContext } from '@/src/context/PremiumProvider';
import usePlayer from '@/src/hooks/usePlayer';
import { useEffect } from 'react';
import { usePlaybackContext } from '@/src/context/PlaybackProvider';

const Home = () => {

  const { 
    
    setShowInfoModal,
    setLoading, setTransferProgress, 
    setTransferSize, setLoadAnimInProgress, 
    setExportDisabled, setResults,
    setShowImportAd,
  
  } = useGlobalContext();

  const { theme } = useThemeContext();
  const { premium } = usePremiumContext();
  const { setupPlayer } = usePlayer();
  const { playerInitialized, setPlayerInitialized } = usePlaybackContext();

  // sets up player
  useEffect(() => {
    try {
      if (!playerInitialized) {
        setupPlayer();
        setPlayerInitialized(true);
      }
    }
    catch (error) {
      console.log('error setting up player: ', error);
    }
  }, []);

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
        router.replace('/(tabs)');
      }
    })
    .catch((error) => {
      console.log(error);
      setLoading(false);
      router.push('/import/failure');
    })
  }

  return (
    <View style={Styles.body}>
      <InfoModal />
      <PageTitle 
          title='Home'
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
          source={require('@/src/assets/images/homepage.png')} 
          style={Local.banner} 
        />
        {!premium && (
          <>
            <Text style={[Local.title, Local.content, Local.premiumTitle]}>Premium</Text>
            <Option
              title="Premium"
              desc={premium ? "Manage your subcription" : 'Unlock all features'}
              icon={require('@/src/assets/icons/premium.png')}
              disabled={false}
              handlePress={() => router.push("/premium")}
              iconTint={theme}
            />
          </>
        )}
        <Text style={[Local.title, Local.content, { marginTop: 20, marginBottom: 20 }]}>Import Music</Text>
        <Option
          title='Files'
          desc='Import from your files'
          icon={require('@/src/assets/icons/folder.png')}
          disabled={false}
          handlePress={() => {
            setLoading(true);
            router.push('/import/files');
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
          icon={require('@/src/assets/icons/wifi.png')}
          disabled={false}
          handlePress={() => {
            setShowImportAd(true);
            setLoading(true);
            setResults([]);
            router.push('/import/wifi');
          }}
        />
      </ScrollView>
      <Notifications customStyles={Local.notifications}/>
    </View>
  );
  
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
  },
  premiumTitle: {
    marginBottom: 15,
    marginTop: 20,
  },
  banner: {
    width: '90%', 
    height: 100, 
    borderRadius: 10, 
    marginTop: 5,
  }
});

export default Home;