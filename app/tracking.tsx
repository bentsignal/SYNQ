import { View, Text, Image, Linking, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Styles } from '@/constants/Styles';
import LinearGradient from 'react-native-linear-gradient';
import { router } from 'expo-router';
import CustomButton from '@/components/CustomButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { requestTrackingPermissionsAsync, getTrackingPermissionsAsync } from 'expo-tracking-transparency';

const Tracking = () => {

  const insets = useSafeAreaInsets();

  const learn = () => {
    Linking.openURL('https://directedbyshawn.com/synq-privacy-policy');
  }

  const handleRequest = async () => {
    try {
      const status = await getTrackingPermissionsAsync();
      if (status) {
        await requestTrackingPermissionsAsync();
        router.replace('/(tabs)');
      }
      else {
        await requestTrackingPermissionsAsync();
        router.replace('/(tabs)');
      }
    }
    catch {
      router.replace("/(tabs)");
    }
  }

  const Local = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'center',
      backgroundColor: Colors.background
    },
    description: {
      fontSize: 16,
      color: Colors.infoText,
      marginBottom: 20,
      width: '100%',
    },
    imageContainer: {
      width: '100%',
      height: '30%',
      position: 'relative',
    },
    coverImage: {
      width: '100%',
      height: '100%',
    },
    gradient: {
      position: 'absolute', 
      bottom: 0,
      width: '100%', 
      height: '40%',
    },
    infoContainer: {
      width: '90%',
      alignItems: 'center',
      justifyContent: 'flex-start',
      flex: 1,
      marginTop: 10,
    },
    title: {
      color: Colors.text,
      width: '100%',
      marginBottom: 10,
    },
    buttonWrapper: {
      gap: 10,
      flex: 1,
      width: '100%',
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginBottom: insets.bottom + 10,
    }
  });
  
  return (
    <View style={Local.container}>
      <View style={Local.imageContainer}>
        <Image 
          source={require('@/src/assets/images/premium-bg-downscaled.jpg')}
          style={Local.coverImage}
          resizeMode='cover'
        />
        <LinearGradient
          style={Local.gradient}
          colors={['rgba(16, 16, 16, 0)', 'rgba(16, 16, 16, 1)']}
          pointerEvents={'none'}
        />
      </View>
      <View style={Local.infoContainer}>
        <Text
          style={[Styles.h3, Local.title]}
        >
          Allow <Text style={{color: Colors.main}}>SYNQ</Text> to 
          use your app and website activity?
        </Text>
        <Text style={Local.description}>
          While we do have to serve ads, we don't want to be annoying. To 
          provide a better experience, we can use activity provided by other 
          apps and websites on your device to provide a more personalized experience.
        </Text>
        <Text style={Local.description}>
          <Text style={{color: Colors.main}} onPress={learn}>Learn more</Text> about how
           we limit our use of your activity if you choose to decline this setting. 
        </Text>
        <View style={Local.buttonWrapper}>
          <CustomButton
            title={'Continue'}
            background={Colors.main}
            handlePress={handleRequest}
            buttonWidth={'100%'}
          />
        </View>
      </View>
    </View>
  );

}

export default Tracking;