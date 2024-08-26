import { View, Text, Image, Linking } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Styles } from '@/constants/Styles';
import LinearGradient from 'react-native-linear-gradient';
import { router } from 'expo-router';
import CustomButton from '@/components/CustomButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

const Tracking = () => {

  const insets = useSafeAreaInsets();

  const learn = () => {
    Linking.openURL('https://directedbyshawn.com/synq-privacy-policy');
  }
  
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: Colors.background
      }}
    >
      <View
        style={{
          width: '100%',
          height: '30%',
          position: 'relative',
        }}
      >
        <Image 
          source={require('../assets/images/tracking-bg-downscaled.jpg')}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
        <LinearGradient
          style={{
            position: 'absolute', 
            top: 0,
            width: '100%', 
            height: '100%',
          }}
          colors={['rgba(16, 16, 16, 0)', 'rgba(16, 16, 16, 1)']}
          pointerEvents={'none'}
        />
      </View>
      <View
        style={{
          width: '90%',
          alignItems: 'center',
          justifyContent: 'flex-start',
          flex: 1,
          marginTop: 10,
        }}
      >
        <Text
          style={{
            color: 'white',
            fontSize: 24,
            fontWeight: 'bold',
            width: '100%',
            marginBottom: 10,
          }}
        >
          Allow <Text style={{color: Colors.main}}>SYNQ</Text> to use your app and website activity?
        </Text>
        <Text 
          style={[Styles.infoStepDescription, {
            width: '100%'
          }]}
        >
          While we do have to serve ads, we don't want to be too annoying. To 
          provide a better experience, we can use activity provided by other 
          apps and websites on your device to provide a more personalized experience.
        </Text>
        <Text 
          style={[Styles.infoStepDescription, {
            width: '100%'
          }]}
        >
          <Text style={{color: Colors.main}} onPress={learn}>Learn more</Text> about how we limit our use of
          your activity if you choose to decline this device setting. 
        </Text>
        <View
          style={{
            gap: 10,
            flex: 1,
            width: '100%',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginBottom: insets.bottom + 10,
          }}
        >
          <CustomButton
            title={"Don't Allow"}
            background={Colors.altButton}
            handlePress={() => {
              requestTrackingPermissionsAsync().then((status) => {
                router.push('/(tabs)');
              })
              .catch(() => {
                router.push('/(tabs)');
              })
            }}
            buttonWidth={'100%'}
          />
          <CustomButton
            title={'Allow'}
            background={Colors.main}
            handlePress={() => {
              requestTrackingPermissionsAsync().then((status) => {
                router.push('/(tabs)');
              })
              .catch(() => {
                router.push('/(tabs)');
              });
            }}
            buttonWidth={'100%'}
          />
        </View>
      </View>
    </View>
  );

}

export default Tracking;