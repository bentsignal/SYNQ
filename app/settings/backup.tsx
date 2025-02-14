import { View, Text, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { useState } from 'react';
import { Styles } from '@/src/constants/Styles';
import { Colors } from '@/src/constants/Colors';
import Bar from '@/src/components/modals/Bar';
import ModalStyles from '@/src/components/modals/Styles';
import PageTitle from '@/src/components/PageTitle';
import CustomButton from '@/src/components/CustomButton';
import { useThemeContext } from '@/src/context/ThemeProvider';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { zip, unzip } from 'react-native-zip-archive';
import Model from '@/src/models/Model';
import Loading from '@/src/components/Loading';
import playlistBus from '@/src/events/playlist/Bus';
import { PlaylistBusEvent } from '@/src/events/playlist/Events';
import TrackPlayer from 'react-native-track-player';
import { usePremiumContext } from '@/src/context/PremiumProvider';
import { router } from 'expo-router';
import Option from '@/src/components/Option';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePostHog } from 'posthog-react-native';

export default function Backup() {

  const { theme } = useThemeContext();
  const [loading, setLoading] = useState(false);
  const { premium } = usePremiumContext();
  const posthog = usePostHog();

  const handleBackup = async () => {
    try {
      setLoading(true);
      const pathToZip = await zip(`${FileSystem.documentDirectory}`, `${FileSystem.documentDirectory}backup.zip`);
      await Sharing.shareAsync(pathToZip);
    } 
    catch (error) {
      console.log('Error backing up library:', error);
      showErrorAlert(`Failed to backup library. If the error persists, please contact support.`);
    }
    finally {
      setLoading(false);
    }
  }

  const handleRestore = async () => {
    try {
      setLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/zip",
        copyToCacheDirectory: true
      });
      if (!result.canceled) {
        // Clear document directory
        const items = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
        for (const item of items) {
          await FileSystem.deleteAsync(`${FileSystem.documentDirectory}${item}`);
        }
        // Unzip backup into document directory
        await unzip(result.assets[0].uri, FileSystem.documentDirectory);
        // reconnect to db
        await Model.reconnect();
        await Model.createTables();
        playlistBus.emit(PlaylistBusEvent.PLAYLIST_SONGS_IMPORTED);
        TrackPlayer.reset();
        Alert.alert('Success', 'Library restored successfully. Please restart the app.');
      }
    } catch (error) {
      console.log('Error restoring backup:', error);
      showErrorAlert(`Failed to restore backup. If the error persists, please contact support.`);
    }
    finally {
      setLoading(false);
    }
  }

  const eraseLibrary = async () => {
    try {
      Alert.alert('Warning', 'Are you sure you want to erase your library? This action cannot be undone.', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Erase',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            // Clear document directory
            const items = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
            for (const item of items) {
              await FileSystem.deleteAsync(`${FileSystem.documentDirectory}${item}`);
            }
            try {
              await AsyncStorage.clear();
            }
            catch (error) {
              console.log('Error clearing async storage:', error);
            }
            await Model.reconnect();
            await Model.createTables();
            playlistBus.emit(PlaylistBusEvent.PLAYLIST_SONGS_IMPORTED);
            TrackPlayer.reset();

            Alert.alert('Success', 'Library erased successfully. Please restart the app.');
            setLoading(false);
          }
        }
      ]);
    }
    catch (error) {
      console.log('Error erasing library:', error);
      showErrorAlert(`Failed to erase library. If the error persists, please contact support.`);
    }
    finally {
      setLoading(false);
    }
  }

  const showErrorAlert = (message: string) => {
    Alert.alert('Error', message, [
      {
        text: 'Dismiss',
        style: 'cancel',
      },
      {
        text: 'Contact Support',
        style: 'default',
        onPress: () => {
          Linking.openURL('https://directedbyshawn.com/synq-support');
        }
      }
    ]);
  }

  return (
    <View style={[Styles.body, Local.container]}>
      <Bar />
      <View style={{marginTop: 20}} />
      <PageTitle title="Backup & Restore" />
      <ScrollView 
        style={[Local.scrollView, {display: loading ? 'none' : 'flex'}]}
        contentContainerStyle={Local.scrollViewContent}
      >
        <View style={Local.contentWrapper}>
            {
              !premium && <Option 
                title="Premium"
                desc={premium ? "Manage your subcription" : 'Unlock all features'}
                icon={require('@/src/assets/icons/premium.png')}
                disabled={false}
                bg={Colors.textbox}
                iconTint={theme}
                handlePress={() => {
                  posthog.capture('check_premium', {
                    premium: premium
                  });
                  router.push("/premium")}
                }
              />
            }
          <View style={Local.contentContainer}>
            <View style={Local.titleWrapper}>
              <Text style={Local.headerText}>
                Backup your library 
              </Text>
              {!premium && <Text style={Local.premiumText}>Premium</Text>}
            </View>
            <Text style={Local.description}>
              Backup your library to a zip file. You can then use this file to restore to at a later time. 
              This will only backup your library, not your settings or premium status.
            </Text>
            <CustomButton 
              title="Backup"
              handlePress={handleBackup}
              customStyles={{marginBottom: 30}}
              buttonWidth={'100%'}
              disabled={!premium}
            />
            <View style={Local.titleWrapper}>
              <Text style={Local.headerText}>
                Restore your library 
              </Text>
              {!premium && <Text style={Local.premiumText}>Premium</Text>}
            </View>
            <Text style={Local.description}>
              Restore your library from a zip file. This will overwrite your current library, removing 
              any existing songs, albums, artists, playlists, etc.
            </Text>
            <CustomButton 
              title="Restore"
              handlePress={handleRestore}
              customStyles={{marginBottom: 30}}
              buttonWidth={'100%'}
              disabled={!premium}
            />
            <View style={Local.titleWrapper}>
              <Text style={Local.headerText}>
                Erase your library 
              </Text>
              {!premium && <Text style={Local.premiumText}>Premium</Text>}
            </View>
            <Text style={Local.description}>
              Erase your library. This will remove all songs, albums, artists, playlists, etc.
            </Text>
            <CustomButton 
              title="Erase"
              handlePress={eraseLibrary}
              background={Colors.error}
              buttonWidth={'100%'}
              disabled={!premium}
            />
          </View>
        </View>
      </ScrollView>
      <View style={[Local.loadingContainer, {display: loading ? 'flex' : 'none'}]}>
        <Loading width={200} height={100} />
      </View>
    </View>
  );

}

const Local = StyleSheet.create({
  container: {
    backgroundColor: Colors.popup,
    ...ModalStyles.roundedTop,
  },
  scrollView: {
    width: '100%',
  },
  headerText: {
    color: Colors.text,
    ...Styles.h3,
  },
  description: {
    color: Colors.infoText,
    ...Styles.p,
    marginBottom: 20,
    width: '100%',
  },
  scrollViewContent: {
    width: '100%',
  },
  contentWrapper: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: '90%',
  },
  loadingContainer: {
    width: '100%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumText: {
    color: Colors.main,
    ...Styles.h5,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  }
});
