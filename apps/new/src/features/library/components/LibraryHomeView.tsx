import { ScrollView, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryHomeController } from "../hooks/use-library-home-controller";
import { getLibraryHomeHeaderState } from "../services/library-home-service";
import { LibraryCollectionPreviewSection } from "./LibraryCollectionPreviewSection";
import { LibraryHomeHeader } from "./LibraryHomeHeader";
import { LibrarySongPreviewList } from "./LibrarySongPreviewList";
import { LibrarySummaryGrid } from "./LibrarySummaryGrid";

type LibraryHomeViewProps = LibraryHomeController;

export function LibraryHomeView({
  collectionPreview,
  order,
  query,
  setOrder,
  setQuery,
  setSort,
  songPreview,
  sort,
  statusState,
  summary,
}: LibraryHomeViewProps) {
  const theme = useCustomizationTheme();
  const headerState = getLibraryHomeHeaderState();

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-5 px-5 py-14"
      style={{ backgroundColor: theme.background }}
    >
      <LibraryHomeHeader headerState={headerState} theme={theme} />

      <LibrarySummaryGrid counts={summary.counts} />

      <LibrarySongPreviewList
        isEmpty={songPreview.isEmpty}
        order={order}
        query={query}
        setOrder={setOrder}
        setQuery={setQuery}
        setSort={setSort}
        songs={songPreview.songs}
        sort={sort}
      />

      <LibraryCollectionPreviewSection
        collections={collectionPreview.collections}
        isEmpty={collectionPreview.isEmpty}
        totals={collectionPreview.totals}
      />

      <View
        className="rounded-lg border p-4"
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      >
        <Text
          className={`text-sm leading-5 ${statusState.isError ? "font-bold" : ""}`}
          style={{
            color: statusState.isError ? theme.danger : theme.secondaryText,
          }}
        >
          {statusState.statusLabel}
        </Text>
      </View>
    </ScrollView>
  );
}
