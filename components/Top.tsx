import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useGlobalContext } from '@/context/GlobalProvider';

const Top = () => {

  const { logo } = useGlobalContext();

  const Local = StyleSheet.create({
    top: {
      width: '90%',
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 10,
      marginBottom: 30
    },
  });

  return (
    <View style={Local.top}>
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