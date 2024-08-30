import { View, Image } from "react-native";
import { useEffect } from 'react';
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import { getTrackingPermissionsAsync } from "expo-tracking-transparency";

const Bucket = () => {

  useEffect(() => {

    const checkTrackingRequested = async () => {
      try {
        const { status } = await getTrackingPermissionsAsync();
        return status
      }
      catch {
        return 'undetermined';
      }
    }

    checkTrackingRequested().then((status) => {
      if (status === 'undetermined') {
        router.push('/tracking');
      }
      else {
        router.push('/(tabs)');
      }
    })
    .catch((error) => {
      router.push('/(tabs)');
    });

  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background
      }}
    >
      <Image
        style={{
          width: '100%'
        }}
        resizeMode="contain"
        source={require('../assets/images/splash.png')}
      />
    </View>
  );
}

export default Bucket;