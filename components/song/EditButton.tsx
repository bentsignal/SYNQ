import { View, Image, TouchableOpacity } from 'react-native'
import { useGlobalContext } from '@/context/GlobalProvider'
import { InfoType } from '@/constants/Types';

const EditButton = ({name, uri, data, info}: {
  name: string;
  uri: string;
  data: string;
  info: InfoType;
}) => {
  const { 
    setEditSong, setShowEdit, 
    setEditTitle, setEditArtist, 
    setEditAlbum, setEditArtwork,
    setEditFilename, setEditURI,
    setEditData, setEditLoad
   } = useGlobalContext();
  return (
    <TouchableOpacity
      onPress={() => {
        setEditSong({name, uri, data, info})
        setEditFilename(name);
        setEditURI(uri);
        setEditData(data);
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

export default EditButton;