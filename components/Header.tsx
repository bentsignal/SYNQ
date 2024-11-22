import { View, Text, StyleSheet } from "react-native";
import { Styles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";
import BackArrow from "@/components/BackArrow";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { useEffect, useState } from "react";

type HeaderProps = {
  scrollPosition: number;
  title: string;
}

const Header = ({scrollPosition, title}: HeaderProps) => {

  const insets = useSafeAreaInsets();
  const [showHeader, setShowHeader] = useState(false);
  const [height, setHeight] = useState(0);
  const threshold = 300;

  useEffect(() => {
    if (scrollPosition > threshold && !showHeader) {
      setShowHeader(true);
    }
    else if (scrollPosition <= threshold && showHeader) {
      setShowHeader(false);
    }
  }, [scrollPosition]);

  return (
    <>
      <BlurView
        style={[Local.container, Local.blurContainer, {
          paddingTop: insets.top + 2,
          opacity: showHeader ? 1 : 0,
          height: height + 5,
        }]}
        intensity={70}
        tint="dark"
      />
      <View style={[Local.container, Local.arrowContainer, {paddingTop: insets.top + 2}]}>
        <BackArrow />
      </View>
      <View style={[Local.container, Local.nameContainer, {
          paddingTop: insets.top + 2,
          opacity: showHeader ? 1 : 0,
        }]}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setHeight(height);
        }}
      >
        <Text style={Local.title}>{title}</Text>
      </View>
    </>
  );
}

const Local = StyleSheet.create({
  container: {
    // height: 100,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  blurContainer: {
    zIndex: 100,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    opacity: 0,
  },
  arrowContainer: {
    zIndex: 102,
    paddingLeft: 15,
  },
  title: {
    ...Styles.h4,
    color: Colors.text,
    paddingBottom: 10,
  },
  nameContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 101,
  }
});

export default Header;