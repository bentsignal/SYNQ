import { View, Image, TouchableOpacity } from 'react-native'
import { InfoType } from '@/constants/Types'
import { useEffect, useState, useRef } from 'react'
import { Colors } from '@/constants/Colors'
import Loading from '../Loading'

export const ListCover = ({image}: {
  image?: string;
}) => {

  const [src, setSrc] = useState(image ? image : '');
  let dim = src ? 60 : 20;

  useEffect(() => {
    setSrc(image ? image : '');
    dim = src ? 60 : 20;
  }, [image])

  return (
    <View style={{
      backgroundColor: '#D2D2D2',
      width: 60,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Image 
        source={src ? {uri: src} : require('@/assets/icons/music.png')}
        style={{
          width: dim,
          height: dim
        }}
        onLoad={() => {
          return null;
        }}
        onError={(error) => {
          console.log('ERROR: Corrupt list image cover.')
          setSrc('');
        }}
      />
    </View>
  )

}

export const EditCover = ({image, handlePress}: {
  image?: string; 
  handlePress?: () => void;
}) => {

  const [src, setSrc] = useState(image ? image : '');
  const transparent = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/5+hPwABAAEAAFPAfXAAAAAElFTkSuQmCC';

  useEffect(() => {
    setSrc(image ? image : '')
  }, [image])

  return (
    <TouchableOpacity
      onPress={handlePress}
    >
      <View
        style={{
          backgroundColor: '#D2D2D2',
          width: 120, 
          height: 120,
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Image 
          source={src ? {uri: src} : {uri: transparent}}
          style={{
            width: 120, 
            height: 120,
            position: 'absolute'
          }}
          onError={() => {
            setSrc('');
          }}
        />
        <View 
          style={{
            width: 120,
            height: 120,
            position: 'absolute',
            backgroundColor: `rgba(0, 0, 0, ${src ? 0.6 : 0})`
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
            source={src ? require('@/assets/icons/edit.png') : require('@/assets/icons/edit-black.png')}
            style={{
              width: 20,
              height: 20
            }}
          />
        </View>
      </View>
    </TouchableOpacity>
  )

}
