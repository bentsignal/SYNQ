import XCTest

@testable import SynqAudioEngine

final class FileLocationTests: XCTestCase {
  /// What expo-file-system's URI encoding does: only these, and nothing else.
  private func expoUri(_ path: String) -> String {
    "file://"
      + path
      .replacingOccurrences(of: "%", with: "%25")
      .replacingOccurrences(of: " ", with: "%20")
      .replacingOccurrences(of: "?", with: "%3F")
      .replacingOccurrences(of: "#", with: "%23")
  }

  func testEveryFileNameComesBackAsItIs() {
    // The first four are real 2.5.2 file names, which `URL(string:)` gets wrong.
    let names = [
      "Kendrick Lamar - Black Friday [ ezmp3.cc ] 2.mp3",
      "Matt Hardy - Trippie Redd ft. Juice WRLD {OG Version}.mp3",
      "Osamason â€“ Come Get Wit It [prod Skai + Warren Hunter].mp3",
      "9th Wonder, Dee-1, Thurz & Rapsody - Part Of The Game [prod. 9th Wonder].mp3",
      "Beyoncé - Déjà Vu.m4a",
      "日本語の曲.mp3",
      "100% #1? take.mp3",
      "already%20encoded [x].mp3",
      "plain.mp3",
    ]
    for name in names {
      let path = "/var/mobile/Documents/library/7/\(name)"
      XCTAssertEqual(FileLocation.url(from: expoUri(path))?.path, path, name)
      XCTAssertEqual(FileLocation.url(from: path)?.path, path, name)
    }
  }

  func testAFileURLIsAFileURL() {
    XCTAssertEqual(FileLocation.url(from: expoUri("/tmp/a [b].mp3"))?.isFileURL, true)
    XCTAssertNil(FileLocation.url(from: "https://example.com/a.mp3"))
  }
}
