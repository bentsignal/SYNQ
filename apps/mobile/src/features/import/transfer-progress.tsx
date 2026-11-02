import { Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { ProgressView } from "@expo/ui/swift-ui";

import type { ImportState } from "./session";
import { SymbolIcon } from "~/components/symbol-icon";
import { FormHost } from "~/features/settings/form";
import { transferView } from "./progress";
import { useImportState } from "./session";

function batchOf({ batch }: ImportState) {
  return batch;
}

function transferOf({ transfer }: ImportState) {
  return transfer;
}

/**
 * Wi-Fi Transfer's progress while files arrive: how far along it is, the
 * file on its way, and the result, just before the sheet closes itself.
 */
export function TransferProgress() {
  const batch = useImportState(batchOf);
  const transfer = useImportState(transferOf);
  const view = transfer === null ? null : transferView(transfer, batch);
  if (view === null) return null;
  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      className="gap-2.5 px-6 pt-2"
    >
      <View className="flex-row items-center gap-1.5">
        {view.done && (
          <SymbolIcon
            name="checkmark"
            size={13}
            weight="semibold"
            tintColorClassName="accent-muted"
          />
        )}
        <Text className="text-subhead text-foreground font-medium tabular-nums">
          {view.line}
        </Text>
      </View>
      <FormHost style={{ height: 6 }}>
        <ProgressView value={view.fraction} />
      </FormHost>
      <Text className="text-footnote text-muted" numberOfLines={1}>
        {view.name ?? " "}
      </Text>
    </Animated.View>
  );
}
