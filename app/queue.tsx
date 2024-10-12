import { View, StyleSheet } from "react-native";
import { Styles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";
import Bar from "@/components/modals/Bar";

const Queue = () => {


  const Local = StyleSheet.create({
    container: {
      backgroundColor: Colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    }
  });

  return (
    <View style={[Styles.body, Local.container]}>
      <Bar />
    </View>
  );

}

export default Queue;
