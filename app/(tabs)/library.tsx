import { View, Text, } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Styles } from "@/constants/Styles";
import { router } from "expo-router";
import PageTitle from '@/components/PageTitle';
import Option from "@/components/Option";
import Top from "@/components/Top";

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
    </View>
  );
}

export default Library;