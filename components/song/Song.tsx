import { View } from 'react-native'

import { useGlobalContext } from '@/context/GlobalProvider'
import { Styles } from '@/constants/Styles'
import { Colors } from '@/constants/Colors'

import SongInfo from '@/components/song/SongInfo'
import EditButton from '@/components/song/EditButton'
import DeleteButton from '@/components/song/DeleteButton'
import { ListCover } from '@/components/song/Cover'

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
      <ListCover info={info}/>
      <SongInfo info={info} name={name}/>
      <EditButton name={name} uri={uri} data={data} info={info}/>
      <DeleteButton name={name} uri={uri}/>
    </View>
  )
}

export default Song