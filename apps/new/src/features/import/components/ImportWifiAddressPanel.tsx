import { StyleSheet, Text, View } from "react-native";
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
      style={[
        styles.addressPanel,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.panelLabel, { color: theme.secondaryText }]}>
        Local address
      </Text>
      <Text
        selectable
        numberOfLines={2}
        style={[
          address ? styles.addressText : styles.mutedText,
          { color: address ? theme.primaryText : theme.mutedText },
        ]}
      >
        {address || "Finding device address"}
      </Text>
      <Text
        style={[styles.statusText, { color: error ? theme.danger : theme.accent }]}
      >
        {statusLabel}
      </Text>
      {port ? (
        <Text style={[styles.portText, { color: theme.secondaryText }]}>
          Listening on port {port}
        </Text>
      ) : null}
      {error ? (
        <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  addressPanel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  addressText: {
    fontSize: 21,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 28,
  },
  errorText: {
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
  },
  mutedText: {
    fontSize: 16,
    lineHeight: 22,
  },
  panelLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  portText: {
    fontSize: 12,
    lineHeight: 17,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
