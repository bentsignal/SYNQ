import ExpoModulesCore

/// The player's volume slider. JavaScript: `src/features/player/volume-slider.tsx`.
public class SynqVolumeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("SynqVolume")

    View(VolumeSliderView.self) {
      Events("onAvailabilityChange")
    }
  }
}
