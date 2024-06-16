import { Text, View, Image, FlatList, TouchableOpacity } from 'react-native'
import { useGlobalContext } from '@/context/GlobalProvider'
import { InfoType } from '@/lib/Types';

const Edit = ({name, uri, data, info}: {
  name: string;
  uri: string;
  data: string;
  info: InfoType;
}) => {
  const { showEdit, setShowEdit, editSong, setEditSong } = useGlobalContext();
  return (
    <TouchableOpacity
      onPress={() => {
        setShowEdit(true);
        setEditSong({name, uri, data, info})
      }}
    >
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