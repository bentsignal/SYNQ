import AVFoundation
import Foundation

/// System audio session events, already on the main thread.
enum AudioSessionEvent: Sendable {
  case interruptionBegan
  case interruptionEnded(shouldResume: Bool)
  /// The output in use went away (headphones unplugged, Bluetooth dropped).
  case outputLost
  case mediaServicesReset
}

/// Owns `AVAudioSession`: the `.playback` category, activation on play, and
/// the interruption / route change / media services notifications. A no-op on
/// macOS, where there is no audio session (tests drive the events directly).
@MainActor
final class AudioSessionController {
  private var observers: [NSObjectProtocol] = []
  private var configured = false
  private(set) var isActive = false

  func start(onEvent: @escaping @MainActor @Sendable (AudioSessionEvent) -> Void) {
    #if os(iOS)
    guard observers.isEmpty else { return }
    let center = NotificationCenter.default
    let session = AVAudioSession.sharedInstance()

    observers.append(center.addObserver(
      forName: AVAudioSession.interruptionNotification, object: session, queue: nil
    ) { @Sendable [weak self] notification in
      guard let event = Self.interruptionEvent(from: notification) else { return }
      dispatchToMain { [weak self] in
        // iOS deactivated the session; reactivate on the next play.
        if case .interruptionBegan = event { self?.isActive = false }
        onEvent(event)
      }
    })

    observers.append(center.addObserver(
      forName: AVAudioSession.routeChangeNotification, object: session, queue: nil
    ) { @Sendable notification in
      let raw = notification.userInfo?[AVAudioSessionRouteChangeReasonKey] as? UInt
      guard let raw, AVAudioSession.RouteChangeReason(rawValue: raw) == .oldDeviceUnavailable else { return }
      dispatchToMain { onEvent(.outputLost) }
    })

    observers.append(center.addObserver(
      forName: AVAudioSession.mediaServicesWereResetNotification, object: session, queue: nil
    ) { @Sendable [weak self] _ in
      dispatchToMain { [weak self] in
        self?.configured = false
        self?.isActive = false
        onEvent(.mediaServicesReset)
      }
    })
    #endif
  }

  /// Sets the category (once) and activates the session. Called on play.
  func activate() throws {
    #if os(iOS)
    let session = AVAudioSession.sharedInstance()
    if !configured {
      try session.setCategory(.playback, mode: .default, policy: .default, options: [])
      configured = true
    }
    if !isActive {
      try session.setActive(true)
      isActive = true
    }
    #endif
  }

  func stop() {
    for observer in observers {
      NotificationCenter.default.removeObserver(observer)
    }
    observers.removeAll()
  }

  #if os(iOS)
  private nonisolated static func interruptionEvent(from notification: Notification) -> AudioSessionEvent? {
    guard
      let info = notification.userInfo,
      let rawType = info[AVAudioSessionInterruptionTypeKey] as? UInt,
      let type = AVAudioSession.InterruptionType(rawValue: rawType)
    else { return nil }
    switch type {
    case .began:
      return .interruptionBegan
    case .ended:
      let rawOptions = info[AVAudioSessionInterruptionOptionKey] as? UInt ?? 0
      let options = AVAudioSession.InterruptionOptions(rawValue: rawOptions)
      return .interruptionEnded(shouldResume: options.contains(.shouldResume))
    @unknown default:
      return nil
    }
  }
  #endif
}
