Pod::Spec.new do |s|
  s.name           = 'SynqVolume'
  s.version        = '1.0.0'
  s.summary        = 'The timeline and system volume, drawn as nested capsules.'
  s.author         = 'SYNQ'
  s.homepage       = 'https://directedbyshawn.com/synq'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: '' }
  s.static_framework = true
  s.swift_version  = '5.9'

  s.dependency 'ExpoModulesCore'

  s.source_files = '**/*.swift'
  s.frameworks = 'MediaPlayer'
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }
end
