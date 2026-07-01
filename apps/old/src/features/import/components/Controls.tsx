import CustomButton from "@/src/shared/components/CustomButton";
import Notifications from "@/src/features/notifications/components/Notifications";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { useImportControls } from "@/src/features/import/hooks/use-import-controls";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { getDisabledColor } from "@/src/lib/color-utils";
import { SquarePen, Trash } from "lucide-react-native";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ImportControls() {
  const {
    altDisabled,
    altTitle,
    handleAltPress,
    handleDelete,
    handleEdit,
    handleMainPress,
    hideMainControls,
    mainDisabled,
    mainTitle,
    selectEnabled,
    showBatchActions,
  } = useImportControls();
  const { theme } = useThemeContext();
  const insets = useSafeAreaInsets();

  const Local = StyleSheet.create({
    container: {
      position: "absolute",
      bottom: insets.bottom,
      width: "100%",
      justifyContent: "flex-end",
      alignItems: "center",
    },
    batchButtonContainer: {
      display: showBatchActions ? "flex" : "none",
      flexDirection: "row",
      gap: 10,
    },
    batchButtonWrapper: {
      backgroundColor: Colors.song,
      padding: 15,
    },
    batchButtonIcon: {
      width: 20,
      height: 20,
      tintColor: Colors.text,
    },
    mainButtonContainer: {
      display: selectEnabled ? "none" : "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
      // padding: 5,
      width: "90%",
    },
    dropdownContainer: {
      width: "90%",
      marginBottom: 10,
    },
  });

  return (
    <View style={Local.container}>
      <Notifications />
      <View style={Local.batchButtonContainer}>
        <TouchableOpacity
          style={[
            Styles.roundedContainer,
            Styles.backgroundBlendShadow,
            Local.batchButtonWrapper,
          ]}
          onPress={handleEdit}
        >
          <SquarePen
            size={20}
            color={Colors.text}
            style={Local.batchButtonIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            Styles.roundedContainer,
            Styles.backgroundBlendShadow,
            Local.batchButtonWrapper,
          ]}
          onPress={handleDelete}
        >
          <Trash size={20} color={Colors.text} style={Local.batchButtonIcon} />
        </TouchableOpacity>
      </View>
      <View
        style={[
          Local.mainButtonContainer,
          { display: hideMainControls ? "none" : "flex" },
        ]}
      >
        <CustomButton
          title={altTitle}
          background={Colors.altButton}
          handlePress={handleAltPress}
          disabled={altDisabled}
          disabledColor={Colors.altDisabled}
          customStyles={{ flex: 1 }}
        />
        <CustomButton
          title={mainTitle}
          background={theme}
          handlePress={handleMainPress}
          disabled={mainDisabled}
          disabledColor={getDisabledColor(theme)}
          customStyles={{ flex: 1 }}
        />
      </View>
    </View>
  );
}
