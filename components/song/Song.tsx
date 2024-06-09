import { Text, View, Image, FlatList, TouchableOpacity } from 'react-native'

import { useGlobalContext } from '@/context/GlobalProvider'
import { Styles } from '@/constants/Styles'
import { Colors } from '@/constants/Colors'
import SongInfo from '@/components/song/SongInfo'
import Edit from '@/components/song/Edit'
import Delete from '@/components/song/Delete'
import CustomButton from '@/components/CustomButton'
import Cover from '@/components/song/Cover'

export type SongProps = {
  name: string;
  uri: string;
};

const Song = ({name, uri}: SongProps) => {
  const {showDelete, setShowDelete, showEdit, setShowEdit, setDeleteSong } = useGlobalContext();
  return (
    <View
      style={{
        alignSelf: 'stretch',
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: 60,
        marginBottom: 5
      }}
    >
      <Cover />
      <SongInfo tags={{}} name={name}/>
      <Edit />
      <Delete name={name} uri={uri}/>
    </View>
  )
}

export default Song