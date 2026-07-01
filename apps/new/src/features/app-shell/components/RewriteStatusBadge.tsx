import { StyleSheet, Text } from "react-native";
import type { RewritePhaseStatus } from "../../rewrite-feature-map";

const statusLabels: Record<RewritePhaseStatus, string> = {
  active: "Active",
  done: "Done",
  pending: "Pending",
};

const statusStyles: Record<
  RewritePhaseStatus,
  {
    backgroundColor: string;
    borderColor: string;
    color: string;
  }
> = {
  active: {
    backgroundColor: "#e0f2ef",
    borderColor: "#8fc9c1",
    color: "#0f766e",
  },
  done: {
    backgroundColor: "#e9f1ff",
    borderColor: "#a9c5f5",
    color: "#2563eb",
  },
  pending: {
    backgroundColor: "#f8ecd6",
    borderColor: "#dfc08b",
    color: "#8a5a16",
  },
};

type RewriteStatusBadgeProps = {
  status: RewritePhaseStatus;
};

export function RewriteStatusBadge({ status }: RewriteStatusBadgeProps) {
  const statusStyle = statusStyles[status];

  return (
    <Text
      style={[
        styles.badge,
        {
          backgroundColor: statusStyle.backgroundColor,
          borderColor: statusStyle.borderColor,
          color: statusStyle.color,
        },
      ]}
    >
      {statusLabels[status]}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 14,
    minWidth: 74,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 5,
    textAlign: "center",
    textTransform: "uppercase",
  },
});
