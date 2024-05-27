import { Text, View, TouchableOpacity } from 'react-native'
import { CustomButton } from '@/components/CustomButton'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

import { Colors } from '@/constants/Colors'

const Welcome = () => {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background
      }}
    >
      <CustomButton 
        title='Begin'
        background={Colors.green}
        handlePress={() => router.replace('home')}
      />
    </SafeAreaView>
  )
}

export default Welcome;