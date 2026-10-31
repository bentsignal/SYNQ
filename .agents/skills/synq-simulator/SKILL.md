---
name: synq-simulator
description: Required before you use an iOS simulator in this repo for any reason, such as verifying a change, taking screenshots or videos, or reproducing a bug. Every worktree on the Mac (SYNQ's and Vera's) shares one simulator queue, so simulators start only through scripts/sim.sh. This skill has the rules that keep the Mac usable, the commands, and how to wait your turn.
---

# Simulators

Many worktrees run at once on Shawn's Mac, SYNQ's and Vera's side by side.
`scripts/sim.sh up` waits in the simulator queue (`scripts/simq.ts`, a
verbatim copy of Vera's, talking to the one daemon both repos share),
which runs **up to three devices at once on the whole Mac**: three can
animate together as smoothly as one, while at four the GPU runs out and
every device lags. Booting a device pins every core for half a minute or
more, so boots and performance measurements (`sim.sh frames start`) wait in
the same line and never overlap. The queue only works if every agent goes
through it.

## Rules

1. **Only `scripts/sim.sh` starts, stops, or deletes a simulator.** Never
   boot or create one any other way: no `xcrun simctl boot` or `create`, no
   `npx expo run:ios`, no `expo start --ios`, no Xcode runs. They skip the
   queue. `xcrun simctl` on your own device for settings is fine.
2. **Never skip the queue.** Don't set `VERA_SIMQ=off`, don't stop or kill
   the daemon (`simq.ts stop`), and don't edit `~/.config/vera/simq.json`;
   that's Shawn's.
3. **Only touch your own worktree's device and Metro.** Never use, stop, or
   screenshot another worktree's simulator (a `SYNQ <name>` or `Vera <name>`
   that isn't yours), even one that looks abandoned. The queue cleans those
   up.
4. **Wait your turn.** If `up` prints `simulator queue: position N of M`,
   it's waiting, and says why. If it exits with code 75 ("still queued"),
   run `up` again right away to keep your place; the place lapses after 5
   minutes. If your harness can run commands in the background and wake you
   when they finish, run `up` that way and do other work meanwhile.
   `frames start` can wait the same way and exits 75 the same way too.
5. **Hold a device only while you're using it.** Bring it up when you're
   ready to verify, not while you're still writing code, and `down` as soon
   as you have your evidence, before you wait for CI or for Shawn. **Never
   end a turn with a device up**: a finished turn waits on Shawn, maybe for
   hours. A Stop hook (`.claude/hooks/devices-down.sh`) sends you back once
   if you try.
6. **Open each device in T3's Device panel at most once, and close it.**
   Every `device_open` starts a screen-mirroring loop in T3 that only
   `device_close` stops; opening the same device again leaks another.
   Call `device_list` first: if your device is already open, reuse the
   agent-device flags you have. `device_close` it before `sim.sh down`, and
   never `device_open` another worktree's device or the shared
   `Vera template` simulator, which every worktree's is cloned from and
   which stays shut down.
7. **If the queue shut your device down**, your next `sim.sh` command says
   so. Run `up` again. The queue shuts down devices that haven't had a
   `sim.sh` command for 10 minutes when others are waiting, after 30
   minutes even if nobody is (any `sim.sh` command counts, `status`
   included), and right away if one stopped running without `sim.sh down`.

## Commands

```sh
scripts/sim.sh up             # wait for a slot, then dev client + this worktree's simulator + Metro
scripts/sim.sh open /settings # go to any route
scripts/sim.sh relaunch       # restart the app, e.g. to reset in-memory state
scripts/sim.sh shot <name>    # screenshot to .cache/evidence/<name>.png
scripts/sim.sh record <name>  # start a video; `scripts/sim.sh stop` ends it
scripts/sim.sh eval "<js>"    # evaluate JavaScript in the app
scripts/sim.sh status         # this worktree's device and Metro
scripts/sim.sh queue          # every device on the Mac, who is waiting, and why
scripts/sim.sh down           # delete the device; Metro stops with it
```

- `up` reuses the cached SYNQ Dev dev client unless native code changed.
  The first build of a fingerprint takes about 10 minutes, runs under the
  heavy-work lock SYNQ and Vera share (`scripts/bench/with-lock.sh`), is
  cached in `~/Library/Caches/synq` for every worktree, and happens before
  `up` joins the queue. `scripts/sim.sh build` makes it without a device.
  Re-run `up` after changing native code or `app.config.ts`. JavaScript
  edits hot-reload; `scripts/sim.sh reload` forces it.
- Navigation goes through the dev-only `globalThis.synqDev` hook
  (`apps/mobile/src/features/dev/automation.ts`) over Metro's debugger
  connection, not deep links: iOS asks "Open in SYNQ Dev?" before every
  `simctl openurl`. Routes with parameters take them as a query string;
  read the route file under `apps/mobile/src/app` for the names.
- Let Shawn watch: call the T3 `device_open` tool with the simulator UDID
  that `up` prints, once (rule 6). It returns the exact `agent-device`
  command and flags; keep them for the rest of your session. Run
  `agent-device open com.directedbyshawn.synq.dev "${F[@]}"` once before
  other agent-device commands (they fail with "Run open first" otherwise).
- Use agent-device for taps, typing, scrolling, and gestures (`snapshot -i`,
  `press @e3`, `fill`, `longpress`, `scroll`). Its refs (`@e12`) expire
  after every action, so take a fresh `snapshot -i` before each tap. In
  zsh, put the flags in an array (`F=(--platform ios ...)` then `"$F[@]"`).
- Music needs files: `scripts/sim.sh seed` fills a fresh simulator's
  library with the dev sample library (`apps/mobile/dev/sample-library`:
  20 short, playable, tagged songs with covers, three playlists, and
  likes); `scripts/sim.sh seed 3000 --reset` erases the library and adds
  made-up songs up to 3,000 for measuring lists. Otherwise import through
  the app's own import flow, never into another worktree's device.
- Check Metro's log (`.cache/sim/metro.log`) for red boxes and warnings you
  introduced.

## Shutting down

When you have your evidence, and in any case before you end your turn:

1. `device_close` every device `device_list` shows open in this thread.
2. `scripts/sim.sh down`. It deletes the simulator, gives the slot back to
   the queue, and stops Metro (unless `scripts/phone.sh` still serves
   Shawn's phone from it).

`up` brings one back in about a minute with the cached build, so there's no
reason to keep one around.

## Troubleshooting

- **`up` keeps saying you're queued:** `scripts/sim.sh queue` shows why.
  That's working as intended; keep waiting, and do other work meanwhile.
  Tell Shawn if the line hasn't moved in half an hour.
- **`up` says Metro didn't start:** read `.cache/sim/metro.log`. A port
  clash is resolved automatically. Kill only the PID in `.cache/sim/metro`,
  never by pattern (other worktrees run Metro too).
- **The app shows the dev launcher instead of SYNQ Dev:**
  `scripts/sim.sh relaunch`.
- **The Mac is slow, `up` waits on memory, or a simulator is stuck
  "Shutting Down":** check for T3's device preview running away
  (`ps -Ao pid,%cpu,rss,command | grep -i device-preview`). Don't kill it
  yourself; tell Shawn.
- **The dev client build fails:** run `scripts/sim.sh build` and read the
  `xcodebuild` error. It is usually a missing `pod install` after
  dependency changes; the build runs prebuild with `--clean`.
