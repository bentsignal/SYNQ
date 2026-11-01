import Foundation

/// A playable item. `url` is an absolute local file URL.
public struct Track: Equatable, Sendable {
  public var id: String
  public var url: URL
  public var title: String
  public var artist: String
  public var album: String?
  public var artworkURL: URL?
  public var durationMs: Double?

  public init(
    id: String,
    url: URL,
    title: String,
    artist: String,
    album: String? = nil,
    artworkURL: URL? = nil,
    durationMs: Double? = nil
  ) {
    self.id = id
    self.url = url
    self.title = title
    self.artist = artist
    self.album = album
    self.artworkURL = artworkURL
    self.durationMs = durationMs
  }
}

public enum RepeatMode: String, Sendable, CaseIterable {
  case off
  case all
  case one
}

public enum PlaybackStatus: String, Sendable {
  /// Nothing is loaded.
  case idle
  /// An item is loading or buffering while playback is wanted.
  case loading
  case playing
  case paused
  /// The queue played to its end (repeat off).
  case ended
  /// The current item failed and nothing playable follows it.
  case error
}

public struct PlaybackSnapshot: Equatable, Sendable {
  public var status: PlaybackStatus
  /// Index of the current queue entry.
  public var index: Int?
  /// Id of the current track.
  public var trackId: String?
  public var positionMs: Double
  public var durationMs: Double
  public var repeatMode: RepeatMode
  public var queueLength: Int
}

public struct PlaybackError: Equatable, Sendable {
  public enum Code: String, Sendable {
    case fileMissing = "file-missing"
    case loadFailed = "load-failed"
    case playbackFailed = "playback-failed"
    case audioSession = "audio-session"
  }

  public var code: Code
  public var message: String
  public var trackId: String?
  public var index: Int?
}

public enum EngineEvent: Equatable, Sendable {
  case state(PlaybackSnapshot)
  case progress(positionMs: Double, durationMs: Double)
  case queue(length: Int, index: Int?)
  case error(PlaybackError)
}
