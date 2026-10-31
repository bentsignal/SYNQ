Pod::Spec.new do |s|
  s.name           = 'SynqAudio'
  s.version        = '0.0.0'
  s.summary        = 'Native queue playback for SYNQ'
  s.description    = 'AVQueuePlayer-based playback engine with Now Playing and remote commands, exposed as an Expo module.'
  s.author         = 'SYNQ'
  s.homepage       = 'https://github.com/bentsignal/SYNQ.app'
  s.license        = 'MIT'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: 'https://github.com/bentsignal/SYNQ.app.git' }
  s.static_framework = true
  # The engine is checked in Swift 6 mode by the Swift package (swift build /
  # swift test); the pod uses 5.9 so Expo API annotations can't turn
  # concurrency diagnostics in the glue into build errors.
  s.swift_version  = '5.9'

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  # Engine/ is plain Swift, also built and tested as a Swift package
  # (../Package.swift). Module/ is the Expo glue.
  s.source_files = 'Engine/**/*.swift', 'Module/**/*.swift'
  s.frameworks = 'AVFoundation', 'AVKit', 'MediaPlayer'
end
