import { TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import Arrow from "@/components/Arrow";
import { useGlobalContext } from "@/context/GlobalProvider";

const BackArrow = () => {
  const { theme } = useGlobalContext();
  return (
    <TouchableOpacity 
      onPress={() => router.back()}
      style={Local.backArrow}
    >
      <Arrow 
        containerStyle={Local.arrowContainer}
        arrowStyle={{backgroundColor: theme}}
      />
    </TouchableOpacity>
  );
}

const Local = StyleSheet.create({
  backArrow: {
    paddingLeft: 5,
    paddingRight: 10,
    paddingVertical: 5,
  },
  arrowContainer: {
    transform: [{rotate: '-45deg'}],
  }
});

export default BackArrow;