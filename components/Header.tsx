import { View, Text, StyleSheet } from "react-native";
import { Styles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";
import BackArrow from "@/components/BackArrow";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { useEffect, useState } from "react";
import More from "@/components/More";
import { useThemeContext } from "@/context/ThemeProvider";

type HeaderProps = {
  scrollPosition: number;
  title: string;
  showMore?: boolean;
  handleMore?: () => void;
}

const Header = ({scrollPosition, title, showMore, handleMore}: HeaderProps) => {

  const insets = useSafeAreaInsets();
  const { theme } = useThemeContext();
  const [showHeader, setShowHeader] = useState(false);
  const [height, setHeight] = useState(0);
  const threshold = 500;

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
      <View style={[Local.container, {
          paddingTop: insets.top + 2,
        }]}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setHeight(height);
        }}
      >
        <View style={[Local.arrowWrapper, Local.centered]}>
          <BackArrow />
        </View>
        <View style={[Local.titleWrapper, {
          opacity: showHeader ? 1 : 0,
        }]}>
          <Text style={Local.title}>{title}</Text>
        </View>
        <View style={[Local.moreWrapper, Local.centered]}>
          <More 
            color={theme}
            handlePress={handleMore} 
          />
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    zIndex: 102,
  },
  blurContainer: {
    zIndex: 100,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    opacity: 0,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowWrapper: {
    minWidth: 50,
    paddingLeft: 0,
    marginBottom: 10,
  },
  moreWrapper: {
    minWidth: 50,
    paddingBottom: 12,
    maxHeight: 30,
  },
  titleWrapper: {
    // backgroundColor: 'red',
  },
  title: {
    ...Styles.h4,
    color: Colors.text,
    paddingBottom: 10,
  },
});

export default Header;