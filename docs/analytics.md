# Analytics

SYNQ reports product analytics to PostHog (`apps/mobile/src/features/analytics/analytics.ts`),
with 2.5.2's project and event names so charts continue across the update. Only
the App Store app reports: SYNQ Dev and development bundles never do. PostHog
keeps its anonymous id in `Documents/.posthog-rn.json`, the file 2.5.2's SDK
wrote, so people keep theirs. Backups never include it.

Call `track(event, properties)` from anywhere; `setPersonProperties` for `$set`.

| Event | Properties | Sent when |
| --- | --- | --- |
| `import_files` | | Import from Files opens |
| `import_wifi` | | Wi-Fi Transfer opens |
| `import_finish` | `numberOfSongs` | An import sheet closes after importing songs |
| `import_cancel` | | An import sheet closes with files but none imported |
| `check_premium` | `premium` | Something opens the paywall (a locked theme, icon, backup, export, import) |
| `premium_option_press` | `tier`, `price` | A plan card on the paywall |
| `attempt_purchase_premium` | `tier` | Purchase starts (`tier` is the offering, "Premium Yearly") |
| `success_purchase_premium` | `tier` | Purchase completes |
| `error_purchase_premium` | `error`, `cancelled` | Purchase fails or is cancelled |
| `theme_change` | `theme` | A theme is chosen |
| `app_icon_change` | `icon` | An app icon is chosen |
| `social_press` | `url` | Contact Support, X, Instagram, Discord |
| `export_song`, `export_playlist`, `export_album`, `export_artist` | | An export starts |
| `$set` | `premium` | Premium status changes |

2.5.2 also sent these, which belong to other features and should keep their
names: `play_song`, `play_ad`, `edit_song`, `delete_song`, `add_to_playlist`,
`remove_from_playlist`, `toggle_in_liked`, `edit_playlist`, `delete_playlist`,
`edit_album`, `delete_album`, `edit_artist`, `delete_artist`. Its
`import_save_to_library` and `export_during_import` events went with its
save-or-export import step, which 3.0 doesn't have. 2.5.2's session replay
isn't carried over.
