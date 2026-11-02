import ExpoModulesCore

/// The player's timeline. JavaScript: `src/features/player/scrubber.tsx`.
public class SynqScrubberModule: Module {
  public func definition() -> ModuleDefinition {
    Name("SynqScrubber")

    View(ScrubberView.self) {
      Events("onScrub", "onSeek")

      Prop("fraction") { (view: ScrubberView, fraction: Double) in
        view.show(fraction: CGFloat(fraction))
      }
      Prop("durationSeconds") { (view: ScrubberView, seconds: Double) in
        view.durationSeconds = seconds
      }
      Prop("seekable") { (view: ScrubberView, seekable: Bool) in
        view.dragEnabled = seekable
      }
      Prop("valueText") { (view: ScrubberView, text: String) in
        view.valueText = text
      }
    }
  }
}
