import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useGlobalContext } from '@/context/GlobalProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Top = () => {

  const { logo } = useGlobalContext();
  
  const insets = useSafeAreaInsets();

  const Local = StyleSheet.create({
    container: {
      width: '90%',
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 10 + insets.top,
      marginBottom: 30
    },
    icon: {
      height: 25,
      width: 25,
    }
  });

  return (
    <View style={Local.container}>
      <Image 
        source={logo}
        style={Local.icon}
      />
      <TouchableOpacity onPress={() => router.push('/Settings')}>
        <Image 
          source={require('@/assets/icons/gear.png')}
          style={Local.icon}
        />
      </TouchableOpacity>
    </View>
  );

}

export default Top;