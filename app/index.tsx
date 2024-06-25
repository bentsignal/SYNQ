import CustomButton from '@/components/CustomButton'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Redirect } from 'expo-router'
import { useEffect, useState } from 'react'

import { Colors } from '@/constants/Colors'

const Welcome = () => {

  const [show, setShow] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('showWelcome').then((value) => {
      value==='false' ? setShow(false) : setShow(true)
    })
    .catch(() => {
      setShow(true)
    })
  }, [])

  if (show) {
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
          background={Colors.main}
          handlePress={async () => {
            await AsyncStorage.setItem('showWelcome', 'false')
            router.replace('home')
          }}
        />
      </SafeAreaView>
    )
  }
  else {
    return <Redirect href='/home/' />
  }
}

export default Welcome;