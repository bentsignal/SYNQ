import { Text, View, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { Colors } from '@/src/constants/Colors';
import { InfoType } from '@/src/constants/Types';
import { Styles } from '@/src/constants/Styles';

const SongInfo = ({info, name, showAlbum, color, titleStyles, artistStyles}: {
  info: InfoType, 
  name: string, 
  showAlbum?: boolean,
  color?: string,
  titleStyles?: StyleProp<TextStyle>,
  artistStyles?: StyleProp<TextStyle>,
}) => {

  const Local = StyleSheet.create({
    infoContainer: {
      flex: 1,
      paddingLeft: 10,
      flexGrow: 1,
      justifyContent: 'center'
    },
    title: {
      ...Styles.h5,
      color: color ? color : Colors.text,
    },
    artistAlbum: {
      ...Styles.sub,
      color: color ? color : Colors.infoText,
      fontWeight: '500',
    }
  });

  return (
    <View style={ Local.infoContainer }>
      <Text
        style={ titleStyles ? titleStyles : Local.title }
        numberOfLines={1}
      >
        {info.metadata?.name ? info.metadata.name : name}
      </Text>
      <Text
        style={[artistStyles ? artistStyles : Local.artistAlbum, {
          display: info.metadata?.artist ? 'flex' : 'none'
        }]}
        numberOfLines={1}
      >
        {info.metadata?.artist} {showAlbum && info.metadata.album ? `· ${info.metadata.album}` : ''}
      </Text>
    </View>
  );

}

export default SongInfo;