import { View, Text, } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Styles } from "@/constants/Styles";
import PageTitle from '@/components/PageTitle';
import Top from "@/components/Top";
import CustomButton from "@/components/CustomButton";
import { Colors } from "@/constants/Colors";
import Notifications from "@/components/notifications/Notifications";
import { NotificationType } from "@/constants/Types";
import { useGlobalContext } from "@/context/GlobalProvider";
import DataManager from "@/lib/DataManager";
import { useEffect } from "react";

const Library = () => {

  const insets = useSafeAreaInsets();

  const { addNotification, homeState } = useGlobalContext();

  useEffect(() => {
    const db = DataManager.getInstance();
    db.getSongs().then((result) => {
      console.log(result);
    });
  }, [homeState]);

  return (
    <View style={[Styles.body, {paddingTop: insets.top}]}>
      <Top />
      <PageTitle title='Library'/>
      <View
        style={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: 'white',
          }}
        >
          Coming soon
        </Text>
      </View>
      <Notifications  
        customStyles={{
          position: 'absolute',
          bottom: 0,
        }}
      />
    </View>
  );
}

export default Library;