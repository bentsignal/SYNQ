import Sheet from "@/src/features/action-sheet/components";
import { useSheetScroll } from "@/src/features/action-sheet/hooks/use-sheet-scroll";
import { type CoverType } from "@/src/constants/Types";
import { type ReactNode } from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import EntitySheetHeader from "./EntitySheetHeader";

type EntityActionSheetProps = {
  children: ReactNode;
  coverType: CoverType;
  id?: number;
  image?: string;
  name: string;
  subtitle?: string | number | null;
  title?: string | null;
};

export default function EntityActionSheet({
  children,
  coverType,
  id,
  image,
  name,
  subtitle,
  title,
}: EntityActionSheetProps) {
  const { handleSheetChange, scrollEnabled, scrollRef } = useSheetScroll();
  const { height } = useWindowDimensions();

  return (
    <Sheet name={name} onChange={handleSheetChange}>
      <EntitySheetHeader
        coverType={coverType}
        id={id}
        image={image}
        subtitle={subtitle}
        title={title}
      />
      <ScrollView
        ref={scrollRef}
        scrollEnabled={scrollEnabled}
        style={{
          height,
        }}
        contentContainerStyle={{
          paddingBottom: 300,
        }}
      >
        {children}
      </ScrollView>
    </Sheet>
  );
}
