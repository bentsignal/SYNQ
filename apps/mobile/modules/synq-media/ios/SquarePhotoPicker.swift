import ImageIO
import PhotosUI
import UIKit
import UniformTypeIdentifiers

/// Choosing a square photo, the way the system's own editor does it: the photo
/// picker, then Move and Scale on top of it. Cancel goes back to the picker, and
/// Choose closes both.
///
/// `UIImagePickerController` has this built in, but it loads the whole library
/// before it appears, about five seconds. `PHPickerViewController` opens at once
/// and asks for no permission, and it has no editor, so the editor is ours.
@MainActor
final class SquarePhotoPicker: NSObject, PHPickerViewControllerDelegate {
  /// Decoded no larger than this, which a 1500 px cover has room to spare under.
  private static let maxPixels = 3000

  /// Keeps the flow alive while it's on screen; the picker's delegate is weak.
  private static var current: SquarePhotoPicker?

  private let finished: ([String: Any]?) -> Void
  private weak var presenter: UIViewController?

  private init(finished: @escaping ([String: Any]?) -> Void) {
    self.finished = finished
  }

  /// `finished` gets the file's `uri` and its `width`, or nil if nothing was chosen.
  static func show(finished: @escaping ([String: Any]?) -> Void) {
    guard let presenter = frontmostController() else { return finished(nil) }
    let flow = SquarePhotoPicker(finished: finished)
    flow.presenter = presenter
    current = flow
    var configuration = PHPickerConfiguration()
    configuration.filter = .images
    configuration.selectionLimit = 1
    configuration.preferredAssetRepresentationMode = .current
    let picker = PHPickerViewController(configuration: configuration)
    picker.delegate = flow
    presenter.present(picker, animated: true)
  }

  private static func frontmostController() -> UIViewController? {
    let scenes = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
    let window = scenes.flatMap(\.windows).first(where: \.isKeyWindow)
    var controller = window?.rootViewController
    while let presented = controller?.presentedViewController { controller = presented }
    return controller
  }

  nonisolated func picker(
    _ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]
  ) {
    MainActor.assumeIsolated {
      guard let provider = results.first?.itemProvider else { return finish(nil) }
      let crop = PhotoCropController()
      crop.onCancel = { [weak crop] in crop?.dismiss(animated: true) }
      crop.onChoose = { [weak self] result in self?.finish(result) }
      picker.present(crop, animated: true)
      provider.loadFileRepresentation(forTypeIdentifier: UTType.image.identifier) { url, _ in
        // The file is gone once this returns, so it's read here.
        let image = url.flatMap(Self.decoded)
        DispatchQueue.main.async {
          MainActor.assumeIsolated {
            if let image {
              crop.show(image)
            } else {
              crop.onCancel?()
            }
          }
        }
      }
    }
  }

  /// Upright, and no larger than it needs to be: a 48 MP photo would hold about
  /// 190 MB while someone moved it around.
  private nonisolated static func decoded(_ url: URL) -> UIImage? {
    guard let source = CGImageSourceCreateWithURL(url as CFURL, nil) else { return nil }
    let options =
      [
        kCGImageSourceCreateThumbnailFromImageAlways: true,
        kCGImageSourceCreateThumbnailWithTransform: true,
        kCGImageSourceShouldCacheImmediately: true,
        kCGImageSourceThumbnailMaxPixelSize: maxPixels,
      ] as CFDictionary
    return CGImageSourceCreateThumbnailAtIndex(source, 0, options).map { UIImage(cgImage: $0) }
  }

  private func finish(_ result: [String: Any]?) {
    let done = finished
    Self.current = nil
    presenter?.dismiss(animated: true) { done(result) }
  }
}
