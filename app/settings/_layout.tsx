import { Stack, router } from "expo-router";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { Colors } from "@/src/constants/Colors";
import BackArrow from "@/src/components/BackArrow";

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
      <Stack.Screen 
        name="backup"
        options={{
          headerShown: false,
          contentStyle: {backgroundColor: 'transparent'},
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="customization"
        options={{
          headerShown: false,
          contentStyle: {backgroundColor: 'transparent'},
          presentation: 'modal',
        }}
      />
    </Stack>
  )
}

export default SettingsLayout;