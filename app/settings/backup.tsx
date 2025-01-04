import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Styles } from '@/constants/Styles';
import { Colors } from '@/constants/Colors';
import Bar from '@/components/modals/Bar';
import ModalStyles from '@/components/modals/Styles';
import PageTitle from '@/components/PageTitle';
import CustomButton from '@/components/CustomButton';
import { useThemeContext } from '@/context/ThemeProvider';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { zip, unzip } from 'react-native-zip-archive';

export default function Backup() {

  const { theme } = useThemeContext();

  const handleBackup = async () => {
    try {
      const pathToZip = await zip(`${FileSystem.documentDirectory}`, `${FileSystem.documentDirectory}backup.zip`);
      await Sharing.shareAsync(pathToZip);
    } catch (error) {
      console.log('error zipping directory:', error);
    }
  }

  const handleRestore = async () => {
    try {
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

      }
    } catch (error) {
      console.log('Error restoring backup:', error);
    }
  }

  return (
    <View style={[Styles.body, Local.container]}>
      <Bar />
      <View style={{marginTop: 20}} />
      <PageTitle title="Backup & Restore" />
      <ScrollView 
        style={Local.scrollView}
        contentContainerStyle={Local.scrollViewContent}
      >
        <View style={Local.contentWrapper}>
          <View style={Local.contentContainer}>
            <Text style={Local.headerText}>Backup your library</Text>
            <Text style={Local.description}>
              Backup your library to a zip file. You will be able to restore it later. 
              This will only backup your library, not your settings or premium status.
            </Text>
            <CustomButton 
              title="Backup"
              handlePress={handleBackup}
              customStyles={{marginBottom: 30}}
              buttonWidth={'100%'}
            />
            <Text style={Local.headerText}>Restore</Text>
            <Text style={Local.description}>
              Restore your library from a zip file. This will overwrite your current library.
            </Text>
            <CustomButton 
              title="Restore"
              handlePress={handleRestore}
              background={theme}
              buttonWidth={'100%'}
            />
          </View>
        </View>
      </ScrollView>
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
    marginBottom: 10,
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
});
