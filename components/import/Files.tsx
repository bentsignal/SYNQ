import { Text, View } from 'react-native'
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

const Files = () => {
  const { homeState, setHomeState } = useGlobalContext();
  return (
    <SafeAreaView style={Styles.body}>
      <Top />
      <PageTitle title='Import Music' />
      <View
        style={{
          alignSelf: 'stretch',
          justifyContent: 'center',
          alignItems: 'center',
          height: '75%',
          marginBottom: 10
        }}
      >
        <Text
          style={Styles.infoText}
        >Content</Text>
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
        />
      </View>
    </SafeAreaView>
  )
}

export default Files;