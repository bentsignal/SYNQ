import { Stack } from "expo-router";
import { Colors } from "@/constants/Colors";

const StackLayout = () => {

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: Colors.background
        },
        gestureEnabled: true,
        gestureDirection: 'horizontal'
      }}
    >
      <Stack.Screen 
        name="index"
        options={{
          headerShown: false,
          animation: 'none'
        }}
      />
    </Stack>
  );

}

export default StackLayout;