import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { Info, List } from "lucide-react-native";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type PageTitleProps = {
  title: string;
  infoHandler?: () => void;
  showList?: boolean;
  rightHandComponent?: React.ReactNode;
};

const PageTitle = ({
  title,
  infoHandler,
  showList,
  rightHandComponent,
}: PageTitleProps) => {
  const {
    selectEnabled,

    setSelectEnabled,
    setShowOverlay,
  } = useGlobalContext();

  const { theme } = useThemeContext();

  const Local = StyleSheet.create({
    pageTitle: {
      textAlign: "left",
      alignSelf: "stretch",
      color: Colors.text,
    },
    pageTitleContainer: {
      width: "90%",
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      marginBottom: 20,
    },
    listWrapper: {
      flexGrow: 1,
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-end",
    },
    listIcon: {
      width: 20,
      height: 20,
      tintColor: selectEnabled ? theme : "white",
    },
  });

  const info = () => {
    if (infoHandler) {
      return (
        <TouchableOpacity
          onPress={() => {
            infoHandler();
            setShowOverlay(true);
          }}
        >
          <Info size={25} color={theme} style={{ marginLeft: 10 }} />
        </TouchableOpacity>
      );
    } else {
      return <></>;
    }
  };

  const list = () => {
    if (showList) {
      return (
        <View style={Local.listWrapper}>
          <TouchableOpacity
            onPress={() => {
              setSelectEnabled(!selectEnabled);
            }}
          >
            <List size={25} color={selectEnabled ? theme : Colors.text} />
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <View style={Local.pageTitleContainer}>
      <Text style={[Styles.h2, Local.pageTitle]}>{title}</Text>
      {info()}
      {list()}
      {rightHandComponent}
    </View>
  );
};

export default PageTitle;
