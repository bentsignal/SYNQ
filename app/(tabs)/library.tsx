import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PageTitle } from '@/components/PageTitle'
import { Colors } from "@/constants/Colors";

const Library = () => {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: "center"
      }}
    >
      <PageTitle title='Your Library'/>
    </SafeAreaView>
  );
}

export default Library;