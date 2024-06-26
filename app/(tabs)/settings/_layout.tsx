import { Stack } from "expo-router";
import { Colors } from "@/constants/Colors";

const StackLayout = () => {
  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: Colors.background
        }
      }}
    >
      <Stack.Screen 
        name="index"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="instructions"
        options={{
          headerShown: false
        }}
      />
    </Stack>
  )
}

export default StackLayout;