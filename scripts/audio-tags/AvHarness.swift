// The app's real Swift (AudioMetadata.swift, Mp4Tagger.swift), run on the Mac
// against the corpus. run.sh compiles this with those files and Shim.swift.
//
//   harness read <file> <artwork-out>   prints what AVFoundation reads at import
//   harness decode <file>               decodes every sample, as playback would,
//                                       and prints how many there were
import AVFoundation
import Foundation

@main
struct Harness {
  static func main() async {
    let args = CommandLine.arguments
    do {
      switch args[1] {
      case "read":
        let result = try await AudioMetadataReader.read(
          fileURL: URL(fileURLWithPath: args[2]), artworkURL: URL(fileURLWithPath: args[3]))
        let data = try JSONSerialization.data(withJSONObject: result, options: [.sortedKeys])
        print(String(decoding: data, as: UTF8.self))
      case "decode":
        let asset = AVURLAsset(url: URL(fileURLWithPath: args[2]))
        guard let track = try await asset.loadTracks(withMediaType: .audio).first else {
          print("{\"error\":\"no audio track\"}")
          exit(1)
        }
        let reader = try AVAssetReader(asset: asset)
        let output = AVAssetReaderTrackOutput(
          track: track, outputSettings: [AVFormatIDKey: kAudioFormatLinearPCM])
        reader.add(output)
        reader.startReading()
        var samples = 0
        while let buffer = output.copyNextSampleBuffer() {
          samples += CMSampleBufferGetNumSamples(buffer)
        }
        if reader.status != .completed {
          print("{\"error\":\"decode failed\"}")
          exit(1)
        }
        print("{\"samples\":\(samples)}")
      default:
        print("{\"error\":\"unknown command\"}")
      }
    } catch {
      print("{\"error\":\(String(reflecting: String(describing: error)))}")
      exit(1)
    }
  }
}
