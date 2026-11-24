// Runs the real AudioExtractor on the Mac for `extract-audio.test.ts`:
// `extract <video> <destination>` writes one JSON line describing the M4A
// it wrote (its audio tracks, their codec, the duration, and whether its
// audio is the video's first track's, byte for byte) or the error, and
// whether a frame was written beside it (`<destination>.jpg`).
import AVFoundation

func write(_ object: [String: Any]) {
  guard let data = try? JSONSerialization.data(withJSONObject: object),
    let line = String(data: data, encoding: .utf8)
  else { return }
  print(line)
}

func fourCC(_ code: FourCharCode) -> String {
  String(
    [24, 16, 8, 0].map { Character(UnicodeScalar(UInt8((code >> $0) & 0xff))) })
}

/// A track's compressed audio, as stored.
func samples(_ asset: AVAsset) async throws -> Data {
  guard let track = try await asset.loadTracks(withMediaType: .audio).first else { return Data() }
  let reader = try AVAssetReader(asset: asset)
  let output = AVAssetReaderTrackOutput(track: track, outputSettings: nil)
  reader.add(output)
  reader.startReading()
  var data = Data()
  while let buffer = output.copyNextSampleBuffer() {
    guard let block = CMSampleBufferGetDataBuffer(buffer) else { continue }
    var bytes = Data(count: CMBlockBufferGetDataLength(block))
    bytes.withUnsafeMutableBytes { pointer in
      _ = CMBlockBufferCopyDataBytes(
        block, atOffset: 0, dataLength: pointer.count, destination: pointer.baseAddress!)
    }
    data.append(bytes)
  }
  return data
}

let video = URL(fileURLWithPath: CommandLine.arguments[1])
let destination = URL(fileURLWithPath: CommandLine.arguments[2])
let done = DispatchSemaphore(value: 0)
Task {
  do {
    try await AudioExtractor.extract(video: video, destination: destination)
    let asset = AVURLAsset(url: destination)
    let tracks = try await asset.loadTracks(withMediaType: .audio)
    var formats: [String] = []
    for track in tracks {
      for format in try await track.load(.formatDescriptions) {
        formats.append(fourCC(CMFormatDescriptionGetMediaSubType(format)))
      }
    }
    let videoTracks = try await asset.loadTracks(withMediaType: .video)
    let duration = try await asset.load(.duration)
    write([
      "audioTracks": tracks.count, "formats": formats, "videoTracks": videoTracks.count,
      "durationMs": Int((CMTimeGetSeconds(duration) * 1000).rounded()),
      "sameSamples": try await samples(asset) == samples(AVURLAsset(url: video)),
      "frame": await AudioExtractor.frame(
        video: video, destination: destination.appendingPathExtension("jpg")),
    ])
  } catch {
    let frame = await AudioExtractor.frame(
      video: video, destination: destination.appendingPathExtension("jpg"))
    write(["error": String(describing: error), "frame": frame])
  }
  done.signal()
}
done.wait()
