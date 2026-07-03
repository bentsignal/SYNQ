# SYNQ Rewrite Backlog

This branch uses `apps/old` as the runnable reference app and `apps/new` as the
rewrite target. Keep old working while moving behavior into smaller, typed,
feature-oriented packages.

## Finish-Line Checklist

Use this checklist to track convergence. The detailed backlog below records the
work already done; this section is the shorter "are we close yet?" dashboard.

### Done Criteria

- [ ] `apps/old` remains runnable as the reference app until the new app reaches
  parity.
- [ ] `apps/new` implements the core import, library, collection, playback,
  backup, premium, and settings flows with feature-first modules.
- [ ] High-traffic state flows use reactive Drizzle queries, reducers, or typed
  hooks instead of event emitters, direct storage calls, or screen-local
  orchestration.
- [ ] Large providers, screens, and hooks are slim enough to read without
  hiding business rules inside JSX.
- [ ] Deterministic smoke coverage exists for the riskiest rewrite domains:
  import, save-to-library, playback queue/ad gate, library edits, and backup.
- [ ] `pnpm verify:rewrite` passes at every checkpoint, including old/new mobile
  export smokes.
- [ ] A final parity audit against `apps/old` has no blocking gaps.

### Phase 1: Rewrite Foundation

- [x] Create `rewrite-2` from the completed `rewrite-1` checkpoint.
- [x] Move the project into a Turborepo workspace with `apps/*` and `shared/*`.
- [x] Keep `apps/old` runnable as the reference implementation.
- [x] Create `apps/new` as the rewrite target.
- [x] Extract shared database ownership into `shared/db`.
- [x] Extract reusable audio/metadata helpers into `shared/audio`.
- [x] Keep root `pnpm typecheck`, `pnpm lint`, and old-app iOS export smoke
  working as the normal validation gate.

### Phase 2: Old-App Stabilization And De-Spaghetti

- [x] Remove app-level event emitters and replace refresh flows with typed
  feature actions or reactive Drizzle queries.
- [x] Remove legacy controller/model layers from the main app path.
- [x] Isolate AsyncStorage behind feature-level storage services.
- [x] Move import, backup, premium, export, action-sheet, playback, and library
  side effects out of large UI components/hooks where safe.
