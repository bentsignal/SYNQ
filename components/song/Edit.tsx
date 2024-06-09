import { Text, View, Image, FlatList, TouchableOpacity } from 'react-native'
import { useGlobalContext } from '@/context/GlobalProvider'

const Edit = ({name, uri}: any) => {
  return (
    <TouchableOpacity>
      <View
        style={{
          height: '100%',
          justifyContent: 'center'
        }}
      >
        <Image 
          source={require('@/assets/icons/edit.png')}
          style={{
            marginLeft: 10,
            marginRight: 10,
            width: 20,
            height: 20
          }}
        />
      </View>
    </TouchableOpacity>
  )
}

export default Edit;