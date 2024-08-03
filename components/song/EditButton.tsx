import { View, Image, TouchableOpacity } from 'react-native';
import { useGlobalContext } from '@/context/GlobalProvider';
import { SongType } from '@/constants/Types';

const EditButton = ({name, id, data, info}: SongType) => {

  const { setEditSong, setShowEdit } = useGlobalContext();
  
  return (
    <TouchableOpacity
      onPress={() => {
        setEditSong({
          "name": name, 
          "id": id, 
          "data": data, 
          "info": info
        });
        setShowEdit(true);
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
  );

}

export default EditButton;