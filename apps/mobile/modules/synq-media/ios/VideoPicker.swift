import PhotosUI
import UIKit
import UniformTypeIdentifiers

/// The photo picker showing only videos, several at once. Like
/// `SquarePhotoPicker`, it opens at once and asks for no permission. The
/// picked videos are copied into a folder JavaScript gives, since the
/// picker's own copies are gone once it hands them over.
@MainActor
final class VideoPicker: NSObject, PHPickerViewControllerDelegate {
  /// Keeps the flow alive while it's on screen; the picker's delegate is weak.
  private static var current: VideoPicker?

  private let directory: URL
  private let finished: ([[String: Any]]) -> Void

  private init(directory: URL, finished: @escaping ([[String: Any]]) -> Void) {
    self.directory = directory
    self.finished = finished
  }

  /// `finished` gets each picked video's `uri` and `name` (as Photos would
  /// save it, with its extension), in the order picked; none if cancelled.
  /// A video that couldn't be copied still comes back, with nothing at its
  /// `uri`, so the import names it with the others that failed.
  static func show(directory: URL, finished: @escaping ([[String: Any]]) -> Void) {
    guard let presenter = frontmostController() else { return finished([]) }
    let flow = VideoPicker(directory: directory, finished: finished)
    current = flow
    var configuration = PHPickerConfiguration()
    configuration.filter = .videos
    configuration.selectionLimit = 0
    configuration.selection = .ordered
    // The original file, not one transcoded for compatibility.
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
      picker.dismiss(animated: true)
      copy(results.map(\.itemProvider))
    }
  }

  private func copy(_ providers: [NSItemProvider]) {
    let directory = self.directory
    var copied: [[String: Any]] = Array(repeating: [:], count: providers.count)
    let group = DispatchGroup()
    for (index, provider) in providers.enumerated() {
      group.enter()
      let name = provider.suggestedName
      provider.loadFileRepresentation(forTypeIdentifier: UTType.movie.identifier) { url, _ in
        // The file is gone once this returns, so it's copied here.
        let result = Self.copy(url, name: name, into: directory)
        DispatchQueue.main.async {
          copied[index] = result
          group.leave()
        }
      }
    }
    group.notify(queue: .main) {
      Self.current = nil
      self.finished(copied)
    }
  }

  private nonisolated static func copy(_ url: URL?, name: String?, into directory: URL)
    -> [String: Any]
  {
    let fileExtension = url.map(\.pathExtension).flatMap { $0.isEmpty ? nil : $0 } ?? "mov"
    let destination = directory.appendingPathComponent(
      "\(UUID().uuidString).\(fileExtension)")
    if let url {
      let manager = FileManager.default
      try? manager.createDirectory(at: directory, withIntermediateDirectories: true)
      try? manager.copyItem(at: url, to: destination)
    }
    let base =
      name.flatMap { $0.isEmpty ? nil : $0 }
      ?? url?.deletingPathExtension().lastPathComponent ?? "Video"
    return ["uri": destination.absoluteString, "name": "\(base).\(fileExtension)"]
  }
}
