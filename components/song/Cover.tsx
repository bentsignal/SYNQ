import { View, Image,} from 'react-native'
import { InfoType } from '@/constants/Types'

export const ListCover = ({info}: {
  "info": InfoType
}) => {
  if (info.metadata?.artwork) {
    return (
      <Image 
        source={{uri: info.metadata.artwork}}
        style={{
          width: 60,
          height: 60
        }}
      />
    )
  }
  else {
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
}

export const EditCover = (info: {image?: string;}) => {
  if (info.image) {
    return (
      <View
        style={{
          width: 120, 
          height: 120
        }}
      >
        <Image 
          source={{uri: info.image}}
          style={{
            width: 120, 
            height: 120,
            position: 'absolute'
          }}
        />
        <View 
          style={{
            width: 120,
            height: 120,
            position: 'absolute',
            backgroundColor: 'rgba(0, 0, 0, 0.6)'
          }}
        />
        <View
          style={{
            width: 120, 
            height: 120,
            position: 'absolute',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Image 
            source={require('@/assets/icons/edit.png')}
            style={{
              width: 20,
              height: 20
            }}
          />
        </View>
      </View>
      
    )
  }
  else {
    return (
      <View style={{
        backgroundColor: '#D2D2D2',
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Image 
          source={require('@/assets/icons/edit-black.png')}
          style={{
            width: 20,
            height: 20
          }}
        />
      </View>
    )
  }
}
