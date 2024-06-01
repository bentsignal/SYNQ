import { Text, View, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

import { useGlobalContext } from '@/context/GlobalProvider'
import { Styles } from '@/constants/Styles'
import { Colors } from '@/constants/Colors'
import PageTitle from '@/components/PageTitle'
import Top from '@/components/Top'
import ImportOption from '@/components/import/ImportOption'
import ImportInstructions from '@/components/import/ImportInstructions'
import CustomButton from '../CustomButton'

const WiFi = () => {
  const { homeState, setHomeState } = useGlobalContext();
  return (
    <SafeAreaView style={Styles.body}>
      <Top />
      <PageTitle title='Import Music' />
      <ImportInstructions
        title='On your computer, visit:'
        desc='http://192.168.1.12:8080'
        icon={require('@/assets/icons/wifi.png')}
        handlePress={() => {}}
      />
      <View
        style={{
          alignSelf: 'stretch',
          justifyContent: 'center',
          alignItems: 'center',
          height: '60%',
          marginBottom: 10
        }}
      >
        <Text
          style={Styles.infoText}
        >
          songs will appear here once uploaded
        </Text>
        <ActivityIndicator style={{
          padding: 20
        }}/>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10
        }}
      >
        <CustomButton 
          title='Cancel'
          background={Colors.text}
          handlePress={() => setHomeState(0)}
        />
        <CustomButton 
          title='Import'
          background={Colors.green}
          handlePress={() => {
            router.replace('/library');
            setHomeState(0);
          }}
          disabled={true}
        />
      </View>
    </SafeAreaView>
  )
}

export default WiFi;