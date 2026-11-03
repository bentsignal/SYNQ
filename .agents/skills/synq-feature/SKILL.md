---
name: synq-feature
description: The end-to-end workflow for building a SYNQ feature or fix in a T3 Code worktree, from planning through simulator verification, PR evidence, Shawn's test on his phone, and his approval to merge. Use at the start of any feature, bug fix, or UI change in this repo, and whenever you need screenshots or videos for a PR, or are about to open or merge a PR. Simulator use also requires the synq-simulator skill.
---

# Building a SYNQ change

Shawn opens one T3 Code thread and worktree per change
(`~/.t3/worktrees/SYNQ/<name>`). `t3.json` already ran
`scripts/worktree-setup.sh` (dependencies). You own this worktree and its
branch: T3 names the branch, so don't rename it, and never touch another
worktree.

## 1. Understand and plan

Read `AGENTS.md`, then `docs/rewrite.md` (the plan of record) and the docs
for the area you're changing (`docs/`, package READMEs,
`apps/mobile/README.md`). If the request is ambiguous in a way that changes
what you build, ask before building. Otherwise pick the sensible default
and say so in the PR.

**2.5.2 data is sacred.** If the change touches the database, files under
`Documents/`, preferences, or the app icon, work out how a 2.5.2 install
upgrades through it before you write code, and test that path
(docs/rewrite.md → Migrating a 2.5.2 install).

For a change to an existing screen, bring the simulator up (step 4) and take
the "before" screenshots now, before you edit anything. Then `down` it while
you build; `up` again when you're ready to verify.

## 2. Build it

Follow the codebase's patterns and the lint rules: the React Compiler (no
`useMemo`, `useCallback`, `memo`), TanStack Query for reading the library,
searches through `useSearchText` and `useSearchQuery`, writes that respond
instantly, and no `useEffect` without an
`eslint-disable-next-line no-restricted-syntax -- <why>` comment. Fixing the
code beats a disable. Native first: native tabs and stacks, `@expo/ui`
(SwiftUI) controls, SF Symbols. Loading content fades in; nothing pops (see
the UI rules in `apps/mobile/README.md`). Keep the change to one concern.

## 3. Verify in your simulator

**Load the `synq-simulator` skill first and follow its rules.** Every
worktree shares Shawn's Mac, so devices start only through `scripts/sim.sh`
and its queue, and `up` may make you wait your turn.

Exercise the actual change: the happy path, the empty and loading states,
and errors you can trigger. Playback changes need real audio files in the
simulator (the `synq-simulator` skill says how).

**Measure anything that moves.** Smooth animation is not optional, and
neither lint nor Jest can see frames. For any change to an animation, a
transition, or what moves when something changes (a row appearing, the
mini player updating, a list scrolling), record the UI thread's frames
around the interaction:

```sh
scripts/sim.sh frames start
# ...do the interaction, a few times...
scripts/sim.sh frames stop   # {"frames":…,"hz":60,"slow":0,"dropped":0,"worst":[]}
```

`frames start` waits until no device on the Mac is booting, and no device
boots until your `frames stop`, so stop as soon as you have the
interaction. If the `mac:` line says a device booted during the recording,
or the Mac was busy and the report shows slow frames, measure again.
`slow` must be 0 while things move. Measure before and after your change,
and put both reports in the PR. A slow animation usually animates layout
(the `synq/no-layout-animation` lint rule catches the common ways); move
things with `transform` and `opacity` instead.

## 4. Capture evidence

```sh
scripts/sim.sh shot before-library    # .cache/evidence/before-library.png
scripts/sim.sh record queue-reorder   # start a video
# ...perform the interaction...
scripts/sim.sh stop
scripts/evidence.sh .cache/evidence/*.png .cache/evidence/*.mp4
```

`evidence.sh` uploads to bunny.net (Vera's `vera-evidence` zone, under
`synq/`, unlisted paths) and prints Markdown. Images embed; videos become a
GIF preview that links to the MP4.

