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
    nextMilestone: "Port reactive song, playlist, album, and artist queries.",
  },
  {
    key: "playback",
    name: "Playback",
    status: "active",
    oldReference: "apps/old/src/features/playback",
    targetBoundary: "src/features/playback",
    nextMilestone: "Connect the playback session boundary to TrackPlayer, persistence, and remote events.",
  },
  {
    key: "import",
    name: "Import And Ingest",
    status: "pending",
    oldReference: "apps/old/src/features/import",
    targetBoundary: "src/features/import",
    nextMilestone: "Move file, Wi-Fi, metadata, save, and discard flows behind commands.",
  },
  {
    key: "backup",
    name: "Backup",
    status: "pending",
    oldReference: "apps/old/src/features/backup",
    targetBoundary: "src/features/backup",
    nextMilestone: "Port restore, erase, archive pick, and database reset services.",
  },
  {
    key: "premium-settings",
    name: "Premium And Settings",
    status: "active",
    oldReference: "apps/old/src/features/premium",
    targetBoundary: "src/features/settings",
    nextMilestone: "Port entitlement, customization, privacy, haptics, and support flows behind settings routes.",
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
