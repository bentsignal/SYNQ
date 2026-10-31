import Foundation

/// Counts listening time toward the interstitial. Time is supplied by the
/// caller (a monotonic clock in milliseconds) so the logic is testable.
struct ListeningCounter: Equatable {
  private(set) var baseMs: Double = 0
  private var runningSinceMs: Double?

  var isRunning: Bool { runningSinceMs != nil }

  func value(nowMs: Double) -> Double {
    guard let runningSinceMs else { return baseMs }
    return baseMs + max(0, nowMs - runningSinceMs)
  }

  mutating func start(nowMs: Double) {
    if runningSinceMs == nil { runningSinceMs = nowMs }
  }

  mutating func stop(nowMs: Double) {
    baseMs = value(nowMs: nowMs)
    runningSinceMs = nil
  }

  /// Sets the counted time, keeping the counter running if it was.
  mutating func reset(to ms: Double, nowMs: Double) {
    baseMs = max(0, ms)
    if runningSinceMs != nil { runningSinceMs = nowMs }
  }
}
