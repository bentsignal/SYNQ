import { Text, View, TouchableOpacity } from 'react-native'
import CustomButton from '@/components/CustomButton'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Redirect } from 'expo-router'

import { Colors } from '@/constants/Colors'

const Welcome = () => {
  if (true) return <Redirect href='/home/' />
  else return (
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
        background={Colors.main}
        handlePress={() => router.replace('home')}
      />
    </SafeAreaView>
  )
}

export default Welcome;