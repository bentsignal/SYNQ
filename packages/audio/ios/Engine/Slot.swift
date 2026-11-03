import AVFoundation
import Foundation

/// One `AVPlayerItem` in the player, and the queue entry it plays. The
/// engine keeps at most two: the current item and the preloaded one after it.
@MainActor
final class Slot {
  let key: EntryKey
  let item: AVPlayerItem
  var track: Track

  // Touched only on the main actor; `nonisolated(unsafe)` so `deinit` can
  // release them as a safety net if a slot is dropped without `invalidate()`.
  nonisolated(unsafe) private var statusObservation: NSKeyValueObservation?
  nonisolated(unsafe) private var notificationTokens: [NSObjectProtocol] = []

  init(key: EntryKey, track: Track) {
    self.key = key
    self.track = track
    let asset = AVURLAsset(url: track.url, options: [AVURLAssetPreferPreciseDurationAndTimingKey: true])
    item = AVPlayerItem(asset: asset)
  }

  deinit {
    statusObservation?.invalidate()
    for token in notificationTokens {
      NotificationCenter.default.removeObserver(token)
    }
  }

  var durationMs: Double {
    let duration = item.duration
    if duration.isNumeric, duration.seconds > 0 {
      return duration.seconds * 1000
    }
    return track.durationMs ?? 0
  }

  /// Observers are scoped to this item: its status, and its own end and
  /// failure notifications. Handlers run on the main queue, later.
  func observe(
    status: @escaping @MainActor @Sendable (Slot) -> Void,
    end: @escaping @MainActor @Sendable (Slot) -> Void,
    failure: @escaping @MainActor @Sendable (Slot, String?) -> Void
  ) {
    statusObservation = item.observe(\.status, options: [.new]) { @Sendable [weak self] _, _ in
      dispatchToMain { [weak self] in
        if let self { status(self) }
      }
    }
    let center = NotificationCenter.default
    notificationTokens.append(center.addObserver(
      forName: AVPlayerItem.didPlayToEndTimeNotification, object: item, queue: nil
    ) { @Sendable [weak self] _ in
      dispatchToMain { [weak self] in
        if let self { end(self) }
      }
    })
    notificationTokens.append(center.addObserver(
      forName: AVPlayerItem.failedToPlayToEndTimeNotification, object: item, queue: nil
    ) { @Sendable [weak self] notification in
      let error = notification.userInfo?[AVPlayerItemFailedToPlayToEndTimeErrorKey] as? Error
      let message = error?.localizedDescription
      dispatchToMain { [weak self] in
        if let self { failure(self, message) }
      }
    })
  }

  func invalidate() {
    statusObservation?.invalidate()
    statusObservation = nil
    for token in notificationTokens {
      NotificationCenter.default.removeObserver(token)
    }
    notificationTokens.removeAll()
  }
}
