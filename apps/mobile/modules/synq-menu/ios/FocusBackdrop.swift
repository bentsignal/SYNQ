import UIKit

/// The app behind a lifted row, blurred and dimmed, for the length of its
/// context menu, so the row stands out from whatever it was lifted over. iOS
/// only dims.
///
/// It goes on top of what was frontmost in the window when the long press
/// began. The menu's own views arrive after that, above it, and take every touch.
@MainActor
final class FocusBackdrop {
  private static let dim: CGFloat = 0.15

  private let blur = UIVisualEffectView(effect: nil)
  private let shade = UIView()

  init(on host: UIView) {
    blur.frame = host.bounds
    blur.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    blur.isUserInteractionEnabled = false
    blur.accessibilityElementsHidden = true
    shade.frame = blur.bounds
    shade.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    shade.backgroundColor = .black
    shade.alpha = 0
    blur.contentView.addSubview(shade)
    host.addSubview(blur)
  }

  func show(alongside animator: UIContextMenuInteractionAnimating?) {
    let appear = { [self] in
      blur.effect = UIBlurEffect(style: .systemUltraThinMaterialDark)
      shade.alpha = Self.dim
    }
    if let animator {
      animator.addAnimations(appear)
    } else {
      appear()
    }
  }

  func hide(alongside animator: UIContextMenuInteractionAnimating?) {
    let disappear = { [self] in
      blur.effect = nil
      shade.alpha = 0
    }
    guard let animator else {
      blur.removeFromSuperview()
      return
    }
    animator.addAnimations(disappear)
    animator.addCompletion { [self] in blur.removeFromSuperview() }
  }
}
