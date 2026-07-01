import Sheet from "@/src/features/action-sheet/components";
import { useSheetScroll } from "@/src/features/action-sheet/hooks/use-sheet-scroll";
import { Dimensions, ScrollView } from "react-native";
import SongSheetHeader from "./SongSheetHeader";
import SongOptions from "./SongOptions";

type SongActionSheetProps = {
  library?: boolean;
  name: string;
};

export default function SongActionSheet({
  library = false,
  name,
}: SongActionSheetProps) {
  const { handleSheetChange, scrollEnabled, scrollRef } = useSheetScroll();

  return (
    <Sheet name={name} onChange={handleSheetChange}>
      <SongSheetHeader />
      <ScrollView
        ref={scrollRef}
        scrollEnabled={scrollEnabled}
        style={{
          height: Dimensions.get("window").height,
        }}
        contentContainerStyle={{
          paddingBottom: 300,
        }}
      >
        <SongOptions name={name} library={library} />
      </ScrollView>
    </Sheet>
  );
}
