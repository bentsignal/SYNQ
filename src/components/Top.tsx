import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useThemeContext } from '@/src/context/ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Top() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ marginTop: insets.top + 10 }} />
  );
}

// export default function Top() {

//   const { logo } = useThemeContext();
  
//   const insets = useSafeAreaInsets();

//   return (
//     <View style={[Local.container, { marginTop: insets.top + 10 }]}>
//       <Image 
//         source={logo}
//         style={Local.icon}
//       />
//       <TouchableOpacity onPress={() => router.push('/settings')}>
//         <Image 
//           source={require('@/src/assets/icons/gear.png')}
//           style={Local.icon}
//         />
//       </TouchableOpacity>
//     </View>
//   );

// }

// const Local = StyleSheet.create({
//   container: {
//     width: '90%',
//     alignSelf: 'center',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 30
//   },
//   icon: {
//     height: 25,
//     width: 25,
//   }
// });