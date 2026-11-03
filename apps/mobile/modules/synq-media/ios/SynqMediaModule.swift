import ExpoModulesCore
import UIKit

/// SYNQ's media helpers: reading imported audio (tags, duration, artwork),
/// writing library covers, retagging exported copies, staging backups, and
/// the Wi-Fi Transfer server. JavaScript: `src/features/media/native.ts`.
public class SynqMediaModule: Module {
  private var server: TransferServer?
  private var transferLive = TransferLiveState()
  private let finishedUploads = FinishedUploads()

  public func definition() -> ModuleDefinition {
    Name("SynqMedia")

    Events("onTransferStart", "onTransferProgress", "onTransferFile", "onTransferFailed",
      "onTransferStopped", "onTransferClients")

    AsyncFunction("readAudioFile") { (fileUrl: URL, artworkUrl: URL) async throws -> [String: Any] in
      try await AudioMetadataReader.read(fileURL: fileUrl, artworkURL: artworkUrl)
    }

    AsyncFunction("writeCovers") { (imageUrl: URL, directoryUrl: URL) in
      try Covers.write(imageURL: imageUrl, directoryURL: directoryUrl)
    }

    AsyncFunction("artworkColors") { (imageUrl: URL) -> [String] in
      ArtworkColors.read(imageURL: imageUrl)
    }

    AsyncFunction("spliceFile") { (sourceUrl: URL, destinationUrl: URL, skip: Int, head: Data) in
      try Files.splice(source: sourceUrl, destination: destinationUrl, skip: skip, head: head)
    }

    AsyncFunction("tagMp4") {
      (sourceUrl: URL, destinationUrl: URL, tags: Mp4Tags, artworkUrl: URL?) async throws in
      try await Mp4Tagger.tag(
        source: sourceUrl, destination: destinationUrl, tags: tags, artworkURL: artworkUrl)
    }

    AsyncFunction("linkTree") { (fromUrl: URL, toUrl: URL) in
      try Files.linkTree(from: fromUrl, to: toUrl)
    }

    AsyncFunction("startTransferServer") {
      (port: Int, page: String, uploadDirectoryUrl: URL, extensions: [String]) async throws -> Int in
      self.server?.stop()
      let server = TransferServer(
        page: page, uploadDirectory: uploadDirectoryUrl, allowedExtensions: extensions,
        live: self.transferLive, finished: self.finishedUploads
      ) { [weak self] event, body in
        self?.sendEvent(event, body)
      }
      self.server = server
      return try await server.start(preferredPort: port)
    }

    Function("stopTransferServer") {
      self.server?.stop()
      self.server = nil
    }

    // Newer than the server itself: JavaScript checks for these.
    Function("setTransferState") { (stateJson: String, accepting: Bool) in
      self.transferLive = TransferLiveState(json: stateJson, accepting: accepting)
      self.server?.setLive(self.transferLive)
    }

    AsyncFunction("checkTransferServer") { () async -> Bool in
      await self.server?.isAlive() ?? false
    }

    Function("copyText") { (text: String) in
      UIPasteboard.general.string = text
    }

    AsyncFunction("pickSquarePhoto") { (promise: Promise) in
      MainActor.assumeIsolated {
        SquarePhotoPicker.show { promise.resolve($0) }
      }
    }.runOnQueue(.main)

    AsyncFunction("confirmTyped") {
      (title: String, message: String, phrase: String, confirmTitle: String, promise: Promise) in
      MainActor.assumeIsolated {
        TypedConfirm.show(
          title: title, message: message, phrase: phrase, confirmTitle: confirmTitle
        ) { promise.resolve($0) }
      }
    }.runOnQueue(.main)

    Function("wifiAddress") { () -> String? in
      NetworkAddress.wifiIPv4()
    }

    OnDestroy {
      self.server?.stop()
    }
  }
}
