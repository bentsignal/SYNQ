import { View, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useState, useEffect } from "react";
import { Colors } from "@/constants/Colors";
import { useActiveTrack } from "react-native-track-player";
import { updateQueue } from "@/lib/controllers/PlayerController";
import { useThemeContext } from "@/context/ThemeProvider";
import { usePlaybackContext } from "@/context/PlaybackProvider";

const ShuffleButton = ({ primary }: { primary?: string }) => {

  const { theme } = useThemeContext();
  const { shuffle, setShuffle, sourceType, sourceId } = usePlaybackContext();
  const track = useActiveTrack();

  const [localState, setLocalState] = useState(shuffle);

  const tint = primary ? primary : theme;

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
      style={Local.container}
      activeOpacity={0.7}
      onPress={handlePress}
    >
      <Image 
        source={require('@/assets/icons/shuffle.png')}
        style={[Local.image, {
          tintColor: localState ? tint : Colors.text,
        }]}
        resizeMode='contain'
      />
    </TouchableOpacity>
  )
}

const Local = StyleSheet.create({
  container: {
    paddingVertical: 5,
  },
  image: {
    width: 30,
    height: 30,
  },
});

export default ShuffleButton;