import { Stack, router } from "expo-router";
import { useThemeContext } from "@/context/ThemeProvider";
import { Colors } from "@/constants/Colors";
import BackArrow from "@/components/BackArrow";

const SettingsLayout = () => {

  const { theme } = useThemeContext();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerLeft: () => <BackArrow />,
        headerStyle: {backgroundColor: Colors.background},
        headerBackVisible: false,
        headerTitleStyle: {color: Colors.text},
        contentStyle: {backgroundColor: 'transparent'},
        headerTintColor: 'white',
      }}
    >
      <Stack.Screen 
        name="index"
        options={{
          headerTitle: 'Settings',
          contentStyle: {backgroundColor: 'transparent'},
        }}
      />
    </Stack>
  )
}

export default SettingsLayout;