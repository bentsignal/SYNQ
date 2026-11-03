// swift-tools-version: 6.0
// The playback engine (ios/Engine) builds as a plain Swift package so it can be
// tested on macOS with `swift test`. The CocoaPod (ios/SynqAudio.podspec)
// compiles the same sources together with the Expo glue in ios/Module.
import PackageDescription

let package = Package(
  name: "SynqAudio",
  platforms: [.iOS("16.4"), .macOS(.v13)],
  products: [
    .library(name: "SynqAudioEngine", targets: ["SynqAudioEngine"]),
  ],
  targets: [
    .target(name: "SynqAudioEngine", path: "ios/Engine"),
    .testTarget(
      name: "SynqAudioEngineTests",
      dependencies: ["SynqAudioEngine"],
      path: "ios/Tests/SynqAudioEngineTests",
      swiftSettings: [.swiftLanguageMode(.v5)]
    ),
  ]
)
