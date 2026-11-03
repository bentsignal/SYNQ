import UIKit

/// The app behind a lifted row, blurred and dimmed, for the length of its
/// context menu, so the row stands out from whatever it was lifted over. iOS
/// only dims.
///
/// It goes on top of the part of the window that holds the row: the app, or the
/// sheet the row is in. A menu's own views sit above that and take every touch,
/// including the last menu's, still closing after a quick second long press.
@MainActor
final class FocusBackdrop {
  private static let dim: CGFloat = 0.15

  private let blur = UIVisualEffectView(effect: nil)
  private let shade = UIView()

  init?(for row: UIView) {
    var host = row
    while let parent = host.superview, !(parent is UIWindow) { host = parent }
    guard host.superview is UIWindow else { return nil }
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
