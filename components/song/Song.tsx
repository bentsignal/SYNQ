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
  "name": string;
  "uri": string;
  "data": string;
  "info": {
    "fileType"?: string;
    "format"?: string;
    "metadata"?: {
      "album"?: string;
      "artist"?: string;
      "artwork"?: string;
      "name"?: string;
    }
  }
};

const Song = ({name, uri, data, info}: SongProps) => {
  console.log(info)
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
      <Cover info={info}/>
      <SongInfo info={info} name={name}/>
      <Edit name={name} uri={uri}/>
      <Delete name={name} uri={uri}/>
    </View>
  )
}

export default Song