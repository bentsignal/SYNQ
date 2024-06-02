import { Text, View, Image, FlatList, TouchableOpacity } from 'react-native'

import { useGlobalContext } from '@/context/GlobalProvider'
import { Styles } from '@/constants/Styles'
import { Colors } from '@/constants/Colors'
import CustomButton from '@/components/CustomButton'
import { addWhitelistedNativeProps } from 'react-native-reanimated/lib/typescript/ConfigHelper'

export type SongProps = {
  name: string;
  uri: string;
};

const NoCover = () => {
  return (
    <View style={{
      backgroundColor: '#D2D2D2',
      width: 60,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Image 
        source={require('@/assets/icons/music.png')}
        style={{
          width: 20,
          height: 20
        }}
      />
    </View>
  )
}

const Cover = (uri: any) => {
  let cover = false;
  if (cover) {
    return (
      <Image 
        source={require('@/assets/images/damn.jpeg')}
        style={{
          width: 60,
          height: 60
        }}
      />
    )
  }
  else {
    return (
      <NoCover />
    )
  }
}

const SongInfo = ({name, uri}: SongProps) => {
  return (
    <View
      style={{
        flex: 1,
        paddingLeft: 10,
        flexGrow: 1
      }}
    >
      <Text
        style={{
          color: Colors.text,
          fontWeight: 'bold',
          fontSize: 16,
        }}
      >
        {name}
      </Text>
    </View>
  )
}

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
      <Cover uri={uri}/>
      <SongInfo uri={uri} name={name}/>
      <TouchableOpacity>
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
      <TouchableOpacity
        onPress={() => {
          setShowDelete(true);
          setDeleteSong({name, uri})
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
    </View>
  )
}

export default Song