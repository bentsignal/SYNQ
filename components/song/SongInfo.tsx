import { Text, View, Image, FlatList, TouchableOpacity } from 'react-native'

import { useGlobalContext } from '@/context/GlobalProvider'
import { Styles } from '@/constants/Styles'
import { Colors } from '@/constants/Colors'

const SongInfo = ({tags, name}: any) => {
  
  return (
    <View
      style={{
        flex: 1,
        paddingLeft: 10,
        flexGrow: 1
      }}
    >
      <Text
        style={{
          color: Colors.text,
          fontWeight: 'bold',
          fontSize: 16,
        }}
      >
        {name}
      </Text>
    </View>
  )
}

export default SongInfo