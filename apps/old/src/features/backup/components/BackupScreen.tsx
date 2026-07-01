import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { useBackupActions } from "@/src/features/backup/hooks/use-backup-actions";
import { usePremiumContext } from "@/src/features/premium/context/PremiumProvider";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import CustomButton from "@/src/shared/components/CustomButton";
import Loading from "@/src/shared/components/Loading";
import Option from "@/src/shared/components/Option";
import PageTitle from "@/src/shared/components/PageTitle";
import Bar from "@/src/shared/components/modals/Bar";
import ModalStyles from "@/src/shared/components/modals/Styles";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const BackupScreen = () => {
  const { theme } = useThemeContext();
  const { premium } = usePremiumContext();
  const {
    eraseLibrary,
    handleBackup,
    handlePremiumPress,
    handleRestore,
    loading,
  } = useBackupActions({ premium });

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
              handlePress={handlePremiumPress}
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
};

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

export default BackupScreen;
