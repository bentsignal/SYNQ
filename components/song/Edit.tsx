import { View, Image, TouchableOpacity } from 'react-native'
import { useGlobalContext } from '@/context/GlobalProvider'
import { InfoType } from '@/constants/Types';

const Edit = ({name, uri, data, info}: {
  name: string;
  uri: string;
  data: string;
  info: InfoType;
}) => {
  const { setShowEdit, setEditSong, setEditTitle, setEditArtist,
    setEditAlbum, setEditArtwork
   } = useGlobalContext();
  return (
    <TouchableOpacity
      onPress={() => {
        setEditTitle(info.metadata?.name ? info.metadata.name : '')
        setEditArtist(info.metadata?.artist ? info.metadata.artist : '')
        setEditAlbum(info.metadata?.album ? info.metadata.album : '')
        setEditArtwork(info.metadata?.artwork ? info.metadata.artwork : '')
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
  )
}

export default Edit;