- [ ] Finish slimming remaining large hooks and providers.
  - Import/save flows are smaller but still contain orchestration and timers.
  - Playback still needs a deeper pass around state ownership and queue/player
    synchronization.
  - Library query hooks are cleaner, but collection list helpers still need the
    same treatment as song query helpers.
  - Done: library collection list title/search/create/back copy now lives in
    the collection list service with smoke coverage instead of route and header
    components.
  - Done: collection detail row aggregation/detail shaping now lives in a pure
    library service with deterministic smoke coverage.
  - Done: collection kind typing now lives in an explicit library service
    boundary instead of repository and UI modules importing it through a query
    hook.
  - Done: add-to-collection repository writes now live in a focused collection
    song add repository instead of the broader relationship mutation
    repository.
  - Done: collection create/update writes now live in focused repository
    modules instead of one broad collection mutation repository.
  - Done: library song liked and delete writes now live in focused
    repositories instead of the metadata edit repository owning playlist and
    file-storage side effects.
  - Done: playback native audio mode setup and ad asset ownership now live in a
    focused native-audio service instead of the track-player adapter owning
    every native setup detail.
  - Done: playback queue row action state, labels, metadata, and duration
    presentation now live in a focused row service with deterministic smoke
    coverage instead of the row component and generic queue mechanics service.
  - Done: playback queue ad-break panel rendering now lives in a focused
    component instead of the queue screen view owning warning-panel layout and
    Premium action rendering.
  - Done: playback queue row remove/reorder controls now live in a focused
    row-actions component instead of the row renderer owning every queue-row
    control surface.
  - Done: playback player button rendering now lives in a focused control
    button component instead of the player controls component repeating themed
    button markup for every playback command.
  - Done: playback persistence defensive normalizers now live in a focused
    normalizer service instead of the persistence codec owning every restore
    validation detail.
  - Done: playback native status subscription bookkeeping now lives in a
    focused listener registry instead of the track-player adapter owning player
    lifecycle and event-listener replacement together.
  - Done: library collection song row remove/reorder controls now live in a
    focused row-actions component instead of the row renderer owning every
    collection-song control surface.
  - Done: import staged-song edit routes, back links, and invalid route states
    now live in a focused navigation service instead of the edit form service
    owning route copy and form mutation state together.
  - Done: library collection detail/list routes and invalid collection state
    now live in a focused navigation service instead of the interaction service
    owning routing and action/status state together.
  - Done: settings routes, Premium/home destinations, shared back-link, and
    support URLs now live in a focused navigation service instead of the
    screen-state service owning navigation and preference view state together.
  - Done: collection detail song-row aggregation now lives in a focused song
    detail service instead of the detail shell builder owning song grouping,
    artist/album fallback labels, and track sorting.
  - Done: collection preview aggregation for playlist, album, and artist
    sections now lives in a pure library service with deterministic smoke
    coverage.
  - Done: collection preview row aggregation is split into playlist, album, and
    artist row services behind a small barrel instead of one large collection
    preview helper owning every collection kind.
  - Done: song preview search/sort aggregation now lives in a pure library
    service with deterministic smoke coverage.
  - Done: song preview row detail/play destinations now live in the song
    preview service with deterministic smoke coverage instead of inline row
    route strings.
  - Done: song preview list search placeholder, sort option labels, active
    state, and order-toggle presentation now live in the song preview service
    with smoke coverage instead of control component constants.
  - Done: song preview list section title and shown-count meta now live in the
    song preview service with smoke coverage instead of the list component.
  - Done: song preview row state, routes, empty/list copy, controls, and
    playback payloads now live in a focused state service instead of the row
    aggregation service.
  - Done: add-to-collection song picker aggregation/search/linked-state sorting
    now lives in a pure library service with deterministic smoke coverage.
  - Done: song detail label/relationship/duration shaping now lives in a pure
    library service with deterministic smoke coverage.
  - Done: song detail action availability and status labels now live in a
    focused state service instead of the detail read-model builder owning
    mutation/UI state.
  - Done: edit-collection query state and singular collection kind typing now
    live in a library service instead of depending on the edit screen.
  - Done: edit-collection SQL builders and row subscriptions now live in
    repository/rows-query boundaries instead of the edit query hook importing
    Drizzle schema directly.
  - Done: edit-collection hydration, dirty tracking, image picking, save,
    navigation, and mutation-error workflows now live in a controller hook
    instead of the screen.
  - Done: edit-collection image picking and save/navigation side effects now
    live in a focused command hook instead of the form controller owning every
    edit command path.
  - Done: shared create/edit collection image-pick side effects now live in a
    shared form image command hook instead of duplicated create/edit command
    implementations.
  - Done: edit-collection query result/controller/view wiring now lives in a
    connected form component instead of the route screen owning form assembly.
  - Done: edit-collection form fields, image picker presentation, validation
    messages, and save action rendering now live in a focused component instead
    of the route screen.
  - Done: shared collection form year parsing now lives in a library service
    instead of duplicated create/edit screen helpers.
  - Done: collection list search filtering now lives in a pure library service
    instead of the collection list screen.
  - Done: shared duration and remaining-duration formatting now lives in an
    app-shell service instead of repeated library/import/playback UI helpers.
  - Done: shared numeric route param parsing now lives in an app-shell service
    instead of repeated library/import screen helpers.
  - Done: home quick-action, now-playing, library, and recent-song destinations
    now live in the app-shell home service with deterministic smoke coverage
    instead of inline home component route strings.
  - Done: import staged-song edit track parsing and metadata normalization now
    live in an import service instead of the edit screen.
  - Done: import staged-song edit save/files destinations now live in the
    import song form service with deterministic smoke coverage instead of
    inline controller and component route strings.
  - Done: import staged-song edit initial field state and required-title copy
    now live in the import song form service with deterministic smoke coverage
    instead of controller-local formatting.
  - Done: import staged-song edit field labels, placeholders, and return-key
    state now live in the import song form service with deterministic smoke
    coverage instead of component-local form copy.
  - Done: collection detail playable-song filtering and optimistic reorder
    helpers now live in a library service instead of the detail screen.
  - Done: add-to-collection bulk selection derivation and selection set updates
    now live in a library service instead of the add-songs screen.
  - Done: add-to-collection row selected/saving/disabled state now lives in the
    library interaction service instead of inline row rendering logic.
  - Done: add-to-collection selection, search, mutation reducer, error copy,
    and row interaction state now live in a focused add-collection interaction
    service instead of the broader collection-detail interaction module.
  - Done: add-to-collection selection/row presentation and reducer/mutation
    state now live in separate services instead of one interaction helper owning
    selection derivation, reducers, error copy, and row labels.
  - Done: add-to-collection header, back-link, updated label, and query status
    copy now live in a focused screen-state service instead of the addable song
    aggregation service.
  - Done: add-to-collection and edit-collection invalid id routes now share the
    focused library invalid-state component instead of duplicating themed route
    fallback UI.
  - Done: collection detail list-route and protected-delete rules now live in
    the library interaction service instead of the detail screen.
  - Done: collection detail destructive confirmation title, message, and button
    labels now live in the library interaction service with deterministic smoke
    coverage instead of inline controller copy.
  - Done: collection detail edit/add/back destinations, collection form back
    destination/presentation, and collection-list create/back destinations now
    live in library services with deterministic smoke coverage instead of
    inline component and route-screen strings.
  - Done: player progress, seek target, and free-listening remaining-time math
    now live in a playback service instead of the player screen.
  - Done: playback player header, queue link, and ad-break panel copy/progress
    presentation now live in the playback player-state service with smoke
    coverage instead of player components.
  - Done: playback player, queue, mini-player, and Premium ad-gate
    destinations now live in the playback player-state service with
    deterministic smoke coverage instead of inline playback route strings.
  - Done: playback player/queue screen copy, mini-player visibility, ad-break
    copy, and playback destinations now live in a focused screen-state service
    instead of the player math/action-state service.
  - Done: song detail relationship routing and action disabled-state derivation
    now live in the song detail service instead of the detail screen.
  - Done: song detail route/view-state helpers, delete confirmation copy, and
    playback/export item shaping now live in a focused interaction service
    instead of the read-model/detail shaping service.
  - Done: song detail play/delete destination routes and delete confirmation
    copy now live in the song detail service with deterministic smoke coverage
    instead of inline controller branches.
  - Done: import save action availability now lives in the import session
    service instead of the save screen.
  - Done: import home/save/files/Wi-Fi/Premium screen state selectors now live
    in a dedicated import screen-state service instead of the import session
    reducer service.
  - Done: import file-pick, finish, and discard result-route decisions now live
    in the import screen-state service with deterministic smoke coverage
    instead of inline controller branches.
  - Done: import navigation/result-route decisions and save-export reducer
    state now live in focused import services instead of the screen-state
    presentation service owning routing and export transition concerns.
  - Done: import save-review action state, header/toggle copy, back link, and
    staged-song empty state now live in a focused save screen-state service
    instead of the broader import screen-state service.
  - Done: import success/failure result labels now live in a focused result
    screen-state service instead of the broader import screen-state service.
  - Done: import files action availability and files-screen links now live in a
    focused files screen-state service instead of the broader import
    screen-state service.
  - Done: import Wi-Fi progress/status labels and Wi-Fi action links now live
    in a focused Wi-Fi screen-state service instead of the broader import
    screen-state service.
  - Done: import home route cards and Premium gate copy now live in focused
    home/premium services, removing the broad import screen-state service.
  - Done: import files/save/Wi-Fi/result back-links and staged-song edit
    destinations now live in import services with deterministic smoke coverage
    instead of inline component route strings.
  - Done: collection preview detail-route generation now lives in the collection
    preview service instead of duplicated preview/list UI helpers.
  - Done: collection preview playlist, album, and artist live query builders
    now live in a repository boundary instead of the preview query hook owning
    SQL construction.
  - Done: library collection preview empty state, columns, and row rendering now
    live in focused components instead of one large preview section.
  - Done: library collection preview empty-state copy now lives in the
    collection preview service with smoke coverage instead of component-local
    copy.
  - Done: library collection list filtering, empty labels, and query status
    labels now live in the collection list service instead of screen-local
    state shaping.
  - Done: library collection list query/filter orchestration now lives in a
    controller hook, and collection row rendering now lives in a dedicated
    component instead of the route screen.
  - Done: library collection list header/search/status/layout rendering now
    lives in focused components instead of the route screen owning the whole
    list UI.
  - Done: library home summary, collection preview, song preview search/sort,
    query status derivation, and screen layout now split between a controller
    hook and focused component instead of the route screen.
  - Done: library home and collection list query/sort controls now use service
    reducers with smoke coverage instead of controller-local state setters.
  - Done: collection detail header, action bar, status panel, and invalid route
    state now live in focused components instead of the route screen.
  - Done: collection detail assembled layout, songs section header, list wiring,
    mutation status, and library back link now live in a focused component
    instead of the route screen.
  - Done: collection detail playback/queue actions and mutation workflows now
    live in focused hooks instead of one controller owning every command path.
  - Done: collection detail playback and queue command planning now lives in a
    focused playback service instead of the broader collection interaction
    module.
  - Done: collection detail collection-level export/delete workflows and
    per-song move/remove workflows now live in separate hooks instead of one
    mutation coordinator owning every command path.
  - Done: collection detail mutation reducer, fallback mutation copy, song
    reorder math, and row mutation state now live in a focused mutation service
    instead of the broader collection interaction module.
  - Done: collection detail song reorder math and row action state now live in
    a dedicated song mutation service instead of the collection mutation
    reducer owning per-row behavior.
  - Done: collection detail destructive delete confirmation, repository call,
    haptics, mutation state, and post-delete navigation now live in a focused
    delete command hook instead of the collection mutation hook.
  - Done: edit collection routes now mount kind-specific live query hooks so
    album, artist, and playlist edits do not subscribe to unrelated tables.
  - Done: add-to-collection routes now mount kind-specific relationship live
    queries so adding songs only subscribes to the active collection kind.
  - Done: add-to-collection addable-song and linked-song live query builders
    now live in a repository boundary instead of the addable-song query hook
    owning SQL construction.
  - Done: add-to-collection all-song and linked-song row subscriptions now live
    in a focused rows-query hook instead of the addable-song shaping hook
    owning every live query directly.
  - Done: add-to-collection row-to-result shaping now lives in a focused result
    hook instead of the kind-specific query hook owning subscription selection
    and result assembly together.
  - Done: collection detail routes now mount kind-specific live query hooks so
    playlist, album, and artist detail screens do not subscribe to unrelated
    collection tables.
  - Done: collection detail row subscriptions now live in a focused rows-query
    hook instead of the detail-shaping hook owning every live query directly.
  - Done: collection detail row-to-result shaping now lives in a focused result
    hook instead of the kind-specific query hook owning subscription selection
    and detail assembly together.
  - Done: collection detail live query SQL builders now live in a repository
    boundary instead of the hook owning playlist, album, and artist query
    construction.
  - Done: song detail derives liked state from playlist membership rows and no
    longer opens a duplicate liked-song live query.
  - Done: add-to-collection single-add, bulk-add, selection, saving, mutation
    error, and haptic workflow state now lives in a controller hook instead of
    the screen.
  - Done: add-to-collection single-add and bulk-add mutation side effects now
    live in a focused command hook instead of the controller owning repository
    calls, reducer transitions, and haptics together.
  - Done: add-to-collection single-add and bulk-add fallback copy now lives in
    the library interaction service with deterministic smoke coverage instead
    of inline controller branches.
  - Done: add-to-collection header/search, section header, selection controls,
    and status panel now render through focused components instead of one large
    add-songs form view.
  - Done: add-to-collection query result/controller/view wiring now lives in a
    connected form component instead of the route screen owning repeated
    status and mutation-controller assembly.
  - Done: song detail play, queue, like, export, delete, mutation error, and
    busy-state workflows now live in a controller hook instead of the screen.
  - Done: song detail mutation reducer, busy flags, and fallback mutation copy
    now live in a focused mutation service instead of the read-model/detail
    shaping service.
  - Done: edit-song form fields, save/cancel controls, query/mutation status
    copy, and error rendering now live in a focused component instead of the
    route screen.
  - Done: import session hydration and persistence policy now lives in a
    focused hook instead of the provider body.
  - Done: import file-pick and staged-song removal command orchestration now
    lives in a focused hook instead of the provider body.
  - Done: import file cache IO and metadata-to-draft shaping now live in
    focused import services instead of the file picker/Wi-Fi staging service
    owning cache cleanup, cache writes, audio metadata, and draft assembly.
  - Done: import session command orchestration for Wi-Fi transfer prep,
    save/discard persistence cleanup, session reset, and reducer dispatches now
    lives in a focused hook instead of the provider body.
  - Done: backup operation fallback copy now lives in the backup session service
    with deterministic smoke coverage instead of an inline hook branch.
  - Done: customization screen theme/icon/haptics controls, Premium lockout
    panel, status, and error rendering now live in a focused settings component
    instead of the route screen.
  - Done: customization and privacy settings fallback copy now lives in the
    settings screen service with deterministic smoke coverage instead of inline
    settings hook helpers.
  - Done: customization Premium lockout, theme/app-icon swatches, and haptics
    preference row now render through focused components instead of one large
    customization screen view.
  - Done: playback hydration, native restore trigger, and throttled persistence
    now live in a focused hook instead of the provider body.
  - Done: playback persisted-state serialization and normalization now live in
    a pure persistence codec service with deterministic smoke coverage instead
    of the filesystem persistence service owning parsing and validation.
  - Done: playback Premium/ad-gate sync, ad-break trigger, and premium-resume
    side effects now live in a focused hook instead of the provider body.
  - Done: playback native status listener, ad completion, and native status
    dispatch now live in a focused hook instead of the provider body.
  - Done: playback command, queue mutation, remote command, and native adapter
    orchestration now lives in a controller hook instead of the provider body.
  - Done: playback remote command failure planning now lives with the remote
    command controller instead of the top-level command controller owning that
    bridge callback.
  - Done: playback reset persistence cleanup now lives in a focused reset
    command hook instead of the transport command hook owning storage cleanup.
  - Done: playback native command failure handling and provider-facing native
    command callbacks now live in a focused hook/service boundary instead of
    the provider body.
  - Done: playback active-track advancement after native finish or remote
    queue-ended events now lives in a focused hook instead of the provider body.
  - Done: rewrite verification hygiene scans now include new app route files,
    not only feature implementation files.
  - Done: import files and Wi-Fi presentation/action state now lives in the
    import session service instead of entry screens.
  - Done: import files and Wi-Fi review/back action labels and destinations now
    live in the import screen state service with smoke coverage instead of
    component-local link assembly.
  - Done: Wi-Fi import finish-to-review/failure decision now lives in the import
    session service with deterministic smoke coverage instead of the command
    hook branching inline.
  - Done: Wi-Fi import server startup fallback copy now lives in the Wi-Fi
    import request service with deterministic smoke coverage instead of an
    inline hook branch.
  - Done: import session command mutation fallback copy now lives in the import
    session service with deterministic smoke coverage instead of inline hook
    branches.
  - Done: import file-pick and staged-song removal fallback copy now lives in a
    pure import file command service with deterministic smoke coverage instead
    of inline hook branches.
  - Done: import staged-song edit and staged export fallback copy now lives in
    pure import services with deterministic smoke coverage instead of inline
    controller branches.
  - Done: shared collection create/edit form action state now lives in the
    collection form service instead of duplicated screen save/edit guards.
  - Done: shared collection create/edit reducer setup, edit hydration, preview
    initials, save labels, and field updates now live in a shared form-state
    controller hook instead of duplicated create/edit controller code.
  - Done: collection repository name normalization, required-name errors, and
    duplicate-name copy now live in a pure collection metadata service with
    deterministic smoke coverage.
  - Done: collection repository duplicate-name queries now live in a focused
    uniqueness repository instead of being embedded in create/update mutation
    code.
  - Done: collection delete relationship cleanup and protected playlist guards
    now live in a focused delete repository instead of the create/update
    collection repository.
  - Done: create-collection image picking, validation, create mutations,
    haptics, navigation, and mutation-error workflows now live in a controller
    hook instead of the screen.
  - Done: create-collection image picking and create/navigation side effects
    now live in a focused command hook instead of the form controller owning
    every create command path.
  - Done: collection create/edit field, artwork, validation, save, and library
    back-link rendering now share one focused form component instead of
    duplicating route-screen presentation.
  - Done: collection create/edit preview initials and save button labels now
    live in the collection form service instead of screen-local formatting.
  - Done: collection create/edit copy, field presentation, route helpers,
    image labels, preview initials, save labels, and action-state derivation
    now live in a focused form interaction service instead of the form reducer
    service.
  - Done: collection create/edit detail-route construction now lives in the
    collection form service with deterministic smoke coverage instead of
    duplicated controller route templates.
  - Done: shared collection form header, fields, image picker, validation
    errors, and save action now render through focused components instead of
    one large collection form view.
  - Done: playback queue row/action state now lives in the playback service
    instead of queue screen boundary checks.
  - Done: playback queue indexing, active/previous/replacement-track lookup,
    row action state, and queue filter defaults now live in a dedicated queue
    service instead of the session reducer service.
  - Done: playback queue add, clear, remove, move, and queue-revision
    transitions now live in a dedicated session queue service with direct smoke
    coverage instead of the playback reducer owning every queue branch inline.
  - Done: playback native status, native-finished, ad-break, and Premium sync
    transitions now live in a dedicated native transition service instead of
    the session reducer body.
  - Done: playback play, pause, resume, seek, next-skip, and previous-skip
    transitions now live in a dedicated transport service with deterministic
    smoke coverage.
  - Done: playback queue haptics and command handlers now live in a controller
    hook, and queue row/list rendering now lives in a dedicated component
    instead of the queue screen.
  - Done: playback queue empty state and queue row rendering now live in
    focused components instead of the queue list owning every row control.
  - Done: playback queue empty-state copy now lives in the playback player
    state service with smoke coverage instead of component-local copy.
  - Done: playback queue header, ad-gate panel, queue list wiring, clear action,
    and player back link now render from a focused component instead of the
    route screen.
  - Done: playback queue header, ad-gate panel, clear action, Premium link, and
    player back-link presentation now live in the playback player-state service
    with smoke coverage instead of component-local copy.
  - Done: Premium screen feature copy, tier selection cards, purchase/restore
    actions, status reset panel, and settings back link now render from a
    focused component instead of the route screen.
  - Done: Premium feature list, tier cards, purchase/restore actions, and
    status panel now render through focused components instead of one large
    Premium screen view.
  - Done: Premium purchase, restore, and entitlement fallback copy now lives in
    the Premium screen service with deterministic smoke coverage instead of
    inline provider/hook branches.
  - Done: song preview row state and playback item conversion now live in the
    song preview service instead of the preview list component.
  - Done: library song preview empty state and playback row rendering now live
    in focused components instead of the preview list owning all row JSX.
  - Done: library song preview empty-state copy and import CTA destination now
    live in the song preview service with smoke coverage instead of
    component-local copy.
  - Done: mini-player visibility, labels, metadata, and ad-blocked command state
    now live in the playback player-state service instead of the mini-player UI.
  - Done: home now-playing summary labels now live in an app-shell service
    instead of the home screen.
  - Done: home screen cross-feature summary/query/playback aggregation now
    lives in an app-shell controller hook, and recent-song rendering now lives
    in a focused component instead of the route screen.
  - Done: home hero, now-playing actions, quick links, recent-song header, and
    themed layout now render from a focused app-shell component instead of the
    route screen.
  - Done: home hero, now-playing panel, quick actions, and recent-song section
    header now render through focused app-shell components instead of one large
    home screen view.
  - Done: collection song list mutation and move/remove row action state now
    lives in the library interaction service instead of the list component.
  - Done: collection song list empty state and row rendering now live in
    focused components instead of the list owning every row control.
  - Done: collection song list empty-state copy now lives in the library
    interaction service with smoke coverage instead of component-local copy.
  - Done: library song edit form initialization and save action state now live
    in a form service instead of the edit screen.
  - Done: library song edit save fallback copy now lives in the song form
    service with deterministic smoke coverage instead of an inline controller
    branch.
  - Done: library song edit field labels, placeholders, and return-key state
    now live in the song form service with deterministic smoke coverage instead
    of component-local form copy.
  - Done: library song export snapshot hashing/staleness/mark-exported logic
    now lives in a dedicated export snapshot repository instead of the song
    metadata edit repository.
  - Done: library song edit hydration, field state, save mutation, haptics,
    navigation, and mutation-error workflows now live in a controller hook
    instead of the edit screen.
  - Done: library song edit header, metadata fields, save/cancel actions, and
    status copy now render through focused components instead of one large edit
    form view.
  - Done: library song edit query/mutation/missing/help status now lives in the
    song form service with smoke coverage instead of status-panel branching.
  - Done: library song edit hydration, field, saving, and mutation-error
    transitions now live in a song form service reducer with smoke coverage
    instead of scattered controller state setters.
  - Done: create collection form field/image/error/save transitions now live in
    a collection form service reducer with smoke coverage instead of scattered
    controller state setters.
  - Done: edit collection hydration, field/image/error/save transitions now use
    the shared collection form service reducer with smoke coverage instead of
    scattered controller state setters.
  - Done: import song edit save action state now lives in the import song form
    service instead of the edit screen.
  - Done: import staged-song edit field state, metadata draft building,
    validation errors, haptics, and save navigation now live in a controller
    hook instead of the edit screen.
  - Done: import staged-song edit form field/error transitions now live in a
    pure form-service reducer with smoke coverage instead of scattered
    controller state setters.
  - Done: import staged-song edit form fields, source-file panel, error copy,
    save action, and navigation links now live in a focused component instead
    of the route screen.
  - Done: import staged-song edit invalid/not-staged route states and
    controller-to-form wiring now live in focused components instead of the
    route screen owning fallback UI and form assembly.
  - Done: import staged-song edit invalid/not-staged copy and back-link state
    now lives in the import song form service with smoke coverage instead of
    component-local branching.
  - Done: import staged-song edit lookup now lives behind a query hook and pure
    form-service selector with smoke coverage instead of the route screen.
  - Done: import staged-song edit form back-link labels and destinations now
    live in the import song form service with smoke coverage instead of
    component-local link assembly.
  - Done: import staged-song edit header, metadata fields, source-file panel,
    error/save actions, and navigation links now render through focused
    components instead of one large edit form view.
  - Done: import staged-song preview empty state and row rendering now live in
    focused components instead of the shared preview list owning every row
    action.
  - Done: collection detail play, queue, export, and delete action state now
    lives in the library interaction service instead of the detail screen.
  - Done: collection detail playback and queue command plans now live in the
    library interaction service with deterministic smoke coverage instead of
    being derived inline in the controller hook.
  - Done: collection detail play, queue, export, delete, reorder, remove, and
    mutation-error workflows now live in a controller hook instead of the
    screen.
  - Done: collection detail export/delete/move/remove mutation flags and errors
    now live in the collection interaction service reducer with smoke coverage
    instead of scattered controller state setters.
  - Done: backup action cards, operation labels, confirmation copy, and status
    presentation now live in a backup screen service instead of the screen.
  - Done: backup phase-transition haptic and runtime-session reset decisions now
    live in the backup screen service instead of screen-local branching.
  - Done: backup operation confirmations, phase-transition side effects,
    runtime-session resets, status reset haptics, and Premium action-state
    wiring now live in a controller hook instead of the screen.
  - Done: backup action cards, Premium badges, command buttons, status panel,
    and settings back-link rendering now live in a focused backup component
    instead of the route screen.
  - Done: backup header, action list/cards, and status panel now render through
    focused components instead of one large backup screen view.
  - Done: backup settings back-link presentation now lives in the backup screen
    service with smoke coverage instead of the view.
  - Done: backup restore now unzips into a cache staging directory and rejects
    empty archives before replacing the live document directory.
  - Done: backup session reducer state transitions now live in a pure service
    with deterministic smoke coverage.
  - Done: premium feature copy, selected-tier lookup, purchase/restore action
    state, and status presentation now live in a premium screen service.
  - Done: premium screen header copy and settings back-link presentation now
    live in the premium screen service with smoke coverage instead of the view.
  - Done: premium purchase, restore, reset, tier selection, and status
    aggregation now live in a controller hook, and the Premium screen now uses
    the shared customization theme instead of hardcoded screen colors.
  - Done: premium purchase/session and tier-loading transitions now live in a
    pure premium state service with smoke coverage instead of hook-local
    reducer/setter state.
  - Done: Premium tier loading and purchase/restore/reset commands now live in
    focused hooks instead of the purchase session hook owning every side effect.
  - Done: privacy and customization status labels, control disabled state,
    swatch selection state, and haptic-toggle behavior now live in a settings
    screen service instead of settings screens.
  - Done: customization Premium gating, theme/icon updates, haptics toggle
    side effects, and screen action wiring now live in a controller hook instead
    of the customization screen.
  - Done: privacy analytics toggle haptics and persistence commands now live in
    a controller hook, and the privacy route renders through a focused
    component instead of owning the switch layout.
  - Done: support action copy now lives in the settings screen service, support
    link haptics/external URL opening live in a controller hook, and the support
    route renders through a focused component.
  - Done: privacy/support header copy, panel copy, preference copy, and settings
    back-link presentation now live in the settings screen service with smoke
    coverage instead of route view components.
  - Done: settings home route metadata and Premium status label now live in the
    settings screen service/controller, and the route renders through a focused
    component.
  - Done: settings back destinations now live in the settings screen service
    and are consumed by premium, backup, privacy, and support screens instead
    of duplicating route literals.
  - Done: Premium gate destinations now come from import/settings navigation
    services instead of hard-coded Premium links in gate components.
  - Done: import Premium gate title/body/action presentation now lives in the
    import screen state service with smoke coverage instead of the component.
  - Done: import save export/finish/discard labels now live with save action
    availability in the import session service instead of the save screen.
  - Done: import save staged-song export loading/error transitions now live in
    the import screen state service reducer with smoke coverage instead of
    controller-local state setters.
  - Done: Wi-Fi import server readiness, port, address, and failure transitions
    now live in a service reducer with smoke coverage instead of hook-local
    lifecycle setters.
  - Done: Wi-Fi import route callback refs and bridge-server port fallback
    registration now live in focused hook/service boundaries instead of the
    server lifecycle hook owning the bridge setup details.
  - Done: import save artist, album, playlist, and album-cover relationship
    linking now lives in a dedicated import library link service instead of the
    top-level library save orchestration.
  - Done: add-to-collection bulk selection count, mutation guards, and add row
    labels now live in the library interaction service instead of the screen.
  - Done: add-to-collection selection, single-add, bulk-add, and mutation-error
    transitions now live in the library interaction service reducer with smoke
    coverage instead of scattered controller state setters.
  - Done: add-to-collection song list row rendering now lives in a dedicated
    component instead of the route screen.
  - Done: add-to-collection search, selection summary, bulk-add action, status,
    and navigation presentation now live in a focused form component instead of
    the route screen.
  - Done: add-to-collection search query state now lives behind a focused hook
    backed by the library interaction service reducer instead of raw local
    state.
  - Done: add-to-collection empty state and row rendering now live in focused
    components instead of the addable song list owning selection/add controls.
  - Done: song detail like, export, and delete labels now live with action
    availability in the song detail service instead of the detail screen.
  - Done: song detail playback and export payload shaping now lives in the song
    detail service with deterministic smoke coverage instead of the controller
    hook building those objects inline.
  - Done: song detail like/export/delete mutation flags and errors now live in
    a song detail service reducer with smoke coverage instead of scattered
    controller state setters.
  - Done: song detail playback/queue actions and like/export/delete workflows
    now live in focused hooks instead of one controller owning every command
    path.
  - Done: song detail like, export, and delete mutation workflows now live in
    separate hooks instead of one mutation hook owning every command path.
  - Done: song detail relationship list rendering now lives in a dedicated
    component instead of the route screen.
  - Done: song detail header, summary cards, action row, source panel, and
    status panel now live in focused components instead of the route screen.
  - Done: song detail assembled layout and invalid route state now live in
    focused components instead of the route screen owning the full detail UI.
  - Done: playback player command availability and shuffle/loop/play labels now
    live in the playback player-state service instead of the player screen.
  - Done: playback player command handlers, haptics, seek targets, and progress
    derivation now live in a controller hook instead of the player screen.
  - Done: playback player button command callbacks now live in a focused
    player command hook instead of the player controller mixing command wiring
    with view-state derivation.
  - Done: playback player aggregate view state now lives in the player-state
    service with deterministic smoke coverage instead of being assembled in the
    controller hook.
  - Done: Expo Audio native status-to-playback snapshot translation now lives
    in a pure playback service with deterministic smoke coverage.
  - Done: playback native command planning for resume, skip next/previous, and
    active-track removal now lives in a pure playback service with deterministic
    smoke coverage instead of being embedded in the command hook.
  - Done: playback native command-plan execution now lives in the native
    command-plan service instead of the command hook interpreting every adapter
    operation inline.
  - Done: playback transport, queue/session, command-runner, and remote-command
    wiring now live in focused hooks instead of one command controller owning
    every playback command path.
  - Done: playback ad-gated command branching now lives in a pure command-gate
    service with deterministic smoke coverage instead of being hand-rolled in
    the command hook.
  - Done: playback remote failure action/native-stop planning now lives in a
    pure command-plan service with deterministic smoke coverage instead of the
    command hook dispatching and stopping inline.
  - Done: playback player ad gate, now-playing, controls, session, and error
    panels now live in focused components instead of the route screen.
  - Done: playback player assembled layout now renders through a focused
    screen view component instead of the route screen owning the full player UI.
  - Done: import Premium gate access state, checking copy, and error
    presentation now live in the import session service instead of the gate UI.
  - Done: import save export, finish, discard, haptics, and navigation
    orchestration now lives in a controller hook instead of the save screen.
  - Done: import save export state/actions and finish/discard/toggle workflows
    now live in focused hooks instead of one controller owning every save
    command path.
  - Done: import save header, save-to-library toggle, staged-song preview,
    export/finish/discard actions, export error panel, and back link now render
    from a focused component instead of the route screen.
  - Done: import save header, save-to-library toggle, export/finish/discard
    actions, and export error panel now render through focused components
    instead of one large save screen view.
  - Done: import save header copy, save-to-library toggle label, and back-link
    state now live in the import screen state service with smoke coverage
    instead of component-local copy.
  - Done: import staged-song preview empty-state copy now lives in the import
    screen state service with smoke coverage instead of component-local copy.
  - Done: import success/failure result labels now live in the import
    screen-state service with deterministic smoke coverage instead of being
    computed inline in route screens.
  - Done: import success/failure result screens now share a focused result view
    component instead of duplicating themed header, panel, and back-link UI.
  - Done: import home route metadata, Premium lockout destinations, staged
    counts, Wi-Fi status labels, and route-selection haptics now split between
    an import session service, controller hook, and focused component instead
    of the route screen.
  - Done: import files choose/remove haptics and navigation now live in a
    controller hook, and the themed files UI now renders through a focused
    component instead of the route screen.
  - Done: import save-to-library metadata planning now lives in a pure service
    with deterministic smoke coverage for unknown labels and multi-artist
    splitting.
  - Done: Wi-Fi import transfer-size validation, duplicate upload rejection,
    accepted upload responses, and error response copy now live in a pure
    request service with deterministic smoke coverage.
  - Done: Wi-Fi import server/session status derivation, staged-song removal
    haptics, and review-save haptics now live in a controller hook instead of
    the route screen.
  - Done: Wi-Fi import HTTP route handlers and transfer runtime state now live
    in an import service instead of the server hook owning every bridge route.
  - Done: Wi-Fi import address/progress panels, staged-song preview, review
    action, and import back link now render from a focused component instead
    of the route screen.
  - Done: Wi-Fi import header, address status, progress, and review/back
    actions now render through focused components instead of one large Wi-Fi
    screen view.
  - Done: import session Wi-Fi transfer setup and save/discard/reset
    lifecycle commands now live in focused hooks instead of one import command
    aggregator owning every command path.
  - Done: customization and privacy settings now share a typed persistence
    reducer/loader boundary, and customization save/icon commands live in a
    focused hook instead of the provider-facing settings hook.
