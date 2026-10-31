import Foundation

/// Runs `body` on the main queue on a later turn of the run loop. Every
/// AVFoundation, notification, and timer callback goes through here, so engine
/// state is only touched on the main thread and never re-entrantly from inside
/// a player call.
///
/// Callbacks handed to system frameworks are written as `@Sendable` closures
/// so the compiler doesn't infer them as main-actor isolated (which would trap
/// when the framework calls them off the main thread).
func dispatchToMain(_ body: @escaping @MainActor @Sendable () -> Void) {
  DispatchQueue.main.async {
    MainActor.assumeIsolated { body() }
  }
}

/// Runs `body` on the main thread and returns its result, synchronously.
/// For callbacks that must answer immediately (remote commands).
func runOnMainSync<T: Sendable>(_ body: @MainActor () -> T) -> T {
  if Thread.isMainThread {
    return MainActor.assumeIsolated { body() }
  }
  return DispatchQueue.main.sync {
    MainActor.assumeIsolated { body() }
  }
}
