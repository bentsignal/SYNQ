import { TouchableOpacity, StyleSheet, Image } from "react-native";
import { useState, useEffect } from "react";
import { Colors } from "@/src/constants/Colors";
import { useActiveTrack } from "react-native-track-player";
import { usePlaybackContext } from "@/src/features/playback/context/PlaybackProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import usePlayer from "@/src/features/playback/hooks/use-player";

interface ShuffleButtonProps {
  primary?: string;
  useBG?: boolean;
}

const ShuffleButton = ({ primary, useBG }: ShuffleButtonProps) => {

  const { shuffle, setShuffle, sourceType, sourceId } = usePlaybackContext();
  const { updateQueue } = usePlayer();
  const track = useActiveTrack();
  const [localState, setLocalState] = useState(shuffle);

  const tint = primary ? primary : 'rgba(20, 20, 20, 0.5)';

  const handlePress = async () => {
    const previous = shuffle;
    try {
      const newValue = !previous;
      setLocalState(newValue);
      setShuffle(newValue);
      await AsyncStorage.setItem('shuffle', newValue.toString());
      const id = track?.id;
      if (id && sourceType !== null && sourceId !== null) {
        await updateQueue(id, newValue, sourceType, sourceId);
      }
    } 
    catch {
      setShuffle(previous);
      setLocalState(previous);
      await AsyncStorage.setItem('shuffle', previous.toString());
    }
  }

  useEffect(() => {
    if (shuffle !== localState) {
      setLocalState(shuffle);
    }
  }, [localState, shuffle]);

  return (
    <TouchableOpacity
      style={{
        padding: useBG ? 5 : 0,
        backgroundColor: localState && useBG ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
        borderRadius: 5,
      }}
      activeOpacity={0.7}
      onPress={handlePress}
    >
      <Image 
        source={require('@/src/assets/icons/shuffle.png')}
        style={[Local.image, {
          tintColor: localState ? tint : Colors.text,
        }]}
        resizeMode='contain'
      />
    </TouchableOpacity>
  )
}

const Local = StyleSheet.create({
  image: {
    width: 30,
    height: 30,
  },
});

export default ShuffleButton;
