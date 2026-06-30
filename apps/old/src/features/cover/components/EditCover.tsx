import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Colors } from "@/src/constants/Colors";
import { CoverType } from "@/src/constants/Types";
import { getLibrarySongCoverPath } from "@/src/features/library/repository/library-song-repository";
import { SquarePen } from "lucide-react-native";
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import FastImage from "react-native-fast-image";

const transparent =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/5+hPwABAAEAAFPAfXAAAAAElFTkSuQmCC";

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
  const opacityRef = useRef(new Animated.Value(0)).current;
  const [src, setSrc] = useState(image ? image : transparent);
  const [loaded, setLoaded] = useState(false);

  const revealImage = useCallback(() => {
    Animated.timing(opacityRef, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [opacityRef]);

  const getImage = useCallback(async () => {
    try {
      if (image) {
        setSrc(image);
        revealImage();
        return;
      }

      if (id === undefined) {
        setSrc(transparent);
        revealImage();
        return;
      }

      if (type === CoverType.SONG) {
        const path = await getLibrarySongCoverPath(id);
        if (path) {
          setSrc(path);
        } else {
          setSrc(transparent);
        }
      } else {
        setSrc(transparent);
      }
      revealImage();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("folder")) {
        console.log("error getting cover image for edit cover:", message);
      }
      revealImage();
    }
  }, [id, image, revealImage, type]);

  useLayoutEffect(() => {
    getImage();
  }, [getImage]);

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
      backgroundColor: `rgba(0, 0, 0, ${src === transparent ? 0 : 0.6})`,
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
          source={src ? { uri: `${src}` } : { uri: transparent }}
          style={Local.artwork}
          onLoad={() => {
            setLoaded(true);
            propOnLoad();
          }}
          onError={() => {
            setSrc("");
            setLoaded(true);
            propOnLoad();
          }}
        />
        <View style={Local.tintOverlay} />
        <View style={Local.iconWrapper}>
          <SquarePen
            color={src === transparent ? Colors.song : Colors.text}
            size={20}
            style={Local.icon}
          />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default EditCover;
