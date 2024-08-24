import { View, Text, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Styles } from '@/constants/Styles';
import { useGlobalContext } from '@/context/GlobalProvider';

const Top = () => {

  const { logo } = useGlobalContext();

  return (
    <View style={Styles.top}>
      <Image 
        source={logo}
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