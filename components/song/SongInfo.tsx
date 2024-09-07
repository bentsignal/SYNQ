import { Text, View } from 'react-native';
import { Colors } from '@/constants/Colors';
import { InfoType } from '@/constants/Types';
import { Styles } from '@/constants/Styles';

const SongInfo = ({info, name}: {info: InfoType, name: string}) => {

  if (info.metadata?.artist && info.metadata?.name && info.metadata?.album) {
    return (
      <View
        style={{
          flex: 1,
          paddingLeft: 10,
          flexGrow: 1
        }}
      >
        <Text
          style={[Styles.h5, { color: Colors.text}]}
          numberOfLines={1}
        >
          {info.metadata.name}
        </Text>
        <Text
          style={[Styles.sub, { color: Colors.text }]}
          numberOfLines={1}
        >
          {info.metadata.artist} {info.metadata.album ? `· ${info.metadata.album}` : ''}
        </Text>
      </View>
    );
  }
  else {
    return (
      <View
        style={{
          flex: 1,
          paddingLeft: 10,
          flexGrow: 1
        }}
      >
        <Text
          style={[Styles.h5, { color: Colors.text }]}
          numberOfLines={1}
        >
          {name}
        </Text>
      </View>
    );
  }

}

export default SongInfo;