import { Text, View, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { Colors } from '@/constants/Colors';
import { InfoType } from '@/constants/Types';
import { Styles } from '@/constants/Styles';

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

  if (info && info.metadata?.artist && info.metadata?.name) {
    return (
      <View style={ Local.infoContainer }>
        <Text
          style={ titleStyles ? titleStyles : Local.title }
          numberOfLines={1}
        >
          {info.metadata?.name}
        </Text>
        <Text
          style={ artistStyles ? artistStyles : Local.artistAlbum }
          numberOfLines={1}
        >
          {info.metadata?.artist} {showAlbum && info.metadata.album ? `· ${info.metadata.album}` : ''}
        </Text>
      </View>
    );
  }
  else {
    return (
      <View style={ Local.infoContainer }>
        <Text
          style={ titleStyles ? titleStyles : Local.title }
          numberOfLines={1}
        >
          {info.metadata?.name ? info.metadata.name : name}
        </Text>
      </View>
    );
  }

}

export default SongInfo;