- [ ] Finish repository/query coverage for all high-traffic library workflows.
  - Songs, playlists, albums, and artists have Drizzle-backed query coverage.
  - Remaining gaps should be audited from screens/forms rather than assumed.
- [ ] Add focused regression coverage or deterministic smoke helpers for the
  highest-risk domains: import, save-to-library, backup restore, playback queue,
  and library edits.
  - Done: add `pnpm verify:rewrite` to run the repeatable rewrite gate:
    typecheck, lint, whitespace, architecture scans, and old/new iOS export
    smokes with export-artifact cleanup.
  - Done: extend the rewrite gate with an AsyncStorage boundary scan so direct
    storage usage stays behind feature storage services.
  - Done: add deterministic reducer smoke coverage for playback queue/ad-gate
    behavior and import session transitions through `@synq/rewrite-smoke`.
  - Done: extend deterministic smoke coverage to library collection detail row
    aggregation for playlist, album, and artist detail surfaces.
  - Done: extend deterministic smoke coverage to library collection preview
    aggregation, sorting, limits, image resolution, and fallback labels.
  - Done: extend deterministic smoke coverage to library song preview
    aggregation, search filtering, sort order, limits, and fallback labels.
  - Done: extend deterministic smoke coverage to add-to-collection song picker
    aggregation, query filtering, linked-state ordering, limits, and fallback
    labels.
  - Done: extend deterministic smoke coverage to library song detail shaping,
    relationship dedupe, duration formatting, liked state, and missing-song
    fallbacks.
  - Done: extend deterministic smoke coverage to edit-collection query state,
    image resolution, year formatting, and loaded-missing fallbacks.
  - Done: preserve edit-collection query shaping smoke coverage while reducing
    the live query fan-out at the route component boundary.
  - Done: preserve addable-song shaping smoke coverage while reducing
    add-to-collection relationship query fan-out.
  - Done: extend addable-song smoke coverage to linked relationship row
    normalization for null-safe linked song IDs.
  - Done: preserve collection detail shaping smoke coverage while reducing
    collection detail route live query fan-out.
  - Done: extend song detail smoke coverage to liked-state derivation from the
    shared Liked Songs playlist membership.
  - Done: keep add-to-collection selection helper smoke coverage while moving
    async command coordination into a feature hook.
  - Done: keep song detail action-state smoke coverage while moving async
    command coordination into a feature hook.
  - Done: keep import reducer/persistence verification gates intact while
    slimming provider-owned persistence effects.
  - Done: keep import file selection/removal behavior behind existing reducer
    smoke coverage while moving file commands into a hook.
  - Done: keep playback reducer/persistence verification gates intact while
    slimming provider-owned persistence effects.
  - Done: keep playback ad-gate reducer smoke coverage intact while moving
    provider ad-gate orchestration into a hook.
  - Done: keep playback reducer native-status and ad-completion coverage intact
    while moving native listener wiring into a hook.
  - Done: keep playback reducer queue/ad-gate smoke coverage intact while
    moving playback command orchestration into a hook.
  - Done: keep playback reducer native-finished smoke coverage intact while
    moving active-track advancement into a hook.
  - Done: extend rewrite verification gates to route-file event, console,
    dimensions, and AsyncStorage scans.
  - Done: extend deterministic smoke coverage to collection form year parsing
    for blank, valid, and invalid album year inputs.
  - Done: extend deterministic smoke coverage to collection list search
    filtering across title, meta, detail, whitespace, and case-insensitive
    queries.
  - Done: extend deterministic smoke coverage to collection list empty and
    status label derivation.
  - Done: extend deterministic smoke coverage to shared duration formatting for
    empty, rounded, long, and remaining-time labels.
  - Done: extend deterministic smoke coverage to shared route param parsing for
    scalar, array, missing, and invalid route values.
  - Done: extend deterministic smoke coverage to import staged-song edit form
    track parsing, fallback labels, and trimmed metadata.
  - Done: extend deterministic smoke coverage to collection detail interaction
    helpers for playable filtering, adjacent reorder, and no-op boundaries.
  - Done: extend deterministic smoke coverage to add-to-collection selection
    helpers for linked-song exclusion, toggles, and post-add removal.
  - Done: extend deterministic smoke coverage to add-to-collection row state
    for selected, saving, and already-linked songs.
  - Done: extend deterministic smoke coverage to collection detail route and
    deletion guard rules for protected playlists and missing collections.
  - Done: extend deterministic smoke coverage to the shared settings
    persistence reducer for load, save, success, failure, and rollback states.
  - Done: extend deterministic smoke coverage to player progress, seek
    clamping, and free-listening remaining-time calculations.
  - Done: extend deterministic smoke coverage to song detail relationship hrefs
    and play/export/like/delete action availability.
  - Done: extend deterministic smoke coverage to import save export, finish,
    and discard availability across empty, ready, exporting, and saving states.
  - Done: extend deterministic smoke coverage to playlist, album, and artist
    collection preview href generation.
  - Done: extend deterministic smoke coverage to import files working labels
    and Wi-Fi ready, receiving, error, progress, and review-save states.
  - Done: extend deterministic smoke coverage to collection form editable,
    image-pick, save, blank-name, saving, and missing-collection states.
  - Done: extend deterministic smoke coverage to collection form preview
    initials and saving/default button labels.
  - Done: extend deterministic smoke coverage to playback queue active rows,
    move boundaries, ad-break play disabling, and clear-queue availability.
  - Done: extend deterministic smoke coverage to song preview playable/active
    row state and playback item conversion.
  - Done: extend deterministic smoke coverage to mini-player hidden routes,
    remaining-time metadata, play/pause labels, and ad-break blocking.
  - Done: extend deterministic smoke coverage to home now-playing labels for
    empty, paused, and playing playback states.
  - Done: extend deterministic smoke coverage to collection song list
    move/remove labels, mutation guards, and boundary states.
  - Done: extend deterministic smoke coverage to library song edit form
    initialization, blank-title guards, saving labels, and missing-song guards.
  - Done: extend deterministic smoke coverage to import song edit save
    availability for populated and blank titles.
  - Done: extend deterministic smoke coverage to collection detail play, queue,
    export, delete, busy-label, protected-playlist, and missing-state actions.
  - Done: extend deterministic smoke coverage to backup action-card order,
    premium badges, running disabled state, confirmation copy, and status text.
  - Done: extend deterministic smoke coverage to backup phase-transition haptic
    and runtime-session reset intents.
  - Done: extend deterministic smoke coverage to premium feature copy,
    selected-tier lookup, loading guards, action labels, and status text.
  - Done: extend deterministic smoke coverage to privacy/customization status
    labels, Premium locks, loading guards, swatch state, and haptic-toggle
    behavior.
  - Done: extend deterministic smoke coverage to import save export, finish,
    and discard labels across empty, ready, exporting, and saving states.
  - Done: extend deterministic smoke coverage to add-to-collection bulk
    selection labels, mutation guards, linked-song filtering, and row labels.
  - Done: extend deterministic smoke coverage to song detail like, export, and
    delete labels across ready, busy, liked, and missing states.
  - Done: extend deterministic smoke coverage to playback player command
    availability, seek boundaries, ad-break blocking, and mode labels.
  - Done: extend deterministic smoke coverage to import Premium gate active,
    checking, and failure states.
  - Done: extend deterministic smoke coverage to import home Premium routing,
    staged counts, Wi-Fi progress, and save phase labels.

