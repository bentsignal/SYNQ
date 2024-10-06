import { Text, View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { InfoType } from '@/constants/Types';
import { Styles } from '@/constants/Styles';

const SongInfo = ({info, name, showAlbum}: {info: InfoType, name: string, showAlbum?: boolean}) => {

  const Local = StyleSheet.create({
    infoContainer: {
      flex: 1,
      paddingLeft: 10,
      flexGrow: 1
    },
    title: {
      ...Styles.h5,
      color: Colors.text
    },
    artistAlbum: {
      ...Styles.sub,
      color: Colors.text
    }
  });

  if (info.metadata?.artist && info.metadata?.name && info.metadata?.album) {
    return (
      <View style={ Local.infoContainer }>
        <Text
          style={ Local.title }
          numberOfLines={1}
        >
          {info.metadata.name}
        </Text>
        <Text
          style={ Local.artistAlbum }
          numberOfLines={1}
        >
          {info.metadata.artist} {showAlbum && info.metadata.album ? `· ${info.metadata.album}` : ''}
        </Text>
      </View>
    );
  }
  else {
    return (
      <View style={ Local.infoContainer }>
        <Text
          style={ Local.title }
          numberOfLines={1}
        >
          {name}
        </Text>
      </View>
    );
  }

}

export default SongInfo;