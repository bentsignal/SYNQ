import { View, Text, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Styles } from '@/constants/Styles';

const Top = () => {

  return (
    <View style={Styles.top}>
      {/* <View>
        <Text style={Styles.appName}>
          SYNQ
        </Text>
      </View> */}
      <Image 
        source={require('@/assets/icons/logo-color.png')}
        style={{
          height: 25,
          width: 25,
        }}
      />
      <TouchableOpacity
        onPress={() => {
          router.push('/settings')
        }}
      >
        <Image 
          source={require('@/assets/icons/gear.png')}
          style={{
            height: 25,
            width: 25,
          }}
        />
      </TouchableOpacity>
    </View>
  );

}

export default Top;