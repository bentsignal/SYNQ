import { TouchableOpacity, StyleSheet } from "react-native";
import { Stack, router } from "expo-router";
import { useGlobalContext } from "@/context/GlobalProvider";
import { Colors } from "@/constants/Colors";
import Arrow from "@/components/Arrow";

const SettingsLayout = () => {

  const { theme } = useGlobalContext();

  const backArrow = () => {
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

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLeft: () => backArrow(),
        headerStyle: {backgroundColor: Colors.background},
        headerBackTitleVisible: false,
        headerTitleStyle: {color: Colors.text},
        contentStyle: {backgroundColor: 'transparent'},
        headerTintColor: 'white',
      }}
    >
      <Stack.Screen 
        name="index"
        options={{
          headerTitle: 'Settings',
        }}
      />
    </Stack>
  )
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

export default SettingsLayout;