import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { Styles } from "@/src/constants/Styles";
import { router } from "expo-router";
import {
  HomeIcon,
  LibraryIcon,
} from "@/src/features/app-shell/components/TabBarIcons";

const TabBar = () => {
  const { height } = useWindowDimensions();
  const tabBarBottomPadding = height < 700 ? 15 : 30;

  return (
    <View
      style={[
        Local.container,
        {
          paddingBottom: tabBarBottomPadding,
        },
      ]}
    >
      <TouchableOpacity 
        style={Local.icon}
        activeOpacity={1}
        onPress={() => router.replace('/')}
      >
        <HomeIcon focused={false} />
        <Text style={Styles.tabBarLabel}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={Local.icon}
        activeOpacity={1}
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
    marginTop: 7,
  },
});

export default TabBar;
