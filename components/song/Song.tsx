import { View } from 'react-native'

import { useGlobalContext } from '@/context/GlobalProvider'
import { Styles } from '@/constants/Styles'
import { Colors } from '@/constants/Colors'

import { SongType } from '@/constants/Types'
import SongInfo from '@/components/song/SongInfo'
import EditButton from '@/components/song/EditButton'
import DeleteButton from '@/components/song/DeleteButton'
import { ListCover } from '@/components/song/Cover'

const Song = ({name, id, data, info}: SongType) => {
  return (
    <View
      style={[Styles.roundedContainer, {
        alignSelf: 'stretch',
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: 80,
        marginBottom: 10,
        backgroundColor: Colors.song,
        padding: 10,
      }]}
    >
      <ListCover image={info.metadata?.artwork ? info.metadata.artwork : ''}/>
      <SongInfo info={info} name={name}/>
      <EditButton name={name} id={id} data={data} info={info}/>
      <DeleteButton name={name} id={id}/>
    </View>
  )
}

export default Song