### Phase 3: New App Build-Out

- [x] Define the `apps/new` feature map before moving more UI.
  - App shell/navigation: route shell exists with root stack, tabs, feature
    stack placeholders, thin route files, Home/Library/Import/Settings primary
    tabs, and a replacement-oriented Home route with live library/playback state
    plus premium, player, and queue entry points.
  - Library: first reactive Drizzle summary, searchable/sortable song surface,
    collection previews with all-collection browse routes, user-facing library
    home copy and empty states,
    song/playlist/album/artist detail routes with song and collection playback
    entry points plus navigable song relationship rows, library song metadata
    editing, playlist/album/artist
    create/edit flows, collection song add/remove flows with bulk add selection,
    song and collection file sharing/export actions with stale metadata tag
    writeback and export snapshot tracking,
    Liked Songs toggles, library song deletion, and guarded collection deletion,
    durable
    album/playlist/artist song reorder flows, and collection cover/profile image
    picking, persistence, and thumbnail rendering exist.
  - Playback: explicit session state, queue/player screens, an Expo Audio
    adapter for play/pause/seek/skip, native status/progress sync,
    filesystem-backed session persistence, queue reordering, and player
    progress controls, active-track removal handling, queue clearing, shuffled
    next-track advancement for manual skip and native completion, a tab-shell
    mini player for active tracks, and
    persisted Premium/free-listening ad gate state with bundled ad audio
    playback exist. The playback reducer, queue transitions, selectors, and ad
    gate state transitions now live in a feature service while the provider
    focuses on native adapter orchestration, persistence, and commands. Remote
    command semantics for play/pause/next/previous/seek,
    queue-ended, and error handling now exist behind the provider boundary;
    Expo Audio is installed/configured for background playback and is now the
    active playback adapter; player/queue screens now consume saved theme state
    while keeping the ad-break warning treatment distinct. Lock-screen event
    wiring and manual smoke coverage are next.
  - Import/ingest: route-per-step import shell, session state, file picker,
    Wi-Fi transfer route/server, cache staging, metadata/duration extraction,
    preview/save screens, staged metadata editing, and Drizzle draft-to-library
    save/discard commands with durable audio file movement and cover/artwork
    persistence exist behind Premium gates; import stack/home/files/save/result,
    shared staged-song preview lists, and Premium gate surfaces now consume
    saved theme state, file-pick/remove/save/discard/edit actions use
    preference-aware haptics, and staged-file cleanup now runs when songs are
    removed or discarded. Staged import sessions now persist a validated
    manifest across route/provider remounts while keeping staged audio in cache.
    Import session state transitions now live in a feature service, leaving the
    provider focused on file/cache/persistence orchestration.
    Wi-Fi transfer now falls back across a small local port range and reports
    the active port. Import review can also export staged draft files before
    save/discard. Deeper manual smoke is next.
  - Backup/restore: feature-owned backup screen and command-state boundary
    exist; backup archive/share, restore document picking/unzip/reset, and
    erase document cleanup/database reset are connected. The backup command
    screen now consumes saved theme state and preference-aware haptics for
    command start/success/failure/reset feedback; successful restore/erase now
    resets live playback and staged import runtime state. Manual restore smoke
    and edge-case hardening are next.
  - Premium/settings: settings home, premium screen, customization/backup
    routes, privacy/support routes, live RevenueCat pricing, purchase, restore
    commands, an app-wide entitlement provider, persisted customization
    preferences for theme, app icon, haptics, and analytics, and saved-theme
    consumption across navigation, loading/placeholder states, settings,
    library home/shared list components,
    library create/edit/detail/add-song surfaces, playback player/queue
    surfaces, and the backup command surface, import home/files, and import
    Premium gate surfaces exist;
    native app icon assets/config and a settings-owned native icon service are
    wired; haptic feedback now flows through a preference-aware settings hook
    for customization, playback, queue, collection save actions, collection
    detail song mutations, library song-list sort controls, song detail
    play/queue actions, add-to-collection mutations, backup command feedback,
    privacy/support actions, and import file-pick/remove/save/discard/edit
    actions. Native-build icon/haptics smoke and remaining non-theme feature
    polish are next.
- [ ] Move reusable feature logic from `apps/old` into shared app-local modules
  that `apps/new` can consume without copying UI spaghetti.
- [ ] Build the `apps/new` screens against reactive Drizzle query hooks instead
  of event/callback refresh flows.
- [ ] Rebuild playback as an explicit state machine/service boundary rather
  than context-wide imperative state.
- [ ] Rebuild import and ingest with Effect-style orchestration where it buys
  clarity, cancellation, and typed errors.
- [ ] Replace copied old UI with slim components plus feature hooks/services.
- [ ] Make `apps/new` pass typecheck, lint, and iOS export smoke.

### Phase 4: Cutover Readiness

- [ ] Manually smoke the old reference app after every risky migration slice.
- [ ] Manually smoke the new app feature-by-feature once screens exist:
  - Library browsing/search/sort
  - Album/artist/playlist detail and edit flows
  - Import files and Wi-Fi import
  - Save-to-library and discard import
  - Playback, queue, shuffle/repeat, mini player, and player screen
  - Backup restore/erase
  - Premium purchase/restore state
  - Settings customization, privacy, support, app icon, and haptic preferences
- [ ] Compare old and new behavior for the core user journeys.
- [ ] Decide whether `apps/new` replaces `apps/old`, or whether `apps/old` is
  kept as a legacy reference until a later branch.
- [ ] Remove dead compatibility shims once the new app no longer depends on
  them.
- [ ] Final gate: root `pnpm typecheck`, root `pnpm lint`, old-app export smoke,
  new-app export smoke, and a clean architectural scan for event emitters,
  stray console calls, static `Dimensions.get`, and unisolated AsyncStorage.

### Current Position

We are solidly through Phase 1, well into Phase 2, and starting Phase 3. The
`apps/new` shell now has a root stack, Home/Library/Import/Settings tabs, thin route files, a
replacement-oriented Home route with live library/playback state, feature
boundaries, database initialization, and a first reactive Library surface with
searchable/sortable songs, linked details, collection create/edit flows, song
add/remove, durable album/playlist/artist song reorder, and collection
cover/profile image persistence/rendering. Settings now has a feature-owned
home with backup, customization, and premium route entry points. Playback now
has a
reducer-backed session boundary plus queue/player screens connected to a native
Expo Audio adapter for saved library files with native progress/status sync,
persisted session restore, queue reordering, player progress controls, and
queue removal that advances active playback when possible. Free playback now
tracks the old 10-minute ad threshold in persisted session state, pauses
playback commands at an ad break, and lets Premium bypass/reset the gate;
the bundled ad asset now plays during the break and resumes the library track
when it finishes. Playback remote command semantics now have a typed service
boundary that shares the same ad-gated commands and loop-at-queue-end behavior
as native playback completion, but the current Expo Audio adapter still needs a
native-capable remote event source before lock-screen/headphone controls can be
considered done. Expo Audio has been added to `apps/new`, configured for
background playback, and made the active adapter; this SDK 53 API does not yet
expose the newer lock-screen methods, so that wiring remains a future native
backend/API step. Import now has a
route-per-step session shell, native file selection, Premium-gated file/Wi-Fi
entry, a Wi-Fi transfer route/server, cache staging,
metadata/duration extraction, and Drizzle draft saves, including moving cached
audio into durable library storage, persisting artwork to shared image storage,
and editing staged song metadata before save. Backup now has a
feature-owned command-state shell with real archive/share, restore, and
erase/reset commands. Premium now has a feature-owned purchase session shell
connected to RevenueCat pricing, purchase, restore commands, and an app-wide
entitlement provider consumed by Settings, Backup, and Customization. Settings
now owns persisted theme, app icon, haptic, and privacy analytics preference
state, plus support/contact routes;
the app shell, loading states, settings screens, library home,
library shared summary/search/sort/preview/list components, library
create/edit/detail/add-song surfaces, playback player/queue surfaces, and the
backup command surface, import home/files/save/result/Wi-Fi/edit, shared import
preview lists, and import Premium gate surfaces consume saved theme state
through a shared palette hook; deeper non-theme feature polish, native remote
playback event ingestion, and manual playback smoke are still next.
Native app icon assets/config now exist in `apps/new`, and
app-icon preference changes flow through a settings-owned native service, but
alternate icon behavior still needs a native prebuild/device smoke. Haptic
preference state is now consumed by a settings-owned haptics hook in
customization, playback, queue, collection save paths, collection detail song
mutations, backup command feedback, and import file-pick/remove actions, but
broader feature coverage and native-device haptic smoke are still pending.
Import save/discard/edit and Wi-Fi staged-song removal/review actions now also
use the preference-aware haptics boundary. It has a real replacement-app home,
but it is not yet a replacement app overall.
The next useful work should alternate between:

