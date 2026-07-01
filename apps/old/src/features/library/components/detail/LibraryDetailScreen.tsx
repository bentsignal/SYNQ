import { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Overlay from "@/src/features/app-shell/components/Overlay";
import { useAppShellContext } from "@/src/features/app-shell/context/AppShellProvider";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import Header from "@/src/features/library/components/Header";

type LibraryDetailScreenProps = {
  children: ReactNode;
  handleMore: () => void;
  scrollPosition: number;
  title: string;
};

export default function LibraryDetailScreen({
  children,
  handleMore,
  scrollPosition,
  title,
}: LibraryDetailScreenProps) {
  const { showOverlay } = useAppShellContext();

  return (
    <View style={Local.wrapper}>
      <View style={Local.container}>
        <Header
          scrollPosition={scrollPosition}
          title={title}
          showMore={true}
          handleMore={handleMore}
        />
        <Overlay show={showOverlay} activeOpacity={0.95} />
        {children}
      </View>
    </View>
  );
}

const Local = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "black",
  },
  container: {
    ...Styles.body,
    flex: 1,
    backgroundColor: Colors.background,
  },
});
