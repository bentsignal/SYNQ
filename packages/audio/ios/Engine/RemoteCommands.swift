import Foundation
import MediaPlayer

/// The commands the lock screen, Control Center, headphones, and CarPlay can
/// send. Handled natively, with no JavaScript involved.
enum RemoteCommand: Sendable {
  case play
  case pause
  case toggle
  case next
  case previous
  case seek(positionMs: Double)
}

/// Registers handlers on `MPRemoteCommandCenter` and forwards them to the
/// engine on the main thread.
@MainActor
final class RemoteCommandController {
  private var targets: [(MPRemoteCommand, Any)] = []

  func install(handler: @escaping @MainActor @Sendable (RemoteCommand) -> Bool) {
    guard targets.isEmpty else { return }
    let center = MPRemoteCommandCenter.shared()

    func add(_ command: MPRemoteCommand, _ map: @escaping @Sendable (MPRemoteCommandEvent) -> RemoteCommand?) {
      command.isEnabled = true
      let token = command.addTarget { @Sendable event in
        guard let remote = map(event) else { return .commandFailed }
        let handled = runOnMainSync { handler(remote) }
        return handled ? .success : .noActionableNowPlayingItem
      }
      targets.append((command, token))
    }

    add(center.playCommand) { _ in .play }
    add(center.pauseCommand) { _ in .pause }
    add(center.togglePlayPauseCommand) { _ in .toggle }
    add(center.nextTrackCommand) { _ in .next }
    add(center.previousTrackCommand) { _ in .previous }
    add(center.changePlaybackPositionCommand) { event in
      guard let event = event as? MPChangePlaybackPositionCommandEvent else { return nil }
      return .seek(positionMs: event.positionTime * 1000)
    }

    // Interval skips and scrubbing-by-holding aren't offered; prefer track skips.
    center.skipForwardCommand.isEnabled = false
    center.skipBackwardCommand.isEnabled = false
    center.seekForwardCommand.isEnabled = false
    center.seekBackwardCommand.isEnabled = false
  }

  /// Disabled while the interstitial plays.
  func setSkipAndSeekEnabled(_ enabled: Bool) {
    let center = MPRemoteCommandCenter.shared()
    center.nextTrackCommand.isEnabled = enabled
    center.previousTrackCommand.isEnabled = enabled
    center.changePlaybackPositionCommand.isEnabled = enabled
  }

  func uninstall() {
    for (command, token) in targets {
      command.removeTarget(token)
    }
    targets.removeAll()
  }
}
