import { View, Image } from "react-native";
import { useEffect } from 'react';
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";

const Bucket = () => {

  useEffect(() => {
    setTimeout(() => {
      router.push('/(tabs)');
    }, 300);
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