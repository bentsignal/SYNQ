import { Stack, router } from "expo-router";
import { useThemeContext } from "@/context/ThemeProvider";
import { Colors } from "@/constants/Colors";
import BackArrow from "@/components/BackArrow";

const SettingsLayout = () => {

  const { theme } = useThemeContext();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLeft: () => <BackArrow />,
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

export default SettingsLayout;