import { Text, Image, TouchableOpacity, View } from "react-native";
import { Styles } from "@/constants/Styles";
import { useGlobalContext } from "@/context/GlobalProvider";
import { Colors } from "@/constants/Colors";

type PageTitleProps = {
  title: string;
  infoHandler?: () => void;
  showList?: boolean;
}

const PageTitle = ({
  title,
  infoHandler,
  showList
}: PageTitleProps) => {

  const { 

    selectEnabled, 
    
    setSelectEnabled, setShowOverlay,
  
  } = useGlobalContext();

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
            source={require('@/assets/icons/info.png')}
            style={{
              height: 25,
              width: 25,
              marginLeft: 10,
              tintColor: Colors.main,
            }}
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
        <View
          style={{
            flexGrow: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setSelectEnabled(!selectEnabled);
            }}
          >
            <Image 
              source={selectEnabled 
                        ? require('@/assets/icons/list-active.png') 
                        : require('@/assets/icons/list.png')
                      }
              style={{
                width: 20,
                height: 20
              }}
            />
          </TouchableOpacity>
        </View>
      )
    }
    else {
      return (
        <></>
      );
    }
  }

  return (
    <View
      style={{
        width: '90%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 20
      }}
    >
      <Text style={Styles.pageTitle}>
        {title}
      </Text>
      {info()}
      {list()}
    </View>
  );
  
}

export default PageTitle;