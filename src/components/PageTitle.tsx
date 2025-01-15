import { Text, Image, TouchableOpacity, View, StyleSheet } from "react-native";
import { Styles } from "@/src/constants/Styles";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import { Colors } from "@/src/constants/Colors";
import { useThemeContext } from "@/src/context/ThemeProvider";

type PageTitleProps = {
  title: string;
  infoHandler?: () => void;
  showList?: boolean;
  rightHandComponent?: React.ReactNode;
}

const PageTitle = ({
  title,
  infoHandler,
  showList,
  rightHandComponent
}: PageTitleProps) => {

  const { 

    selectEnabled,
    
    setSelectEnabled, setShowOverlay,
  
  } = useGlobalContext();

  const { theme } = useThemeContext();

  const Local = StyleSheet.create({
    pageTitle: {
      textAlign: 'left',
      alignSelf: 'stretch',
      color: Colors.text,
    },
    pageTitleContainer: {
      width: '90%',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginBottom: 20
    },
    listWrapper: {
      flexGrow: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
    },
    listIcon: {
      width: 20,
      height: 20,
      tintColor: selectEnabled ? theme : 'white',
    },
    infoIcon: {
      height: 25,
      width: 25,
      marginLeft: 10,
      tintColor: theme,
    }
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
          <Image 
            source={require('@/src/assets/icons/info.png')}
            style={Local.infoIcon}
          />
        </TouchableOpacity>
      );
    }
    else {
      return (
        <></>
      );
    }
  }

  const list = () => {
    if (showList) {
      return (
        <View style={Local.listWrapper}>
          <TouchableOpacity
            onPress={() => {
              setSelectEnabled(!selectEnabled);
            }}
          >
            <Image 
              source={selectEnabled 
                        ? require('@/src/assets/icons/list-active.png') 
                        : require('@/src/assets/icons/list.png')
                      }
              style={Local.listIcon}
            />
          </TouchableOpacity>
        </View>
      )
    }
  }

  return (
    <View style={Local.pageTitleContainer}>
      <Text style={[Styles.h2, Local.pageTitle]}>
        {title}
      </Text>
      {info()}
      {list()}
      {rightHandComponent}
    </View>
  );
  
}



export default PageTitle;