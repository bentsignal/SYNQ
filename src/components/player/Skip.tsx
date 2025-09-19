import { useGlobalContext } from "@/src/context/GlobalProvider";
import { usePremiumContext } from "@/src/context/PremiumProvider";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { playAd } from "@/src/controllers/PlayerController";
import { useHaptics } from "@/src/hooks/use-haptics";
import usePlayer from "@/src/hooks/usePlayer";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { PlayButton } from "./PausePlayButtons";

const Shape = ({ size, color }: { size: number; color?: string }) => {
  return (
    <>
      <PlayButton size={size} color={color} />
      <View style={Local.second}>
        <PlayButton size={size} color={color} />
      </View>
    </>
  );
};

export const SkipRight = ({
  size,
  color,
}: {
  size: number;
  color?: string;
}) => {
  const { adPlaying, adURL, setAdPlaying, shouldPlayAd } = useGlobalContext();

  const { premium } = usePremiumContext();
  const { theme } = useThemeContext();
  const { skipRight } = usePlayer();
  const { sendHaptic } = useHaptics();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={Local.container}
      onPress={async () => {
        if (!premium && shouldPlayAd && !adPlaying) {
          setAdPlaying(true);
          await playAd(theme, adURL);
        } else if (!adPlaying) {
          sendHaptic("light");
          await skipRight();
        }
      }}
    >
      <Shape size={size} color={color} />
    </TouchableOpacity>
  );
};

export const SkipLeft = ({ size, color }: { size: number; color?: string }) => {
  const { premium, adPlaying, theme, adURL, setAdPlaying, shouldPlayAd } =
    useGlobalContext();
  const { skipLeft } = usePlayer();
  const { sendHaptic } = useHaptics();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[Local.flipped, Local.container]}
      onPress={async () => {
        if (!premium && shouldPlayAd && !adPlaying) {
          setAdPlaying(true);
          await playAd(theme, adURL);
        } else if (!adPlaying) {
          sendHaptic("light");
          await skipLeft();
        }
      }}
    >
      <Shape size={size} color={color} />
    </TouchableOpacity>
  );
};

const Local = StyleSheet.create({
  container: {
    flexDirection: "row",
  },
  flipped: {
    transform: [{ rotate: "180deg" }],
  },
  second: {
    transform: [{ translateX: -5 }],
  },
});
