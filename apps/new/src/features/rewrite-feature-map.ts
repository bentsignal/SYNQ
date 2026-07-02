export type RewritePhaseStatus = "done" | "active" | "pending";

export type RewriteFeature = {
  key: string;
  name: string;
  status: RewritePhaseStatus;
  oldReference: string;
  targetBoundary: string;
  nextMilestone: string;
};

export const rewriteFeatures: RewriteFeature[] = [
  {
    key: "app-shell",
    name: "App Shell",
    status: "active",
    oldReference: "apps/old/app/_layout.tsx",
    targetBoundary: "src/features/app-shell",
    nextMilestone: "Define tabs, stack groups, providers, and global loading.",
  },
  {
    key: "library",
    name: "Library",
    status: "active",
    oldReference: "apps/old/src/features/library",
    targetBoundary: "src/features/library",
    nextMilestone: "Add durable playlist/artist ordering schema, collection cover/image flows, and remaining high-traffic library edit polish.",
  },
  {
    key: "playback",
    name: "Playback",
    status: "active",
    oldReference: "apps/old/src/features/playback",
    targetBoundary: "src/features/playback",
    nextMilestone: "Wire lock-screen controls into the remote command service when the installed Expo Audio API exposes them, and add manual playback/ad-gate smoke coverage.",
  },
  {
    key: "import",
    name: "Import And Ingest",
    status: "active",
    oldReference: "apps/old/src/features/import",
    targetBoundary: "src/features/import",
    nextMilestone: "Manually smoke premium-gated import files, Wi-Fi transfer, save, discard, and staged metadata editing.",
  },
  {
    key: "backup",
    name: "Backup",
    status: "active",
    oldReference: "apps/old/src/features/backup",
    targetBoundary: "src/features/backup",
    nextMilestone: "Manually smoke backup archive, restore, and erase flows.",
  },
  {
    key: "premium-settings",
    name: "Premium And Settings",
    status: "active",
    oldReference: "apps/old/src/features/premium",
    targetBoundary: "src/features/premium + src/features/settings",
    nextMilestone: "Continue saved-theme and haptic propagation through import, backup, and remaining library screens; smoke native icon changes in a native build; then add privacy and support flows.",
  },
];

export const rewriteStatusTotals = rewriteFeatures.reduce(
  (totals, feature) => ({
    ...totals,
    [feature.status]: totals[feature.status] + 1,
  }),
  {
    active: 0,
    done: 0,
    pending: 0,
  } satisfies Record<RewritePhaseStatus, number>,
);
