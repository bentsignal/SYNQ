Pod::Spec.new do |s|
  s.name           = 'SynqMedia'
  s.version        = '1.0.0'
  s.summary        = 'Reads and tags audio files, writes artwork, and runs the Wi-Fi Transfer server.'
  s.author         = 'SYNQ'
  s.homepage       = 'https://directedbyshawn.com/synq'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: '' }
  s.static_framework = true
  s.swift_version  = '5.9'

  s.dependency 'ExpoModulesCore'

  s.source_files = '**/*.swift'
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }
end
