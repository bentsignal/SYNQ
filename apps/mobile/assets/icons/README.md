# App icons

`icon-{blue,mint,red,yellow,purple,orange,pink}.png` are 2.5.2's icons
(1024 px, from `origin/2.5.2:src/assets/appIcons`), copied as they were.
`icon-blue` is SYNQ's primary icon. All seven are iOS alternate icons, which
people pick in Settings > App Icon (`src/features/app-icon/app-icon.ts`).

**Never rename them.** iOS stores the person's choice by the alternate
icon's name, and 2.5.2 named them exactly these. A renamed icon would put
everyone who picked it back on the primary icon after the update.
`plugins/alternate-icons.test.cjs` fails if the list in `app.config.ts`
changes.

`synq-dev.png` is SYNQ Dev's primary icon: the same arrows, dark on amber,
so the dev app stands apart from SYNQ and from every alternate on the home
screen. `render-dev-icon.swift` renders it from `icon-blue.png`:

```sh
swift assets/icons/render-dev-icon.swift   # from apps/mobile
```

`plugins/with-alternate-icons.cjs` turns each PNG into an app icon set in
the asset catalog and lists the names in the build settings.
