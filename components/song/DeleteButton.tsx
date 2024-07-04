import { Text, View, Image, FlatList, TouchableOpacity } from 'react-native'

import { useGlobalContext } from '@/context/GlobalProvider'
import { Styles } from '@/constants/Styles'
import { Colors } from '@/constants/Colors'

const DeleteButton = ({name, id}: {name: string; id: string;}) => {

  const {

    // show/hide modal
    setShowDelete, 
    
    // song being deleted
    setDeleteSong 
    
  } = useGlobalContext();

  return (
    <TouchableOpacity
      onPress={() => {
        setShowDelete(true);
        setDeleteSong({name, id})
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