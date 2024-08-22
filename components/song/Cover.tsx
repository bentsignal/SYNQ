import { View, Image, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';

export const ListCover = ({image, propOnLoad}: {
  image?: string;
  propOnLoad: () => void;
}) => {

  const [src, setSrc] = useState(image ? image : '');
  const [loaded, setLoaded] = useState(false);
  let dim = src ? 60 : 20;

  useEffect(() => {
    setSrc(image ? image : '');
    dim = src ? 60 : 20;
  }, [image]);

  return (
    <View style={{
      backgroundColor: '#D2D2D2',
      width: 60,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
      opacity: loaded ? 1 : 0
    }}>
      <Image 
        source={src ? {uri: src} : require('@/assets/icons/music.png')}
        style={{
          width: dim,
          height: dim,
          borderRadius: src ? 9 : 0,
        }}
        onLoad={() => {
          setLoaded(true);
          propOnLoad()
        }}
        onError={(error) => {
          setSrc('');
          setLoaded(true);
          propOnLoad();
        }}
      />
    </View>
  );

}

export const EditCover = ({image, handlePress}: {
  image?: string; 
  handlePress?: () => void;
}) => {

  const [src, setSrc] = useState(image ? image : '');
  const transparent = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/5+hPwABAAEAAFPAfXAAAAAElFTkSuQmCC';

  useEffect(() => {
    setSrc(image ? image : '')
  }, [image]);

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
          alignItems: 'center',
          borderRadius: 10,
        }}
      >
        <Image 
          source={src ? {uri: src} : {uri: transparent}}
          style={{
            width: 120, 
            height: 120,
            position: 'absolute',
            borderRadius: 10,
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
            backgroundColor: `rgba(0, 0, 0, ${src ? 0.6 : 0})`,
            borderRadius: 10,
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
              height: 20,
            }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

}
