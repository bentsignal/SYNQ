import { useState } from "react";
import CustomButton from "@/src/components/CustomButton";
import Loading from "@/src/components/Loading";
import Bar from "@/src/components/modals/Bar";
import ModalStyles from "@/src/components/modals/Styles";
import Option from "@/src/components/Option";
import PageTitle from "@/src/components/PageTitle";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { usePremiumContext } from "@/src/context/PremiumProvider";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { posthog } from "@/src/lib/posthog";
import Model from "@/src/models/Model";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import TrackPlayer from "react-native-track-player";
import { unzip, zip } from "react-native-zip-archive";

export default function Backup() {
  const { theme } = useThemeContext();
  const { premium } = usePremiumContext();

  const [loading, setLoading] = useState(false);

  const getDocumentDirectory = () => {
    if (!FileSystem.documentDirectory) {
      throw new Error("Document directory is unavailable.");
    }

    return FileSystem.documentDirectory;
  };

  const wrapError = (message: string, error: unknown) => {
    const details = error instanceof Error ? error.message : String(error);
    return new Error(`${message} ${details}`);
  };

  const clearDocumentDirectory = async () => {
    const documentDirectory = getDocumentDirectory();
    const items = await FileSystem.readDirectoryAsync(documentDirectory);
    for (const item of items) {
      await FileSystem.deleteAsync(`${documentDirectory}${item}`);
    }
  };

  const clearAsyncStorage = async () => {
    await AsyncStorage.clear();
  };

  const resetDB = async () => {
    await Model.reconnect();
    await Model.createTables();
  };

  const resetPlayer = async () => {
    TrackPlayer.reset();
  };

  const handleBackup = async () => {
    try {
      setLoading(true);
      const documentDirectory = getDocumentDirectory();
      const pathToZip = await zip(
        documentDirectory,
        `${documentDirectory}backup.zip`,
      );
      await Sharing.shareAsync(pathToZip);
    } catch (error) {
      console.log("Error backing up library:", error);
      showErrorAlert(
        `Failed to backup library. If the error persists, please contact support.`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/zip",
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        try {
          await clearDocumentDirectory();
        } catch (error) {
          throw wrapError("Error clearing document directory:", error);
        }
        try {
          await clearAsyncStorage();
        } catch (error) {
          throw wrapError("Error clearing async storage:", error);
        }
        try {
          await unzip(result.assets[0].uri, getDocumentDirectory());
        } catch (error) {
          throw wrapError("Error unzipping backup:", error);
        }
        try {
          await resetDB();
        } catch (error) {
          throw wrapError("Error reconnecting to db:", error);
        }
        try {
          await resetPlayer();
        } catch (error) {
          throw wrapError("Error resetting track player:", error);
        }
        Alert.alert("Success", "Library restored successfully.");
        setLoading(false);
        router.replace({
          pathname: "/(tabs)/library",
          params: {
            category: "songs",
            resetKey: Date.now().toString(),
          },
        });
      }
    } catch (error) {
      console.log("Error restoring backup:", error);
      showErrorAlert(
        `Failed to restore backup. If the error persists, please contact support.`,
      );
    } finally {
      setLoading(false);
    }
  };

  const eraseLibrary = async () => {
    try {
      Alert.alert(
        "Warning",
        "Are you sure you want to erase your library? This action cannot be undone.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Erase",
            style: "destructive",
            onPress: async () => {
              setLoading(true);
              try {
                try {
                  await clearDocumentDirectory();
                } catch (error) {
                  throw wrapError("Error clearing document directory:", error);
                }
                try {
                  await clearAsyncStorage();
                } catch (error) {
                  throw wrapError("Error clearing async storage:", error);
                }
                try {
                  await resetDB();
                } catch (error) {
                  throw wrapError("Error reconnecting to db:", error);
                }
                try {
                  await resetPlayer();
                } catch (error) {
                  throw wrapError("Error resetting track player:", error);
                }
                Alert.alert("Success", "Library erased successfully.");
                setLoading(false);
                router.replace({
                  pathname: "/(tabs)/library",
                  params: {
                    category: "songs",
                    resetKey: Date.now().toString(),
                  },
                });
              } catch (error) {
                console.log("Error resetting app:", error);
                showErrorAlert(
                  `Failed to reset app. If the error persists, please contact support.`,
                );
              }
            },
          },
        ],
      );
    } catch (error) {
      console.log("Error erasing library:", error);
      showErrorAlert(
        `Failed to erase library. If the error persists, please contact support.`,
      );
    } finally {
      setLoading(false);
    }
  };

  const showErrorAlert = (message: string) => {
    Alert.alert("Error", message, [
      {
        text: "Dismiss",
        style: "cancel",
      },
      {
        text: "Contact Support",
        style: "default",
        onPress: () => {
          Linking.openURL("https://directedbyshawn.com/synq-support");
        },
      },
    ]);
  };

  return (
    <View style={[Styles.body, Local.container]}>
      <Bar />
      <View style={{ marginTop: 20 }} />
      <PageTitle title="Backup & Restore" />
      <ScrollView
        style={[Local.scrollView, { display: loading ? "none" : "flex" }]}
        contentContainerStyle={Local.scrollViewContent}
      >
        <View style={Local.contentWrapper}>
          {!premium && (
            <Option
              title="Premium"
              desc={premium ? "Manage your subcription" : "Unlock all features"}
              icon={require("@/src/assets/icons/premium.png")}
              containerClass="bg-card"
              iconTint={theme}
              handlePress={() => {
                posthog.capture("check_premium", {
                  premium: premium,
                });
                router.push("/premium");
              }}
            />
          )}
          <View style={Local.contentContainer}>
            <View style={Local.titleWrapper}>
              <Text style={Local.headerText}>Backup your library</Text>
              {!premium && <Text style={Local.premiumText}>Premium</Text>}
            </View>
            <Text style={Local.description}>
              Backup your library to a zip file. You can then use this file to
              restore to at a later time. This will only backup your library,
              not your settings or premium status.
            </Text>
            <CustomButton
              title="Backup"
              handlePress={handleBackup}
              customStyles={{ marginBottom: 30 }}
              buttonWidth={"100%"}
              disabled={!premium}
            />
            <View style={Local.titleWrapper}>
              <Text style={Local.headerText}>Restore your library</Text>
              {!premium && <Text style={Local.premiumText}>Premium</Text>}
            </View>
            <Text style={Local.description}>
              Restore your library from a zip file. This will overwrite your
              current library, removing any existing songs, albums, artists,
              playlists, etc.
            </Text>
            <CustomButton
              title="Restore"
              handlePress={handleRestore}
              customStyles={{ marginBottom: 30 }}
              buttonWidth={"100%"}
              disabled={!premium}
            />
            <View style={Local.titleWrapper}>
              <Text style={Local.headerText}>Erase your library</Text>
              {!premium && <Text style={Local.premiumText}>Premium</Text>}
            </View>
            <Text style={Local.description}>
              Erase your library. This will remove all songs, albums, artists,
              playlists, etc.
            </Text>
            <CustomButton
              title="Erase"
              handlePress={eraseLibrary}
              background={Colors.error}
              buttonWidth={"100%"}
              disabled={!premium}
            />
          </View>
        </View>
      </ScrollView>
      <View
        style={[Local.loadingContainer, { display: loading ? "flex" : "none" }]}
      >
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
    width: "100%",
  },
  headerText: {
    color: Colors.text,
    ...Styles.h3,
  },
  description: {
    color: Colors.infoText,
    ...Styles.p,
    marginBottom: 20,
    width: "100%",
  },
  scrollViewContent: {
    width: "100%",
  },
  contentWrapper: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    width: "90%",
  },
  loadingContainer: {
    width: "100%",
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
  },
  premiumText: {
    color: Colors.main,
    ...Styles.h5,
  },
  titleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
});
