Pod::Spec.new do |s|
  s.name           = 'SynqBackdrop'
  s.version        = '1.0.0'
  s.summary        = "The player's moving backdrop, drawn with Metal from a cover's colors."
  s.author         = 'SYNQ'
  s.homepage       = 'https://directedbyshawn.com/synq'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: '' }
  s.static_framework = true
  s.swift_version  = '5.9'

  s.dependency 'ExpoModulesCore'

  s.source_files = '**/*.swift'
  s.frameworks = 'Metal', 'QuartzCore'
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }
end
