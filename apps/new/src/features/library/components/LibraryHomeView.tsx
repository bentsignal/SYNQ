import { Link } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryHomeController } from "../hooks/use-library-home-controller";
import { getLibraryHomeHeaderState } from "../services/library-home-service";
import { LibraryCollectionPreviewSection } from "./LibraryCollectionPreviewSection";
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
      <View className="gap-2">
        <Text
          className="text-[13px] font-extrabold uppercase tracking-normal"
          style={{ color: theme.accent }}
        >
          {headerState.kicker}
        </Text>
        <Text
          className="text-[34px] font-extrabold leading-10 tracking-normal"
          style={{ color: theme.primaryText }}
        >
          {headerState.title}
        </Text>
        <Text
          className="max-w-[460px] text-[15px] leading-[22px]"
          style={{ color: theme.secondaryText }}
        >
          {headerState.subtitle}
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {headerState.actions.map((action) => (
            <Link
              className="text-sm font-extrabold uppercase tracking-normal"
              href={action.href}
              key={action.href}
              style={{ color: theme.accent }}
            >
              {action.label}
            </Link>
          ))}
        </View>
      </View>

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
