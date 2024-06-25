import { Text, View, Image, FlatList, TouchableOpacity } from 'react-native'

import { useGlobalContext } from '@/context/GlobalProvider'
import { Styles } from '@/constants/Styles'
import { Colors } from '@/constants/Colors'

const DeleteButton = ({name, uri}: any) => {
  const {showDelete, setShowDelete, showEdit, setShowEdit, setDeleteSong } = useGlobalContext();
  return (
    <TouchableOpacity
      onPress={() => {
        setShowDelete(true);
        setDeleteSong({name, uri})
      }}
    >
      <View
        style={{
          height: '100%',
          justifyContent: 'center'
        }}
      >
        <Image 
          source={require('@/assets/icons/delete.png')}
          style={{
            marginLeft: 10,
            marginRight: 5,
            width: 20,
            height: 20,
          }}
        />
      </View>
    </TouchableOpacity>
  )
}

export default DeleteButton;