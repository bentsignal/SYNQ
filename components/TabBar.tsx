import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Styles } from "@/constants/Styles";
import { router } from "expo-router";
import { LibraryIcon, HomeIcon } from "./TabBarIcons";

const TabBar = () => {
  return (
    <View style={Local.container}>
      <TouchableOpacity 
        style={Local.icon}
        onPress={() => router.replace('/')}
      >
        <HomeIcon focused={false} />
        <Text style={Styles.tabBarLabel}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={Local.icon}
        onPress={() => router.replace('/library')}
      >
        <LibraryIcon focused={false} />
        <Text style={Styles.tabBarLabel}>Library</Text>
      </TouchableOpacity>
    </View>
  );
}

const Local = StyleSheet.create({
  container: {
    ...Styles.tabBar,
    width: '100%',
    flexDirection: 'row',
  },
  icon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    marginTop: 5,
  },
});

export default TabBar;