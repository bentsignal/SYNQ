import { View, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useState, useEffect } from "react";
import { Colors } from "@/src/constants/Colors";
import { useActiveTrack } from "react-native-track-player";
import { updateQueue } from "@/lib/controllers/PlayerController";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { usePlaybackContext } from "@/src/context/PlaybackProvider";

interface ShuffleButtonProps {
  primary?: string;
  useBG?: boolean;
}

const ShuffleButton = ({ primary, useBG }: ShuffleButtonProps) => {

  const { theme } = useThemeContext();
  const { shuffle, setShuffle, sourceType, sourceId } = usePlaybackContext();
  const track = useActiveTrack();

  const [localState, setLocalState] = useState(shuffle);

  const tint = primary ? primary : 'rgba(20, 20, 20, 0.5)';

  const handlePress = async () => {
    const previous = shuffle;
    try {
      const newValue = !previous;
      setLocalState(newValue);
      const id = track ? track.id : -1;
      await updateQueue(id, newValue, theme, sourceType, sourceId);
      setShuffle(newValue);
    } catch (error) {
      setShuffle(previous);
      setLocalState(previous);
    }
  }

  useEffect(() => {
    setLocalState(shuffle);
  }, [shuffle]);

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