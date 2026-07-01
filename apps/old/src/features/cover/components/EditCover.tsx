import { Colors } from "@/src/constants/Colors";
import { CoverType } from "@/src/constants/Types";
import {
  transparentEditCoverSource,
  useEditCoverSource,
} from "@/src/features/cover/hooks/use-edit-cover-source";
import { SquarePen } from "lucide-react-native";
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import FastImage from "react-native-fast-image";

const EditCover = ({
  image,
  id,
  type,
  handlePress,
  propOnLoad,
}: {
  image?: string;
  id?: number;
  type: CoverType;
  handlePress: () => void;
  propOnLoad: () => void;
}) => {
  const { handleError, handleLoad, loaded, opacityRef, src } =
    useEditCoverSource({
      id,
      image,
      onLoad: propOnLoad,
      type,
    });

  const editCoverSize = 140;

  const Local = StyleSheet.create({
    container: {
      backgroundColor: "#D2D2D2",
      width: editCoverSize,
      height: editCoverSize,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: type === CoverType.ARTIST ? 1000 : 12,
      opacity: loaded ? 1 : 0,
    },
    artwork: {
      width: editCoverSize,
      height: editCoverSize,
      position: "absolute",
      borderRadius: type === CoverType.ARTIST ? 1000 : 10,
    },
    tintOverlay: {
      width: type === CoverType.ARTIST ? editCoverSize + 1 : editCoverSize,
      height: type === CoverType.ARTIST ? editCoverSize + 1 : editCoverSize,
      position: "absolute",
      backgroundColor: `rgba(0, 0, 0, ${
        src === transparentEditCoverSource ? 0 : 0.6
      })`,
      borderRadius: type === CoverType.ARTIST ? 1000 : 10,
    },
    iconWrapper: {
      width: editCoverSize,
      height: editCoverSize,
      position: "absolute",
      justifyContent: "center",
      alignItems: "center",
    },
    icon: {
      width: 20,
      height: 20,
    },
  });

  return (
    <TouchableOpacity onPress={handlePress}>
      <Animated.View style={[Local.container, { opacity: opacityRef }]}>
        <FastImage
          source={
            src ? { uri: `${src}` } : { uri: transparentEditCoverSource }
          }
          style={Local.artwork}
          onLoad={handleLoad}
          onError={handleError}
        />
        <View style={Local.tintOverlay} />
        <View style={Local.iconWrapper}>
          <SquarePen
            color={
              src === transparentEditCoverSource ? Colors.song : Colors.text
            }
            size={20}
            style={Local.icon}
          />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default EditCover;
