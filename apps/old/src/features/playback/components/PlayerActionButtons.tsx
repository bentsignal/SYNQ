import { Colors } from "@/src/constants/Colors";
import colors from "@/src/lib/colors";
import { CirclePlus, Ellipsis } from "lucide-react-native";
import { StyleSheet, TouchableOpacity } from "react-native";

type PlayerActionButtonsProps = {
  onAddToPlaylist: () => void;
  onMore: () => void;
};

const PlayerActionButtons = ({
  onAddToPlaylist,
  onMore,
}: PlayerActionButtonsProps) => {
  return (
    <>
      <TouchableOpacity onPress={onAddToPlaylist} style={Local.addWrapper}>
        <CirclePlus size={25} style={Local.add} />
      </TouchableOpacity>
      <TouchableOpacity className="p-3" onPress={onMore}>
        <Ellipsis color={colors.foreground} />
      </TouchableOpacity>
    </>
  );
};

const Local = StyleSheet.create({
  add: {
    width: 25,
    height: 25,
    color: Colors.text,
  },
  addWrapper: {
    paddingLeft: 10,
    paddingRight: 5,
    paddingVertical: 5,
  },
});

export default PlayerActionButtons;
