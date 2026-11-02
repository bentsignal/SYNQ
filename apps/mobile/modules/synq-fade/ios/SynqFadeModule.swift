import ExpoModulesCore

/// The marquee's mask. JavaScript: `src/features/player/marquee-text.tsx`.
public class SynqFadeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("SynqFade")

    View(FadeView.self) {
      Prop("fadeWidth") { (view: FadeView, width: Double) in
        view.fadeWidth = CGFloat(width)
      }
      Prop("phase") { (view: FadeView, phase: Int) in
        view.phase = phase
      }
      Prop("contentKey") { (view: FadeView, _: String) in
        view.setNeedsLayout()
      }
      OnViewDidUpdateProps { view in
        view.update(animated: true)
      }
    }
  }
}
