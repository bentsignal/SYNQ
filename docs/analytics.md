# Analytics

SYNQ reports product analytics to PostHog (`apps/mobile/src/features/analytics/analytics.ts`),
with 2.5.2's project and event names so charts continue across the update. Only
the App Store app reports: SYNQ Dev and development bundles never do. PostHog
keeps its anonymous id in `Documents/.posthog-rn.json`, the file 2.5.2's SDK
wrote, so people keep theirs. Backups never include it.

Call `track(event, properties)` from anywhere.

| Event | Properties | Sent when |
| --- | --- | --- |
| `import_files` | | Import from Files opens |
| `import_wifi` | | Wi-Fi Transfer opens |
| `import_finish` | `numberOfSongs` | An import batch ends with songs imported |
| `import_cancel` | | An import batch ends with files but none imported |
| `theme_change` | `theme` | A theme is chosen |
| `app_icon_change` | `icon` | An app icon is chosen |
| `social_press` | `url` | Contact Support, Source Code, X, Instagram, Discord |
| `export_song`, `export_playlist`, `export_album`, `export_artist` | | An export starts |

2.5.2 also sent these, which belong to other features and should keep their
names: `play_song`, `edit_song`, `delete_song`, `add_to_playlist`,
`remove_from_playlist`, `toggle_in_liked`, `edit_playlist`, `delete_playlist`,
`edit_album`, `delete_album`, `edit_artist`, `delete_artist`. Its
`import_save_to_library` and `export_during_import` events went with its
save-or-export import step, which 3.0 doesn't have, and its paywall and
purchase events (`check_premium`, `premium_option_press`, and
`attempt_`, `success_`, and `error_purchase_premium`), its `play_ad`, and
its `$set` of `premium` went with Premium and the ad (docs/rewrite.md →
Free). 2.5.2's session replay
isn't carried over.
