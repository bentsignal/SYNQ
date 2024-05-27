import { Text, View, TouchableOpacity } from 'react-native'
import { MainButton } from '@/components/MainButton'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

import { Colors } from '@/constants/Colors'

const Welcome = () => {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <MainButton 
        title='Begin'
        handlePress={() => router.replace('home')}
      />
    </SafeAreaView>
  )
}

export default Welcome;