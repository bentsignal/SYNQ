import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { ImportWifiScreenController } from "../hooks/use-import-wifi-screen-controller";

type ImportWifiAddressPanelProps = {
  serverState: ImportWifiScreenController["serverState"];
  statusLabel: string;
};

export function ImportWifiAddressPanel({
  serverState,
  statusLabel,
}: ImportWifiAddressPanelProps) {
  const theme = useCustomizationTheme();
  const { address, error, port } = serverState;

  return (
    <View
      className="gap-2 rounded-lg border p-4"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <Text
        className="text-xs font-extrabold uppercase"
        style={{ color: theme.secondaryText }}
      >
        Local address
      </Text>
      <Text
        selectable
        numberOfLines={2}
        className={
          address
            ? "text-[21px] font-extrabold leading-7"
            : "text-base leading-[22px]"
        }
        style={{ color: address ? theme.primaryText : theme.mutedText }}
      >
        {address || "Finding device address"}
      </Text>
      <Text
        className="text-[13px] font-extrabold"
        style={{ color: error ? theme.danger : theme.accent }}
      >
        {statusLabel}
      </Text>
      {port ? (
        <Text
          className="text-xs leading-[17px]"
          style={{ color: theme.secondaryText }}
        >
          Listening on port {port}
        </Text>
      ) : null}
      {error ? (
        <Text
          className="text-[13px] font-extrabold leading-[18px]"
          style={{ color: theme.danger }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
