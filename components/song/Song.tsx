import { View, TouchableOpacity } from 'react-native'
import { useState, useEffect } from 'react'

import { useGlobalContext } from '@/context/GlobalProvider'
import { Styles } from '@/constants/Styles'
import { Colors } from '@/constants/Colors'

import { SongType } from '@/constants/Types'
import SongInfo from '@/components/song/SongInfo'
import EditButton from '@/components/song/EditButton'
import DeleteButton from '@/components/song/DeleteButton'
import Select from '@/components/song/Select';
import { ListCover } from '@/components/song/Cover'

const Song = ({name, id, data, info}: SongType) => {

  const [selected, setSelected] = useState(false);
  const { selectEnabled } = useGlobalContext(); 

  useEffect(() => {
    setSelected(false);
  }, [selectEnabled])

  return (
    <View
      style={[Styles.roundedContainer, {
        alignSelf: 'stretch',
        width: '90%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: 90,
        marginBottom: 10,
        backgroundColor: Colors.song,
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 15,
        paddingBottom: 15,
        opacity: !selectEnabled || (selectEnabled && selected) ? 1 : 0.6
      }]}
    >
      <ListCover image={info.metadata?.artwork ? info.metadata.artwork : ''}/>
      <SongInfo info={info} name={name}/>
      {
        selectEnabled ? 
        <>
          <TouchableOpacity
            onPress={() => {
              setSelected(!selected);
            }}
          >
            <Select active={selected} />
          </TouchableOpacity>
        </> 
        : 
        <>
          <EditButton name={name} id={id} data={data} info={info}/>
          <DeleteButton name={name} id={id}/>
        </>
      }
    </View>
  )

}

export default Song