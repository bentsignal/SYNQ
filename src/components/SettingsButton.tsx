import { router } from "expo-router";
import { Cog } from "lucide-react-native";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/Colors";

export default function SettingsButton() {
  return (
    <View style={Local.container}>
      <TouchableOpacity onPress={() => router.push("/settings")}>
        <Cog size={25} color={Colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const Local = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "flex-end",
  },
  icon: {
    height: 25,
    width: 25,
  },
});