- closing Phase 2 gaps that would otherwise be copied into the new app; and
- defining/building `apps/new` feature surfaces so cleanup does not become an
endless old-app polishing loop.

## Current Verification

- `pnpm install` succeeds for the workspace.
- `pnpm lint` succeeds through Turbo with warnings only.
- `pnpm verify:rewrite` succeeds and is the preferred repeatable guardrail for
  rewrite checkpoints, including event-emitter, feature hygiene, AsyncStorage
  boundary scans, deterministic playback/import reducer smokes, and old/new iOS
  export smokes.
- `pnpm --filter @synq/old exec expo export --platform ios --output-dir dist-export-smoke`
  succeeds, proving the old app still bundles from `apps/old`.
- `pnpm --filter @synq/db lint` and `pnpm --filter @synq/db typecheck`
  succeed. `@synq/db` is now the Drizzle schema, migration, and runtime DB
  package consumed by `apps/old`.
- `pnpm --filter @synq/audio lint` and `pnpm --filter @synq/audio typecheck`
  succeed. `@synq/audio` owns reusable Expo-bound audio duration, metadata,
  supported-file-type, and ingest track-number helpers consumed by `apps/old`.
- `pnpm --filter @synq/old typecheck` succeeds. The playback nullability cluster around
  `PlaybackProvider`, `usePlayer`, `MiniPlayer`, `PausePlayButtons`,
  `ShuffleButton`, and `PlayerController` has been reduced, and `SongList`
  source metadata now has local defaults/guards. The shared list/query UI
  boundary has also been tightened around optional sort state, draggable item
  rendering, and album/artist relation rows. Album, artist, and playlist
  create/edit routes now normalize optional form values to `undefined`, and
  their update controllers expose the optional-field behavior they already had
  at runtime. The home/player playback route now guards missing TrackPlayer
  index, track, and source metadata before updating local playback state or
  rebuilding queues. Backup settings now resolve the Expo document directory
  once before filesystem operations and wrap restore/erase substep errors
  without relying on invalid `Error` constructor overloads. Treat remaining
  errors as a tracked cleanup lane, not a monorepo migration blocker.
  Cover editing now treats missing entity IDs as a transparent placeholder and
  only calls persisted cover loaders when a real ID is available. Premium
  restore now reads the active RevenueCat entitlement and represents lifetime
  purchases with a nullable expiration. Audio and color utility controllers now
  guard missing duration and invalid RGB parses before returning media metadata.
  Import/export and save-to-library controllers now require real cache/file
  paths before filesystem work and avoid creating orphaned library rows when
  imported path data is incomplete. Legacy song controllers/models now guard
  optional row IDs, metadata fields, and filesystem paths locally, and the old
  player no longer depends on `react-native-crossfade-image` for background
  transitions.

## Priority Lanes

1. Stabilize database ownership.
   - `shared/db` now owns Drizzle schema, migrations, and database init.
   - Legacy `Model.createTables()` / manual SQL setup has been retired; backup
     restore/erase now reopens the shared Drizzle database connection and runs
     migrations.
   - Audit legacy models for writes to removed columns such as `artists`,
     `album`, `genre`, `fileName`, and `edited`.

2. Build typed repositories and reactive query hooks.
   - Start with songs because they touch player, library, import, edit, and
     queue flows.
   - `apps/old/src/features/library/hooks/use-library-songs-query.ts` now
     owns the first list-level library songs live query.
   - `apps/old/src/features/library/repository/song-metadata-repository.ts`
     now owns saved-library title and relation writes for song edits.
   - Add hooks such as `useSongRelationsQuery` and `usePlaylistSongsQuery`.
   - Avoid per-row live queries in large lists.