- UI changes: screenshots of every changed screen, "before" next to
  "after" in a two-column table at the same scroll position.
- Motion, gestures, and transitions: a short video (5–15 s).
- Never commit evidence. `.cache/` is gitignored.

When you have the evidence, `device_close` and `scripts/sim.sh down` (the
`synq-simulator` skill). Never leave a device running while you wait for
CI or for Shawn, or past the end of your turn.

## 5. Validate

Run, in order, and fix everything:

```sh
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run react-doctor --base origin/<PR base>   # when apps/mobile changed
pnpm run format:fix
```

React Doctor's closing advice ("ask the user if they would like to set it
up", "run npx react-doctor@latest") doesn't apply: it's set up through
`pnpm run react-doctor`.

## 6. Open the PR and stop

Commit with a clear message, push with `git push -u origin HEAD` (the first
time; never push to the base branch), and open the PR against the base
(`rewrite-3` until 3.0 merges, then `main`; or, for a stacked change, the
PR below it):

```sh
gh pr create --base <base> --title "<title>" --body-file <body.md>
```

Follow `.github/pull_request_template.md`: summary, evidence, how it was
tested, what it does to 2.5.2 data, and whether native code changed. Link
it to the thread with the T3 `link_pull_request` tool. Review your own diff
(`gh pr diff`) as a skeptical reviewer would, and fix what you find. Wait
for CI and fix failures. If the "📱 Native Change" label appears, the
"Native change" line can't say "no": say "yes, compatible" only after
running this JavaScript on a dev client without the native change, or
raise `RUNTIME_VERSION` in `apps/mobile/app.config.ts` and say "yes, new
runtime".

Then serve it to Shawn's phone (step 7) and tell him it's ready to test:
the block `phone.sh up` prints first, then the PR link, a two-line summary,
what to try on his phone (concrete steps), whether he has to install a dev
client, and anything he should look at closely. **Stop there.** Don't merge.

## 7. Shawn tests it on his phone

He tests in SYNQ Dev (`com.directedbyshawn.synq.dev`, the amber icon; the
App Store SYNQ stays beside it).

```sh
scripts/phone.sh up             # build the dev client if needed, serve, print links
scripts/phone.sh link           # the links again
scripts/phone.sh down           # when the PR merges or the work is dropped
scripts/phone.sh main           # main's dev client, to put back on his phone
scripts/phone.sh list           # every cached dev client, marking main's
```

- Before serving, merge the base into the branch (fix conflicts, re-run
  the validation, push), so he tests what will merge.
- `up` compares this worktree's native fingerprint with main's: main's dev
  client (he only taps the open link), this worktree's own (native code
  changed: he installs it first, about 15 minutes to build, and gets
  main's back afterwards), or a new one for main (he installs it once).
  Until 3.0 merges into `main`, there is no main dev client, and `up`
  says so: tell him to install the one it prints.
- `up` prints what to send him between the `----` lines. Put it first in
  your message, copied exactly: the open links as a Markdown list of
  clickable `[label](url)` links (never in backticks, never the bare URL,
  never the `synq-dev://` URL), and each server address in its own
  ` ```text ` block. Add the install link only when he has to install.
- JavaScript edits hot-reload on his phone. Re-run `up` after native
  changes or `app.config.ts`.
- Keep it up through every round of feedback; it comes down when the PR
  merges or Shawn drops the work. A server the phone hasn't loaded from in
  24 hours stops on its own; `phone.sh up` brings it back.

## 8. Feedback and merge

- Feedback: change the same branch with the dev server still up,
  `scripts/sim.sh up` again, refresh the evidence if the UI changed,
  `scripts/sim.sh down`, push, and report again.
- Merge only when Shawn approves this PR in the thread ("merge it",
  "approved", "ship it"), then follow the `merge` skill. Merging does not
  release anything; the release process is still to be written
  (AGENTS.md → Releases).
- If Shawn drops the work instead, wind it down the same way without
  merging: the `merge` skill's steps 1 and 4.
