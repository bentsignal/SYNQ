import { View, Image, TouchableOpacity } from 'react-native';
import { useGlobalContext } from '@/context/GlobalProvider';

const DeleteButton = ({name, id}: {name: string; id: string;}) => {

  const { setShowDelete, setDeleteSong } = useGlobalContext();

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
  );
  
}

export default DeleteButton;