3. Replace event buses.
   - Done: `apps/old/src/events` has been removed.
   - Convert one domain at a time to database-backed reactive queries or typed
     domain actions.
   - Song/library refresh has started. `Songs.tsx` no longer listens for
     `SONG_DELETED` or `PLAYLIST_SONGS_IMPORTED`; it receives sorted,
     filtered library data from `useLibrarySongsQuery`.
   - `SONG_INFO_MODIFIED` has been removed from the saved-library edit path;
     metadata edits now update `songs`, `artistSongs`, and `albumSongs`.
   - Saved-library cover edits now update `songs.coverImage` or
     `albums.coverImage`, and `Song.tsx` renders cover art from the
     list-level live query instead of `SONG_COVER_MODIFIED` or
     `ALBUM_IMAGE_MODIFIED`.
   - Playlist library refresh has started. `Playlists.tsx` now reads from
     `useLibraryPlaylistsQuery` instead of listening for `PLAYLIST_CREATED`,
     `PLAYLIST_DELETED`, or `PLAYLIST_SONGS_IMPORTED`.
   - Playlist detail content has started. `app/playlist/playlist.tsx` now
     reads its header info from `usePlaylistInfoQuery` and its songs from
     `useLibrarySongsQuery` instead of listening for `PLAYLIST_CONTENT_MODIFIED`,
     `PLAYLIST_SONG_COUNT_MODIFIED`, or `PLAYLIST_NAME_MODIFIED`.
   - Playlist edit now hydrates its form from `usePlaylistInfoQuery` instead
     of route-local `getPlaylistInfo` controller refresh.
   - Playlist edit now writes name and cover changes through the Drizzle-backed
     library entity repository instead of the legacy playlist controller.
   - Playlist delete now removes playlist rows and joins through the
     Drizzle-backed library entity repository instead of the legacy playlist
     controller.
   - Playlist export now reads songs through the Drizzle-backed library song
     repository instead of the legacy playlist controller.
   - Album library refresh has started. `Albums.tsx` now reads from
     `useLibraryAlbumsQuery` instead of listening for `ALBUM_CREATED`,
     `ALBUM_DELETED`, `ALBUM_MODIFIED`, or `PLAYLIST_SONGS_IMPORTED`.
   - Artist library refresh has started. `Artists.tsx` now reads from
     `useLibraryArtistsQuery` instead of listening for `ARTIST_CREATED`,
     `ARTIST_DELETED`, `ARTIST_MODIFIED`, or `PLAYLIST_SONGS_IMPORTED`.
   - Album detail content has started. `app/album/album.tsx` now reads album
     info/artists from `useAlbumInfoQuery` and songs from `useAlbumSongsQuery`
     instead of listening for `ALBUM_MODIFIED`, `ALBUM_TOGGLED_ON_SONG`, or
     `ALBUM_REORDERED`.
   - Album reorder now reads songs from `useAlbumSongsQuery` and writes order
     changes through a Drizzle-backed album-song repository instead of
     route-local controller fetch/update loops.
   - Album edit now hydrates album fields and artist relations from
     `useAlbumInfoQuery` instead of route-local `getAlbumInfo` and
     `getArtistsFromAlbum` controller refresh.
   - Album edit now writes name, year, and cover changes through the
     Drizzle-backed library entity repository instead of the legacy album
     controller.
   - Album delete now removes album rows and joins through the Drizzle-backed
     library entity repository instead of the legacy album controller.
   - Album export now reads songs through the Drizzle-backed library song
     repository instead of the legacy album controller.
   - Artist detail content has started. `app/artist/artist.tsx` now reads
     artist info, songs, and albums from `useArtistInfoQuery`,
     `useArtistSongsQuery`, and `useArtistAlbumsQuery` instead of listening for
     `ARTIST_MODIFIED`, `ARTIST_TOGGLED_ON_SONG`, album events, or
     `PLAYLIST_SONGS_IMPORTED`.
   - Artist edit now hydrates its form from `useArtistInfoQuery` instead of
     route-local `getArtistInfo` controller refresh.
   - Artist edit now writes name and cover changes through the Drizzle-backed
     library entity repository instead of the legacy artist controller.
   - Artist delete now removes artist rows and joins through the Drizzle-backed
     library entity repository instead of the legacy artist controller.
   - Artist export now reads songs through the Drizzle-backed library song
     repository instead of the legacy artist controller.
   - Cover picking for album, artist, playlist, and song edit/create flows now
     lives in the images feature repository instead of the legacy image
     controller.
   - Album, artist, and playlist edit cover previews now receive live-query
     image props and no longer ask `EditCover` to fetch legacy entity cover
     directories.
   - Album and artist row metadata now renders from props; `AlbumItem` no
     longer listens for `ALBUM_MODIFIED`, and `ArtistItem` no longer listens
     for `ARTIST_MODIFIED`.
   - Playlist row metadata and counts now render from props; `PlaylistItem` no
     longer listens for `PLAYLIST_NAME_MODIFIED` or
     `PLAYLIST_SONG_COUNT_MODIFIED`.
   - Add-to-playlist now reads from `useLibraryPlaylistsQuery` with
     membership prioritization instead of listening for `PLAYLIST_CREATED`.
   - Add-to-album now reads from `useLibraryAlbumsQuery` with membership
     prioritization instead of listening for `ALBUM_CREATED`.
   - Add-to-artist now reads from `useLibraryArtistsQuery` with membership
     prioritization and source tagging instead of listening for
     `ARTIST_CREATED`.
   - Playlist, album, and artist create screens no longer emit now-unused
     `PLAYLIST_CREATED`, `ALBUM_CREATED`, or `ARTIST_CREATED` events.
   - Artist create now writes through a Drizzle-backed library entity
     repository and stores cover art by image hash instead of calling the
     legacy artist controller from the route.
   - Playlist and album create now share the same Drizzle-backed library entity
     repository and controlled form inputs instead of route-level legacy
     controller create calls.
   - Playlist, album, and artist create form side effects now live in a shared
     library feature hook, moving cover picking, repository writes, haptics,
     notifications, and cancel/success navigation out of the create routes.
   - Playlist, album, and artist edit form side effects now live in a shared
     library feature hook, moving name/year validation, cover picking,
     repository updates, notifications, and close/add-artist navigation out of
     the edit routes.
   - Import song rows now receive artist/album display metadata through
     immutable `results` updates when import relations are toggled, so
     `Song.tsx` no longer listens for `ARTIST_TOGGLED_ON_SONG` or
     `ALBUM_TOGGLED_ON_SONG`.
   - Song edit relation refresh now keys off focus refresh and `editSong`
     context updates from the add/remove rows instead of
     `ARTIST_TOGGLED_ON_SONG` or `ALBUM_TOGGLED_ON_SONG` listeners.
   - Song edit saved-library relation hydration now reads artists and albums
     through the Drizzle-backed library song repository instead of legacy
     artist/album controllers.
   - Player and playback queue display song hydration now reads through the
     Drizzle-backed library song repository instead of `SongController`.
   - Library song cover resolution now lives in the Drizzle-backed song
     repository and is shared by playback track creation, mini player, player
     edit, song edit, and song sheets instead of routing through
     `SongController` cover helpers.
   - Import-song cover fallback, import-result removal, and song list key
     generation now live in feature-level helpers instead of requiring
     `SongController` from UI components.
   - Import song edit saves now run through the import feature helper with
     hash-backed album cover updates, removing the final app-level
     `SongController` import.
   - Playlist membership checks and mutations now use the Drizzle-backed
     library entity repository from song options, import controls, and playlist
     rows instead of `PlaylistController`.
   - Library song deletion now runs through the Drizzle-backed song repository
     from import controls and song options, including relation cleanup and
     filesystem removal instead of `LibraryController`.
   - Album and artist add/remove row actions now mutate song/album join tables
     through Drizzle-backed repositories instead of `AlbumController` and
     `ArtistController`.
   - Edit cover fallback loading now uses the Drizzle-backed library song cover
     repository instead of chaining through album and image controllers.
   - Song edit saves now call a feature-level library metadata repository
     batch update instead of `LibraryController.updateSongsInLibrary`.
   - Color helpers now live in `src/lib/color-utils`, with UI/app imports moved
     off `ColorController` and the unreferenced compatibility shim removed.
   - Import save-to-library now runs through a feature-level import library
     saver with Drizzle-backed song creation, playlist/album/artist joins, and
     repository cover updates instead of `LibraryController.saveToLibrary`.
   - Import cache cleanup for the "do not save to library" path now lives in
     the import feature edit helpers instead of `ImportExportController`.
   - Wi-Fi import upload processing now lives in the import feature layer,
     using repository-backed metadata album/artist creation instead of
     importing `ImportExportController` from the server component.
   - Song metadata updates now resolve album/artist metadata through library
     repository helpers instead of `AlbumController`/`ArtistController`.
   - Export UI actions now import `exportSongs` from the export feature module
     instead of `ImportExportController`, leaving the metadata writer internals
     as the next export cleanup seam.
   - `ImportExportController.exportSongs` is now a compatibility alias to the
     export feature implementation instead of a duplicate export body.
   - Export metadata comparison and writeback now live in the export feature
     layer, using repository/import cover lookups instead of `SongController`.
   - `ImportExportController` now delegates its remaining compatibility exports
     to import/export feature modules instead of carrying legacy import/export
     implementations.
   - Premium purchase calls now live behind a premium feature service instead
     of importing `PurchaseController` from the premium screen/provider.
   - Remaining relative component imports of `ColorController` now point at
     `src/lib/color-utils`.
   - Unreferenced `AudioController`, `ColorController`,
     `ImportExportController`, `LibraryController`, and `PurchaseController`
     files have been removed after their app-facing behavior moved to feature
     modules or shared libs.
   - Legacy cover filesystem helpers now live in the images feature repository,
     and remaining controllers import that feature code directly instead of
     depending on `ImageController`.
   - Legacy models now hydrate song artist/album display metadata through the
     library song repository instead of importing album/artist controllers.
   - Legacy song-result mapping now lives in the library feature layer instead
     of being exported from `SongController` for other controllers to reuse.
   - Song edit-flag writes now go through a library metadata repository
     compatibility helper, removing `AlbumController` and import edit helpers
     from direct `SongController`/`SongModel` calls for that mutation.
   - Library album/song cover fallbacks now live in feature repositories, so
     `SongController` no longer imports `AlbumController` for cover or album
     song lookups.
   - The remaining unreferenced legacy controllers (`AlbumController`,
     `ArtistController`, `PlaylistController`, and `SongController`) have been
     removed after app, feature, model, and controller callers moved off the
     controller layer.
   - Export completion writes now go through the library metadata repository
     compatibility helper instead of importing `SongModel` from the export
     feature.
   - Backup restore/erase database reset now goes through a backup feature
     service instead of importing legacy `Model` directly from the settings
     route.
   - Unreferenced legacy `AlbumModel`, `ArtistModel`, and `PlaylistModel`
     files have been removed.
   - Song edited/export compatibility now uses the Drizzle-backed library song
     snapshot instead of legacy `SongModel`.
   - Backup restore/erase database reset now uses the shared `@synq/db` reset
     helper instead of the legacy `Model`; `apps/old/src/models` has been
     removed.
   - Backup, restore, erase, support-alert, and premium navigation side
     effects now live in a backup feature hook, leaving
     `app/settings/backup.tsx` as a slimmer settings route.
   - Premium screen purchase bootstrapping, RevenueCat purchase/restore
     actions, notifications, haptics, and loading state now live in a premium
     feature hook, leaving `app/premium.tsx` focused on rendering.
   - The unused legacy `SongResultType` row shape and song result mapper have
     been removed after the model/controller callers disappeared.
   - Album edit artist relation refresh now keys off focus refresh and
     `editAlbum` context updates from add/remove rows instead of
     `ARTIST_TOGGLED_ON_ALBUM`.
   - Album and artist row covers now render from Drizzle-backed live query
     image props instead of `ALBUM_IMAGE_MODIFIED` or `ARTIST_IMAGE_MODIFIED`
     listeners.
   - Playlist row covers now render from Drizzle-backed live query image props
     instead of `PLAYLIST_IMAGE_MODIFIED` listeners.
   - Playlist, album, and artist sheet headers now render cover art from the
     action-sheet entity image props instead of legacy cover controller
     filesystem lookups.
   - Song sheet option side effects now live in an action-sheet feature hook,
     moving queue, edit, export, delete, playlist membership, liked-song,
     analytics, loading, and navigation actions out of the option row
     component.
   - Import footer controls now route through an import feature hook, moving
     cancel/next/finish navigation, Wi-Fi reset, batch edit/delete, selection
     cleanup, and import-result mutation out of the footer component.
   - Song edit form orchestration now lives in a library feature hook, moving
     relation hydration, cover picking, import/library metadata saves,
     selection cleanup, and edit navigation out of the route component.
   - Song row interaction state now lives in a library feature hook, moving
     selection mutation, import cover fallback loading, sheet presentation,
     haptics, and row animation state out of the row component.
   - Album row interaction state now lives in a library feature hook, moving
     add/remove membership writes, import-result synchronization, fallback
     cover loading, sheet presentation, haptics, and navigation out of the row
     component.
   - Artist row interaction state now lives in a library feature hook, moving
     song/album membership writes, import-result synchronization, fallback
     cover loading, sheet presentation, haptics, and navigation out of the row
     component.
   - Playlist row interaction state now lives in a library feature hook,
     moving membership writes, fallback cover loading, sheet presentation,
     haptics, and navigation out of the row component.
   - Library category list query/sort/order state now lives in a shared
     library feature hook, removing repeated state plumbing from the songs,
     albums, artists, and playlists category components.
   - Album, artist, and playlist detail screens now reuse the shared library
     query/sort/order state hook, keeping route-local state focused on detail
     view concerns such as tabs and scroll position.
   - Album, artist, and playlist detail sheet presentation now lives in an
     action-sheet feature hook, moving haptics, edit-entity context updates,
     sheet presentation, and presenter error handling out of the route
     components.
   - Album, artist, and playlist row hooks now reuse the shared entity sheet
     presenter instead of owning duplicate haptic, context, and TrueSheet
     presentation paths.
   - Song row sheet presentation now lives in an action-sheet feature hook,
     moving edit-song context updates, haptics, import-vs-library sheet
     routing, and presenter error handling out of the row hook.
   - Library and import song sheets now share a song action-sheet presentation
     component, keeping the two sheet wrappers focused on selecting option
     mode instead of duplicating header, cover, scroll, and option layout.
   - Song sheet header rendering now lives in one action-sheet component shared
     by the library/import sheets and the player edit sheet route.
   - Playlist, album, and artist action sheets now share an entity sheet
     presentation shell and header, leaving each concrete sheet to supply only
     its selected entity data and option list.
   - Player screen edit and add-to-playlist commands now live in a playback
     feature hook, moving action-sheet context writes, haptics, and navigation
     out of the player route component.
   - Player song edit sheet pull-dismiss behavior now lives in a playback
     feature hook, moving TrueSheet dismissal and haptics out of the route.
   - Player playback controls now live in a playback feature component,
     removing static control layout and styling from the player route.
   - Player add-to-playlist and more-action buttons now live in a playback
     feature component, continuing to slim static presentation out of the
     player route.
   - Player blurred artwork background and animated gradient now live in a
     playback feature component, leaving the player route to compose state,
     cover art, metadata, and controls.
   - Player track metadata row now lives in a playback feature component,
     keeping song labels, row spacing, and player action buttons out of the
     route.
   - Add-to-playlist, add-to-album, and add-to-artist routes now share a
     library feature screen shell for modal chrome, query controls, new/create
     navigation, and close handling.
   - Playlist, album, and artist create routes now share a library feature
     create screen for modal chrome, cover editing, text inputs,
     notifications, and cancel/create actions.
   - Playlist, album, and artist edit routes now share a library feature edit
     screen for modal chrome, cover editing, text inputs, notifications, and
     close handling, while album still supplies its artist relation section.
   - Song edit route UI now lives in a library feature screen component,
     moving modal chrome, cover editing, metadata fields, relation previews,
     notifications, and close controls out of the app route.
   - Song edit album and artist relation sections now share a library feature
     component for field chrome, empty states, row wrapping, and add actions.
   - Premium route UI now lives in a premium feature screen component, moving
     purchase options, status copy, legal links, hero media, notifications, and
     modal chrome out of the app route.
   - Premium purchase options and footer state now live in a focused premium
     feature panel, separating purchase/status/legal actions from the screen
     hero and modal shell.
   - Premium hero media, feature pager placement, logo, and headline copy now
     live in a premium feature component, leaving the premium screen focused on
     modal shell and purchase-flow composition.
   - Settings index route UI now lives in a settings feature screen component,
     moving modal chrome, navigation options, review/support actions, social
     links, analytics events, and dev premium toggle out of the app route.
   - Settings customization route UI now lives in a settings feature screen
     component, moving premium upsell routing, theme/icon/haptic sections, and
     modal chrome out of the app route.
   - Backup settings route UI now lives in a backup feature screen component,
     keeping backup/restore/erase actions in the backup hook while moving
     premium gating, destructive action buttons, loading state, and modal
     chrome out of the app route.
   - Import save and export prompt routes now delegate to import feature
     components, keeping save/export flow hooks and prompt presentation out of
     app route files.
   - Import files route now delegates to an import feature screen component,
     moving transfer progress, imported song list rendering, and premium blur
     gating out of the app route.
   - Import Wi-Fi route now delegates to an import feature screen component,
     moving server URL instructions, export-disable synchronization, transfer
     progress, result list rendering, and premium blur gating out of the app
     route.
   - Import stack layout now delegates to an import feature shell component,
     keeping header, overlay, stack screen options, and import controls out of
     the Expo Router layout file.
   - Import success and failure routes now delegate to import feature screen
     components, moving Lottie status presentation and failure navigation out
     of app route files.
   - Artist detail route now delegates to a library feature screen component,
     keeping artist detail queries, tab state, list headers, empty states, and
     action-sheet presentation out of the app route.
   - Album detail route now delegates to a library feature screen component,
     keeping album detail queries, header/query controls, animated artist
     footer, and action-sheet presentation out of the app route.
   - Playlist detail route now delegates to a library feature screen component,
     keeping playlist query state, song list header, action-sheet presentation,
     and list footer ownership out of the app route.
   - Playlist add, create, and edit routes now delegate to library feature
     screen components, keeping playlist query/form wiring out of the app route
     layer.
   - Album add, create, and edit routes now delegate to library feature screen
     components, moving album query/form wiring and edit artist membership UI
     out of the app route layer.
   - Artist add, create, and edit routes now delegate to library feature screen
     components, keeping artist query/form wiring and source selection out of
     the app route layer.
   - Home tab route now delegates to an app-shell feature screen component,
     moving import entry actions, premium CTA, playback effects, mini-player,
     info modal, and notifications out of the app route layer.
   - Album reorder route now delegates to a library feature screen component,
     keeping draggable ordering UI, reactive album-song query state, and
     Drizzle-backed order writes out of the app route layer.
   - Library tab route now delegates to a library feature screen component,
     keeping category selection, create routing, settings navigation, and list
     composition out of the app route layer.
   - Library stack route layout now delegates to a library feature shell
     component, keeping stack screen options, top header, mini-player, and
     notification overlay composition out of the app route layer.
   - Player and player song-edit routes now delegate to playback feature screen
     components, keeping modal player composition, track actions, and song
     sheet presentation out of the app route layer.
   - Root tab route layout now delegates to an app-shell feature shell
     component, while playback ad asset loading moved into a playback hook.
   - Ingest stack layout and route screens now delegate to ingest feature
     components, removing the route-layout dependency on controls exported from
     sibling route files while preserving the current ingest flow behavior.
   - Root navigation route now delegates to an app-shell navigation component,
     keeping stack screen configuration and modal presentation options out of
     the app route layer.
   - Root layout now delegates bootstrapping and provider composition to
     app-shell feature code, leaving the Expo route file responsible only for
     global CSS import and rendering the app root.
   - Removed the fully commented legacy tracking route and its unused tracking
     transparency dependency from the old app package.
   - Settings stack route layout now delegates to a settings feature shell
     component, keeping settings modal presentation options out of the app route
     layer.
   - Dynamic library detail and edit route wrappers now render feature screens
     directly instead of importing sibling route modules.
   - Replaced debug-red placeholder ingest screens with a reusable ingest step
     panel that preserves current flow controls while making unfinished ingest
     states explicit in feature-owned UI.
   - Playlist, album, and artist detail routes now share a library feature
     detail shell for the screen container, sticky header, and global overlay,
     leaving each route focused on its query/list content.
   - Song list page covers now receive playlist, album, and artist cover paths
     from their Drizzle-backed detail queries instead of listening for
     `PLAYLIST_IMAGE_MODIFIED`, `ALBUM_IMAGE_MODIFIED`, or
     `ARTIST_IMAGE_MODIFIED`.
   - Song list page cover rendering now uses those live-query image props
     directly and no longer falls back to legacy cover controller filesystem
     reads.
   - Now-unused playlist, album, and artist image modification emits/types have
     been removed; image refresh is driven by Drizzle writes plus live queries.
   - Now-unused `ALBUM_REORDERED` emit/types have been removed from the reorder
     flow; album song ordering is read from the live album-song query.
   - Album bus has been removed after list, detail, row metadata, cover, delete,
     and reorder refresh moved off album events.
   - Artist bus has been removed after list, detail, row metadata, cover, and
     delete refresh moved off artist events.
   - Library category reset no longer uses `PLAYLIST_SONGS_IMPORTED`; the
     category selector is controlled by the library screen, and library data
     refreshes through live queries after imports, backup restores, and erases.
   - Playlist bus has been removed after list, detail, row metadata, cover,
     delete, import, backup, and add/remove flows moved off playlist events.
   - Song bus has been removed after saved-library rows, edit flows, cover
     edits, and deletes moved onto reactive data or direct local state updates.
   - Import finish command no longer uses an event bus; the import footer now
     requests completion through a narrow GlobalProvider command consumed by
     the save screen.
   - Playback queue refresh no longer uses an event bus; `PlaybackProvider`
     exposes a queue revision signal that reloads queue UI from TrackPlayer.
   - Playback queue assembly now reads playlist, album, and artist source
     songs through the Drizzle-backed library song repository instead of legacy
     entity controllers.
   - No app event bus modules remain; `apps/old/src/events` has been removed.
   - The stale `eventemitter3` dependency has been removed from `@synq/old`
     after the app event buses were retired.
   - Next target: continue strict-null/typecheck cleanup, starting with
     `SongList` source metadata defaults and import/library controller
     nullability.

