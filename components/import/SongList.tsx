import { Text, View, Image, FlatList, TouchableOpacity } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'

import { useGlobalContext } from '@/context/GlobalProvider'
import { Styles } from '@/constants/Styles'
import { Colors } from '@/constants/Colors'
import CustomButton from '../CustomButton'

type SongProps = {
  name: string;
};

const Song = ({name}: SongProps) => {
  return (
    <View>
      <Text
        style={{
          color: 'white'
        }}
      >
        {name}
      </Text>
    </View>
  )
}

type ItemData = {
  "mimeType": string;
  "name": string;
  "size": Int16Array;
  "uri": string;
};

const renderItem = ({item} : {item: ItemData}) => {
  return (
    <Song 
      name={item.name}
    />
  )
}

const SongList = () => {
  const { fileResults } = useGlobalContext();
  console.log(fileResults);
  return (
    <View
      style={{
        alignSelf: 'stretch',
        alignItems: 'center',
        height: '75%',
        marginBottom: 10
      }}
    >
      <FlatList 
        data={fileResults}
        renderItem={renderItem}
        keyExtractor={item => item.name}
      />
    </View>
  )
}

export default SongList;