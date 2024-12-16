import { View, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useState, useEffect } from "react";
import { Colors } from "@/constants/Colors";
import { useActiveTrack } from "react-native-track-player";
import { updateQueue } from "@/lib/controllers/PlayerController";
import { useThemeContext } from "@/context/ThemeProvider";
import { usePlaybackContext } from "@/context/PlaybackProvider";

interface LoopButtonProps {
  primary?: string;
  useBG?: boolean;
}

const LoopButton = ({ primary, useBG }: LoopButtonProps) => {

  const { theme } = useThemeContext();
  const { loop, setLoop, sourceType, sourceId } = usePlaybackContext();
  const track = useActiveTrack();

  const [localState, setLocalState] = useState(loop);

  const tint = primary ? primary : 'rgba(20, 20, 20, 0.5)';

  const handlePress = async () => {
    const previous = loop;
    try {
      const newValue = !previous;
      setLocalState(newValue);
      const id = track ? track.id : -1;
      await updateQueue(id, newValue, theme, sourceType, sourceId);
      setLoop(newValue);
    } catch (error) {
      setLoop(previous);
      setLocalState(previous);
    }
  }

  useEffect(() => {
    setLocalState(loop);
  }, [loop]);

  return (
    <TouchableOpacity
      style={{
        padding: useBG ? 5 : 0,
        backgroundColor: localState && useBG ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      activeOpacity={0.7}
      onPress={handlePress}
    >
      <Image 
        source={require('@/assets/icons/loop.png')}
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

export default LoopButton;