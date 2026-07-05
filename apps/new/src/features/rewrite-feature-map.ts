export type RewritePhaseStatus = "done" | "active" | "pending";

export type RewriteFeature = {
  key: string;
  name: string;
  status: RewritePhaseStatus;
  oldReference: string;
  targetBoundary: string;
  nextMilestone: string;
};

export type RewriteReleaseGateKind = "automated" | "manual";

export type RewriteReleaseGate = {
  key: string;
  kind: RewriteReleaseGateKind;
  label: string;
  evidence: string;
};

export type RewriteManualSmokeArea = {
  key: string;
  label: string;
  flows: string[];
};

export const rewriteFeatures: RewriteFeature[] = [
  {
    key: "app-shell",
    name: "App Shell",
    status: "active",
    oldReference: "apps/old/app/_layout.tsx",
    targetBoundary: "src/features/app-shell",
    nextMilestone: "Manually smoke home/tab navigation, then replace remaining rewrite-only placeholders.",
  },
  {
    key: "library",
    name: "Library",
    status: "active",
    oldReference: "apps/old/src/features/library",
    targetBoundary: "src/features/library",
    nextMilestone: "Manually smoke collection cover/profile images, then continue high-traffic library edit polish.",
  },
  {
    key: "playback",
    name: "Playback",
    status: "active",
    oldReference: "apps/old/src/features/playback",
    targetBoundary: "src/features/playback",
    nextMilestone: "Wire lock-screen controls into the remote command service when the installed Expo Audio API exposes them, then manually smoke native playback and ad-gate timing on device.",
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
    nextMilestone: "Smoke native icon and haptic changes in a native build, then continue non-theme feature polish.",
  },
];

export const rewriteReleaseGates: RewriteReleaseGate[] = [
  {
    key: "verify-rewrite",
    kind: "automated",
    label: "Full rewrite verifier",
    evidence:
      "corepack pnpm@10.17.0 verify:rewrite passes, including typecheck, lint, debt scans, deterministic smoke, and old/new iOS export smokes.",
  },
  {
    key: "hard-debt-ratchets",
    kind: "automated",
    label: "Hard debt ratchets",
    evidence:
      "scripts/audit-rewrite-debt.sh remains at zero for new app forbidden style API references, React context modules, raw haptic/router/alert calls, and forbidden live-query boundaries.",
  },
  {
    key: "deterministic-parity-smoke",
    kind: "automated",
    label: "Deterministic parity smoke",
    evidence:
      "@synq/rewrite-smoke covers feature service contracts for import, library, playback, backup, premium, settings, and rewrite state models.",
  },
  {
    key: "manual-device-smoke",
    kind: "manual",
    label: "Manual device smoke",
    evidence:
      "A native-device pass records import, library, playback, backup, premium, and settings flows without blocking regressions.",
  },
  {
    key: "old-app-reference",
    kind: "automated",
    label: "Old app reference remains runnable",
    evidence:
      "apps/old continues to typecheck, lint, and export through the rewrite verifier until the new app is accepted.",
  },
];

export const rewriteManualSmokeAreas: RewriteManualSmokeArea[] = [
  {
    key: "navigation",
    label: "App shell navigation",
    flows: [
      "Open home and each tab.",
      "Use compatibility routes for old import/export/ingest paths.",
      "Confirm mini-player visibility on non-player routes.",
    ],
  },
  {
    key: "import",
    label: "Import and save",
    flows: [
      "Import files behind the premium gate.",
      "Transfer songs over Wi-Fi and edit staged metadata.",
      "Save, discard, export, and review save-result states.",
    ],
  },
  {
    key: "library",
    label: "Library and collections",
    flows: [
      "Create and edit playlists, albums, and artists with images.",
      "Add, remove, reorder, play, queue, and export collection songs.",
      "Edit song metadata, cover art, artists, and album relationships.",
    ],
  },
  {
    key: "playback",
    label: "Playback",
    flows: [
      "Play from library, player, queue, collection, and mini-player entry points.",
      "Exercise queue movement, shuffle, repeat, seek, and ad-gate timing.",
      "Confirm persistence and remote command behavior in a native build.",
    ],
  },
  {
    key: "backup",
    label: "Backup",
    flows: [
      "Create a backup archive.",
      "Restore from a backup archive.",
      "Erase local data and verify the database-empty state.",
    ],
  },
  {
    key: "premium-settings",
    label: "Premium and settings",
    flows: [
      "Toggle premium state and verify premium-gated controls.",
      "Change theme color, icon, haptics, and reduced motion settings.",
      "Open support, review, backup, and customization routes.",
    ],
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

export const rewriteReleaseReadiness = {
  automatedGateCount: rewriteReleaseGates.filter(
    (gate) => gate.kind === "automated",
  ).length,
  manualGateCount: rewriteReleaseGates.filter(
    (gate) => gate.kind === "manual",
  ).length,
  manualSmokeFlowCount: rewriteManualSmokeAreas.reduce(
    (total, area) => total + area.flows.length,
    0,
  ),
  readyStatus:
    rewriteStatusTotals.pending === 0 &&
    rewriteStatusTotals.active === 0
      ? "ready"
      : "not-ready",
} as const;