4. Split ingest/media.
   - Current checkpoint files: `apps/old/src/features/ingest`,
     `apps/old/src/features/images`, and `shared/audio`.
   - `shared/audio` now owns reusable audio duration, metadata, supported file
     types, and track-number parsing used by the ingest workflow.
   - Done: move file-browser selection, Effect/Zustand ingest workflow, and
     Drizzle song persistence into `apps/old/src/features/ingest`.
   - Done: removed the old `apps/old/src/lib/ingest.ts` and
     `apps/old/src/hooks/use-ingest.ts` compatibility shims after callers
     moved to the feature path.
   - Done: move hashed cover image persistence and path helpers into
     `apps/old/src/features/images/repository/image-repository.ts`.
   - Done: shared cover UI components now live in
     `apps/old/src/features/cover/components` instead of the generic
     `src/components/cover` folder.
   - Done: removed the old `apps/old/src/lib/image-utils.ts` compatibility
     shim after image callers moved to feature repositories.
   - Done: import album cover edits now write only hash-backed image rows
     through the library repository instead of duplicating legacy
     `albums/{id}/cover_*.jpg` files.
   - Done: file-browser ingest now reuses library metadata repositories for
     artist/album creation and relation dedupe, including album artist links.
   - Done: import save-to-library progress now updates the import flow context
     instead of rendering a hardcoded zero-progress placeholder.
   - Done: import route controls, header, Wi-Fi server, instructions, and
     premium blur UI moved from generic `src/components/import` into the
     import feature folder.
   - Done: newer ingest flow UI primitives (`button`, page title, safe-area
     wrappers, settings button) now live in
     `apps/old/src/features/ingest/components` instead of generic
     `src/components` files.
   - Done: import progress UI now lives in
     `apps/old/src/features/import/components/Progress.tsx` instead of the
     generic root `src/components` folder.
   - Future target packages/folders: `shared/db` repositories and
     `apps/new/src/features/ingest`.
   - Keep Effect at workflow boundaries; keep UI state minimal and observable.

5. Break up global state.
   - `apps/old/src/context/GlobalProvider.js` owns too many concerns.
   - Split into notifications, selections, sheets, ads, and ingest/import state.
   - Prefer typed hooks/stores with narrow ownership.
   - Done: global loading/progress/import-ad overlay state now lives in
     `apps/old/src/features/app-shell/context/GlobalProgressProvider.tsx`
     instead of `GlobalProvider`.
   - Done: app-shell chrome (`GlobalProgress`, `Overlay`, tab icons, safe top
     spacer) now lives in `apps/old/src/features/app-shell/components` instead
     of the generic root `src/components` folder.
   - Done: library tab category selector UI now lives in
     `apps/old/src/features/library/components/CategorySelector.tsx` instead
     of the generic root `src/components` folder.
   - Done: album/artist/playlist detail header and artist tab selector UI now
     live in `apps/old/src/features/library/components` instead of the generic
     root `src/components` folder.
   - Done: reusable album/artist/playlist/song list surfaces now live under
     `apps/old/src/features/library/components/lists` instead of the generic
     root `src/components/lists` folder.
   - Done: shared song row, song info, and count/duration UI now live under
     `apps/old/src/features/library/components/song` instead of the generic
     root `src/components/song` folder.
   - Done: remaining shared UI primitives and modal primitives now live under
     `apps/old/src/shared/components`, while the legacy tab bar moved into the
     app-shell feature, leaving no files in the generic root `src/components`
     folder.
   - Done: shared list, skeleton, and legacy list-cover primitives now avoid
     stale animation dependencies and derived render state.
   - Done: notification banner and info accordion animations now use explicit
     stable dependencies.
   - Done: notification queue/modal state and actions now live in
     `apps/old/src/features/notifications/context/NotificationsProvider.tsx`
     instead of `GlobalProvider`.
   - Done: notification banner UI now lives in
     `apps/old/src/features/notifications/components` instead of the generic
     `src/components/notifications` folder.
   - Done: notification detail modal UI now lives in
     `apps/old/src/features/notifications/components/NotificationModal.tsx`
     instead of the generic `src/components/modals` folder.
   - Done: overlay and info-modal visibility now live in
     `apps/old/src/features/app-shell/context/AppShellProvider.tsx` instead of
     `GlobalProvider`.
   - Done: app-shell instructions modal UI now lives in
     `apps/old/src/features/app-shell/components/InfoModal.tsx` instead of the
     generic `src/components/modals` folder.
   - Done: font loading now lives in
     `apps/old/src/features/app-shell/hooks/use-font.ts`, and haptic
     preference/actions now live in
     `apps/old/src/features/haptics/hooks/use-haptics.ts`.
   - Done: unused sheet refs and stale modal/control flags were removed from
     `GlobalProvider` after auditing that no active callers used them.
   - Done: selected-song UI state now lives in
     `apps/old/src/features/selection/context/SelectionProvider.tsx` instead of
     `GlobalProvider`.
   - Done: playback ad state now lives in
     `apps/old/src/features/playback/context/PlaybackAdProvider.tsx` instead
     of `GlobalProvider`.
   - Done: privacy/analytics preference state now lives in
     `apps/old/src/features/privacy/context/PrivacyProvider.tsx` and is
     mounted in the root app shell instead of relying on an unmounted generic
     context default.
   - Done: theme and premium state providers now live under
     `apps/old/src/features/theme` and `apps/old/src/features/premium`
     instead of the generic `src/context` folder.
   - Done: theme and premium provider boot effects now use stable callbacks and
     memoized context values.
   - Done: premium feature carousel UI now lives in
     `apps/old/src/features/premium/components` instead of the generic
     `src/components/premium` folder.
   - Done: premium upsell ad UI now lives in
     `apps/old/src/features/premium/components/Ad.tsx` instead of the generic
     root `src/components` folder.
   - Done: premium purchase option UI now lives in
     `apps/old/src/features/premium/components/PremiumOption.tsx` instead of
     the generic root `src/components` folder.
   - Done: settings screen UI components now live in
     `apps/old/src/features/settings/components` instead of the generic
     `src/components/settings` folder.
   - Done: settings theme and app-icon pickers now share
     `apps/old/src/features/settings/hooks/use-horizontal-fade-scroll.ts`
     instead of duplicating scroll-gradient animation state in both components.
   - Done: import flow state now lives in
     `apps/old/src/features/import/context/ImportFlowProvider.tsx` instead of
     `GlobalProvider`.
   - Done: import session state (`results`, transfer progress, loading,
     export-disabled state, selected transfer row, and Wi-Fi transfer address)
     now lives in `ImportFlowProvider` instead of `GlobalProvider`.
   - Done: import file and Wi-Fi routes now derive transfer completion through
     `apps/old/src/features/import/hooks/use-import-transfer-completion.ts`
     instead of mirroring progress into route-local state.
   - Done: import save progress now reuses the transfer-completion hook, and
     the import progress indicator declares its animated dependencies.
   - Done: import save orchestration now lives in
     `apps/old/src/features/import/hooks/use-import-save-flow.ts`, leaving the
     save route focused on prompt/progress UI.
   - Done: Wi-Fi transfer server setup now lives in
     `apps/old/src/features/import/hooks/use-wifi-transfer-server.ts`, and file
     uploads append import results immutably through the import flow context.
   - Done: import export orchestration now lives in
     `apps/old/src/features/import/hooks/use-import-export-flow.ts`, leaving the
     export route focused on prompt UI.
   - Done: edit/action-sheet state now lives in
     `apps/old/src/features/action-sheet/context/ActionSheetProvider.tsx`, and
     the legacy `GlobalProvider` has been removed.
   - Done: action sheet surfaces and entity sheet option components now live in
     `apps/old/src/features/action-sheet/components` instead of the generic
     `src/components/sheet` folder.
   - Done: playlist, album, and artist sheet option side effects now live in
     action-sheet feature hooks, moving export/delete/edit/reorder analytics,
     alerts, global loading, and navigation out of the option row components.
   - Done: song action sheets now share
     `apps/old/src/features/action-sheet/hooks/use-song-sheet-cover.ts`
     instead of duplicating cover-loading state/effects in each sheet.
   - Done: entity action sheets now share
     `apps/old/src/features/action-sheet/hooks/use-sheet-scroll.ts`, and the
     player edit sheet reuses the song sheet cover hook.
   - In progress: playback orchestration is moving out of the home screen into
     feature hooks. Avoid import results and edit targets until their owning
     feature boundaries are clearer.

6. Extract playback orchestration.
   - Done: home playback side effects now live in
     `apps/old/src/features/playback/hooks/use-home-playback-effects.ts`
     instead of directly inside `apps/old/app/(tabs)/index.tsx`.
   - Done: `use-home-playback-effects.ts` now delegates to focused hooks for
     player persistence, ad timing, and remote event handling.
   - Done: playback state provider now lives at
     `apps/old/src/features/playback/context/PlaybackProvider.tsx` instead of
     the legacy generic context folder.
   - Done: legacy `usePlayer` now lives at
     `apps/old/src/features/playback/hooks/use-player.ts` so queue mutation and
     skip behavior are owned by the playback feature.
   - Done: the remaining live `PlayerController` helpers have been split into
     feature-owned playback factories/services, and the stale legacy controller
     file has been removed.
   - Done: track creation and artwork helpers now live in
     `apps/old/src/features/playback/lib/track-factory.ts`, separate from
     TrackPlayer queue side effects.
   - Done: next-up source lookup and pagination now live in
     `apps/old/src/features/playback/lib/playback-queue-service.ts` instead of
     inside `use-player.ts`.
   - Done: player setup/restore now lives in
     `apps/old/src/features/playback/lib/player-setup-service.ts` with typed
     playback state restore callbacks.
   - Done: TrackPlayer queue mutations now live in
     `apps/old/src/features/playback/lib/player-queue-actions-service.ts`, so
     `use-player.ts` wires playback context into typed queue actions.
   - Done: ad-gated playback commands now share
     `apps/old/src/features/playback/hooks/use-ad-gated-playback-command.ts`
     for skip buttons, remote next/previous, and song-row playback while
     preserving the song-row post-ad queue behavior.
   - Done: command-driven and timing-driven ad side effects now share
     `apps/old/src/features/playback/hooks/use-playback-ad-actions.ts`, while
     timing decisions remain inside `use-playback-ad-timing-effects.ts`.
   - Done: song option add-to-queue now calls `usePlayer().addSongToQueue`
     instead of importing track creation helpers directly.
   - Done: song rows now call `usePlayer().playSong` and
     `usePlayer().addSongToQueue` instead of importing track creation or
     TrackPlayer play helpers directly.
   - Done: song rows now read active track/index through
     `apps/old/src/features/playback/hooks/use-active-queue-track.ts` instead
     of calling TrackPlayer directly.
   - Done: playback source persistence now lives in
     `apps/old/src/features/playback/hooks/use-playback-source-persistence.ts`
     instead of directly inside `SongList`.
   - Done: song press playback orchestration now lives in
     `apps/old/src/features/playback/hooks/use-song-playback-handler.ts`, so
     `SongList` no longer owns ad-gated play/add queue behavior.
   - Done: song row UI no longer carries dead premium-blur/message state,
     stale pan-responder scaffolding, or manual selection-array copying; the
     selection toggle and import-cover loading paths are now explicit helpers.
   - Done: queue drag row rendering now lives in
     `apps/old/src/components/lists/song/DraggableSongItem.tsx` instead of
     inline inside `SongList`.
   - Done: queue reorder now calls `usePlayer().moveQueueSong`, which delegates
     to the playback queue action service instead of calling TrackPlayer
     directly from the queue screen.
   - Done: queue display loading, active-track scrolling, fade-in animation,
     and drag-end state updates now live in
     `apps/old/src/features/playback/hooks/use-playback-queue-display.ts`.
   - Done: queue footer playback controls now live in
     `apps/old/src/features/playback/components/QueueControls.tsx`.
   - Done: shared playback buttons, mini-player, skip controls, and time scrub
     UI now live in `apps/old/src/features/playback/components`; the generic
     `src/components/player` folder has been removed.
   - Done: playback toggle buttons no longer carry stale imports or stale
     state-effect dependencies; pause/play previous-state tracking now uses a
     ref instead of extra render state.
   - Done: mini-player artwork loading now lives in
     `apps/old/src/features/playback/hooks/use-mini-player-artwork.ts`, and the
     time scrubber effects now carry explicit reactive dependencies.
   - Done: player route artwork, song hydration, title fade, and gradient
     opacity state now live in
     `apps/old/src/features/playback/hooks/use-player-screen-state.ts`.
   - Done: player artwork crossfade UI now lives in
     `apps/old/src/features/playback/components/CrossfadeImage.tsx` instead of
     the generic `src/components/image` folder.
   - Done: queue song list panel now lives in
     `apps/old/src/features/playback/components/QueueSongListPanel.tsx`, so
     `app/queue.tsx` is mostly route composition.
   - Done: the remaining queue route shell now lives in
     `apps/old/src/features/playback/components/QueueScreen.tsx`; the Expo
     route only exports the feature screen.
   - Done: pause/play and time scrub seek commands now route through
     `usePlayer()` and the playback queue action service instead of direct
     TrackPlayer calls in UI controls.
   - Done: delete flows in import controls and song options now call
     `usePlayer().removeSongsFromQueue` instead of duplicating TrackPlayer
     queue scans/removals.
   - Done: backup erase/reset now calls `usePlayer().resetPlayer`; no
     `app` or generic `components` files import TrackPlayer directly.
   - Done: remote playback play/pause/seek/reset commands now call
     `usePlayer()` actions instead of importing the concrete TrackPlayer
     command object in the remote-event hook.
   - Done: premium ad skip now calls the playback queue action service instead
     of importing TrackPlayer directly in the ad-actions hook.
   - Done: playback hooks now read active queue index and queue contents
     through the playback queue action service instead of importing the
     TrackPlayer command object directly.
   - Done: track playback queue mutation now lives in the playback queue action
     service, leaving the track service focused on ad-track construction and
     track factory re-exports.
   - Done: the obsolete player-track compatibility service has been removed;
     artwork callers import the track factory directly, and ad playback now
     lives in `apps/old/src/features/playback/lib/playback-ad-service.ts`.
   - Next safe slice: continue moving remaining TrackPlayer calls in UI
     components behind playback feature APIs.

