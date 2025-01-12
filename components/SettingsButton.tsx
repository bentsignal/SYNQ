import { TouchableOpacity, Image, StyleSheet, View } from "react-native";
import { router } from "expo-router";

export default function SettingsButton() {
  return (
    <View style={Local.container}>
      <TouchableOpacity onPress={() => router.push('/settings')}>
        <Image source={require('@/assets/icons/gear.png')} style={Local.icon} />
      </TouchableOpacity>
    </View>
  );
} 

const Local = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-end',
  },
  icon: {
    height: 25,
    width: 25,
  }
});