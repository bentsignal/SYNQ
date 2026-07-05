Pod::Spec.new do |s|
  s.name           = 'SynqNativeAudio'
  s.version        = '0.0.0'
  s.summary        = 'Native audio session and playback module for SYNQ'
  s.description    = 'Native audio session and playback module for SYNQ'
  s.author         = 'SYNQ'
  s.homepage       = 'https://github.com/bentsignal/SYNQ.app'
  s.platforms      = {
    :ios => '16.4',
    :tvos => '16.4'
  }
  s.source         = { git: 'https://github.com/bentsignal/SYNQ.app.git' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