7. Build feature-first app structure.
   - Prefer `features/<domain>/{components,hooks,queries,repository,effects}`.
   - Keep reusable UI in `shared/ui-mobile` only after it is genuinely shared.
   - Avoid moving old code wholesale into shared packages.

## Suggested Agent Tasks

- Worker A: create song repository/query hooks and convert library songs screen
  away from manual controller refresh. The first library list hook is complete;
  continue with cover/image and playlist-detail query hooks.
- Worker B: scaffold `apps/new` Expo app after `apps/old` has a committed
  monorepo baseline; do not copy old monolithic components.
- Worker C: fix typecheck by domain, starting with `SongType` nullability and
  player `undefined` handling.

## Event Bus Removal Order

1. Song/library:
   - Done: replace `apps/old/src/components/library/Songs.tsx` refresh
     listeners with a single `useLibrarySongsQuery({ query, sort, order })`.
   - Done: library tab panels now live in
     `apps/old/src/features/library/components` instead of the generic
     `src/components/library` folder.
   - Done: saved library row metadata is now prop-derived from the list query,
     not patched by `SONG_INFO_MODIFIED`, `ARTIST_TOGGLED_ON_SONG`, or
     `ALBUM_TOGGLED_ON_SONG`.
   - Done: saved library metadata edits write through a feature repository into
     the Drizzle-owned `songs`, `artistSongs`, and `albumSongs` tables.
   - Done: saved library cover edits write through the same feature repository
     into Drizzle image references, and saved library rows render cover art
     from `useLibrarySongsQuery`.
   - Done: remove import-only `ARTIST_TOGGLED_ON_SONG` and
     `ALBUM_TOGGLED_ON_SONG` listeners from `apps/old/src/components/song/Song.tsx`.
   - Done: move `app/song/edit/edit.tsx` relation refresh to focus refresh
     plus `editSong` context updates from relation list rows.
   - Done: remove the remaining emit-only song event bus module.
   - Done: song detail, edit, and back destinations now live in the song detail
     service with smoke coverage instead of inline song component and edit
     controller route strings.
   - Done: invalid song route copy and back link now live in the song detail
     service with smoke coverage instead of the UI fallback component.
   - Done: song detail relationship-section copy, album row detail formatting,
     and back-link presentation now live in the song detail service with smoke
     coverage instead of the detail view.
   - Done: song detail query/mutation/missing/unplayable status and updated-time
     copy now live in the song detail service with smoke coverage instead of
     view/status-panel branching.
   - Done: library home header actions now come from a library home service
     with smoke coverage instead of hard-coded create/import links in the view.
   - Done: library home header title/subtitle copy now comes from the library
     home service with smoke coverage instead of view-local text.
   - Done: library home query error and updated-time status now lives in the
     library home service with smoke coverage instead of controller/view-local
     label branching.
   - Done: collection detail query/mutation status and updated-time copy now
     live in the collection interaction service with smoke coverage instead of
     view/status-panel branching.
   - Done: collection detail song-section copy and back-link presentation now
     live in the collection interaction service with smoke coverage instead of
     the detail view.
   - Done: collection form image labels and saved-image fallback copy now live
     in the collection form service with smoke coverage instead of duplicated
     form component conditionals.
   - Done: edit-collection form subtitle copy now lives in the collection form
     service with smoke coverage instead of the edit form view.
   - Done: collection form field visibility and return-key state now live in
     the collection form service with smoke coverage instead of inline form
     component branching.
   - Done: collection create/edit persistence branching now lives in a
     collection form mutation service with fake-repository smoke coverage
     instead of controller-local mutation switches.
   - Done: add-to-collection query/mutation status and updated-time copy now
     live in the addable songs service with smoke coverage instead of
     connected-form/status-panel branching.
   - Done: add-to-collection header/search copy and back-link presentation now
     live in the addable songs service with smoke coverage instead of form
     components.
   - Done: invalid collection route copy and back link now live in the
     collection interaction service with smoke coverage instead of the UI
     fallback component.

2. Playlist:
   - Done: add `useLibraryPlaylistsQuery` for the list-level library playlist
     screen.
   - Done: add `usePlaylistInfoQuery(id)` for playlist detail header state.
   - Reuse `useLibrarySongsQuery` for playlist detail songs while deciding
     whether a playlist-specific wrapper is still useful.
   - Done: remove `PLAYLIST_NAME_MODIFIED` and
     `PLAYLIST_SONG_COUNT_MODIFIED` display listeners from playlist rows.
   - Done: add membership prioritization to `useLibraryPlaylistsQuery` and use
     it in `app/playlist/add.tsx` instead of the `PLAYLIST_CREATED` listener.
   - Done: playlist membership row checks now depend on concrete song/playlist
     IDs instead of broad object references.
   - Done: remove the now-unused `PLAYLIST_CREATED` emit from
     `app/playlist/create.tsx`.
   - Done: render playlist row cover art from live query props instead of
     `PLAYLIST_IMAGE_MODIFIED` listeners.
   - Done: render playlist detail page cover art from `usePlaylistInfoQuery`
     instead of `PLAYLIST_IMAGE_MODIFIED`.
   - Done: remove now-unused `PLAYLIST_IMAGE_MODIFIED` emits and event types.
   - Done: remove the broad `PLAYLIST_SONGS_IMPORTED` invalidation/reset
     pattern from import, backup, library, and category selector flows.
   - Done: remove count/name/content/delete emits and the remaining playlist
     event bus module.

3. Album:
   - Done: add `useLibraryAlbumsQuery` for the list-level library album screen.
   - Done: add membership prioritization to `useLibraryAlbumsQuery` and use it
     in `app/album/add.tsx` instead of the `ALBUM_CREATED` listener.
   - Done: remove the now-unused `ALBUM_CREATED` emit from
     `app/album/create.tsx`.
   - Done: add `useAlbumInfoQuery` and `useAlbumSongsQuery` for the album
     detail screen.
   - Done: remove `ALBUM_MODIFIED` display listeners from album rows.
   - Done: render album row cover art from live query props instead of
     `ALBUM_IMAGE_MODIFIED` listeners.
   - Done: render album detail page cover art from `useAlbumInfoQuery` instead
     of `ALBUM_IMAGE_MODIFIED`.
   - Done: remove now-unused `ALBUM_IMAGE_MODIFIED` emits and event types.
   - Done: remove now-unused `ALBUM_REORDERED` emits and event types.
   - Done: remove the remaining emit-only album event bus module.
   - Add album order/image queries where the reorder and cover flows still
     need Drizzle-backed state.
   - Replace `ALBUM_*` events, including `ALBUM_TOGGLED_ON_SONG` and
     `ALBUM_REORDERED`.

4. Artist:
   - Done: add `useLibraryArtistsQuery` for the list-level library artist
     screen.
   - Done: add membership prioritization and source tagging to
     `useLibraryArtistsQuery`, and use it in `app/artist/add.tsx` instead of
     the `ARTIST_CREATED` listener.
   - Done: remove the now-unused `ARTIST_CREATED` emit from
     `app/artist/create.tsx`.
   - Done: add `useArtistInfoQuery`, `useArtistSongsQuery`, and
     `useArtistAlbumsQuery` for the artist detail screen.
   - Done: remove `ARTIST_MODIFIED` display listeners from artist rows.
   - Done: remove `ARTIST_TOGGLED_ON_ALBUM` listener/emit path from album edit
     relation refresh.
   - Done: render artist row cover art from live query props instead of
     `ARTIST_IMAGE_MODIFIED` listeners.
   - Done: render artist detail page cover art from `useArtistInfoQuery`
     instead of `ARTIST_IMAGE_MODIFIED`.
   - Done: remove now-unused `ARTIST_IMAGE_MODIFIED` emits and event types.
   - Done: remove the remaining emit-only artist event bus module.
   - Add artist relation/image queries where add/edit/cover flows still need
     Drizzle-backed state.
   - Replace artist edit/list/detail listeners.

5. Import command bus:
   - Done: replace `TRIGGER_FINISH` with a GlobalProvider import finish
     request consumed by the save screen.

6. Playback bus:
   - Done: replace `QUEUE_UPDATED` with a PlaybackProvider queue revision
     signal read by the queue screen.
   - Done: remove the remaining playback event module.

## Typecheck Cleanup Order

1. Playback:
   - Done: give `PlaybackProvider` non-null sort/order defaults matching the
     context contract.
   - Done: guard undefined active track/index/state values in player controls.
   - Done: skip queue rebuilds until playback source metadata is available.

2. Song lists:
   - Done: normalize `SongList` source metadata defaults and guards before
     calling playback queue helpers.
   - Done: tighten shared list/query component nullability in `List`,
     `QueryWrapper`, `AlbumItem`, `ArtistItem`, and the album header.
   - Done: normalize album, artist, and playlist create/edit form optional
     values, remove duplicate textbox style overwrites, and tighten the
     matching update controller contracts.
   - Done: guard missing active track/index/source metadata in the home tab and
     player route playback UI.
   - Done: normalize backup/restore document-directory and error wrapping
     boundaries.
   - Done: guard optional cover IDs in `EditCover` and fix the song edit
     textbox style overwrite.
   - Done: tighten premium restore state around active RevenueCat entitlements
     and nullable lifetime expirations.
   - Done: tighten audio duration and image color luminance helpers.
   - Done: guard import/export and save-to-library filesystem paths before
     sharing, copying, or inserting library rows.
   - Done: clear the remaining old-app source strict-null errors in legacy
     song/album/artist/playlist controllers and models.
   - Done: replace the broken `react-native-crossfade-image` dependency with a
     local typed player background fade component.
   - Next: treat `pnpm --filter @synq/old typecheck` as a required guardrail
     while continuing feature extraction and reactive state migration.

## Guardrails

- Commit after each coherent migration checkpoint.
- Keep `pnpm lint` passing.
- Run an old-app Expo export or native build smoke after path/config changes.
- Do not introduce Convex or Ruby product dependencies.
- Do not remove `apps/old` until `apps/new` has equivalent verified behavior.

## Recent Rewrite Checkpoints

- Done: add direct play and queue actions to the new app library song preview
  list, backed by reactive song file-path data.
- Done: add all-playlists, all-albums, and all-artists browse routes for the
  new app library collection previews.
- Done: add a slim new-app library song edit route for title and comma-separated
  artist/album metadata updates.
- Done: add first-pass new-app library export actions for individual songs and
  playable songs in a collection, backed by a feature-owned export service.
- Done: add new-app song detail actions for toggling Liked Songs and deleting a
  library song through feature-owned repository commands.
- Done: add import-review export for staged draft files through a feature-owned
  draft export service.
- Done: reset live playback and staged import provider state after backup
  restore/erase completes.
- Done: add guarded new-app collection deletion for playlists, albums, and
  artists while preserving seeded Library/Liked Songs playlists.
- Done: extract the new-app playback reducer, selectors, and queue transitions
  into `playback-session-service`, leaving `PlaybackProvider` focused on native
  orchestration.
- Done: close new-app library export metadata parity by writing stale MP3/FLAC
  tags through shared audio infrastructure and recording
  `snapshotAtLastExport` after export preparation.
- Done: extract the new-app import session reducer and initial state into an
  import feature service, keeping `ImportSessionProvider` focused on
  side-effect orchestration.
