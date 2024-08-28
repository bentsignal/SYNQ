import { View, Text, } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Styles } from "@/constants/Styles";
import PageTitle from '@/components/PageTitle';
import Top from "@/components/Top";
import Notifications from "@/components/notifications/Notifications";

const Library = () => {
  const insets = useSafeAreaInsets();
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