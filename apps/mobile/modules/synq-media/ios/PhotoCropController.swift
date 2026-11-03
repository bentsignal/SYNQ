import UIKit

/// Move and Scale: the photo behind a square, dragged and pinched until the part
/// that matters is inside it. It can't be moved or shrunk so far that the square
/// has anything but photo in it. Double tap zooms in and back.
@MainActor
final class PhotoCropController: UIViewController, UIScrollViewDelegate {
  private static let maxZoomFactor: CGFloat = 4
  private static let doubleTapZoomFactor: CGFloat = 2.5
  private static let jpegQuality: CGFloat = 0.95

  var onCancel: (() -> Void)?
  var onChoose: (([String: Any]) -> Void)?

  private let scrollView = UIScrollView()
  private let imageView = UIImageView()
  private let overlay = CropOverlayView()
  private let titleLabel = UILabel()
  private let spinner = UIActivityIndicatorView(style: .medium)
  private lazy var cancelButton = button(title: "Cancel") { [weak self] in self?.onCancel?() }
  private lazy var chooseButton = button(title: "Choose") { [weak self] in self?.choose() }
  private var fitted = false

  init() {
    super.init(nibName: nil, bundle: nil)
    modalPresentationStyle = .fullScreen
    overrideUserInterfaceStyle = .dark
  }

  @available(*, unavailable)
  required init?(coder: NSCoder) { fatalError("not from a storyboard") }

  override var prefersStatusBarHidden: Bool { true }

  override func viewDidLoad() {
    super.viewDidLoad()
    view.backgroundColor = .black
    scrollView.delegate = self
    scrollView.contentInsetAdjustmentBehavior = .never
    scrollView.showsVerticalScrollIndicator = false
    scrollView.showsHorizontalScrollIndicator = false
    scrollView.decelerationRate = .fast
    scrollView.addSubview(imageView)
    view.addSubview(scrollView)

    let doubleTap = UITapGestureRecognizer(target: self, action: #selector(doubleTapped))
    doubleTap.numberOfTapsRequired = 2
    scrollView.addGestureRecognizer(doubleTap)

    overlay.isUserInteractionEnabled = false
    view.addSubview(overlay)

    titleLabel.text = "Move and Scale"
    titleLabel.textColor = .white
    titleLabel.font = .preferredFont(forTextStyle: .headline)
    titleLabel.adjustsFontForContentSizeCategory = true
    titleLabel.textAlignment = .center
    view.addSubview(titleLabel)

    spinner.color = .white
    spinner.startAnimating()
    view.addSubview(spinner)

    chooseButton.isEnabled = false
    view.addSubview(cancelButton)
    view.addSubview(chooseButton)
  }

  private func button(title: String, action: @escaping () -> Void) -> UIButton {
    var configuration: UIButton.Configuration
    if #available(iOS 26.0, *) {
      configuration = .glass()
    } else {
      configuration = .gray()
      configuration.cornerStyle = .capsule
    }
    configuration.title = title
    configuration.baseForegroundColor = .white
    configuration.contentInsets = NSDirectionalEdgeInsets(
      top: 11, leading: 20, bottom: 11, trailing: 20)
    return UIButton(configuration: configuration, primaryAction: UIAction { _ in action() })
  }

  /// The square, as wide as the screen, in the middle of it.
  private var cropRect: CGRect {
    let side = min(view.bounds.width, view.bounds.height)
    return CGRect(
      x: (view.bounds.width - side) / 2, y: (view.bounds.height - side) / 2, width: side,
      height: side)
  }

  override func viewDidLayoutSubviews() {
    super.viewDidLayoutSubviews()
    let safe = view.safeAreaInsets
    scrollView.frame = view.bounds
    overlay.frame = view.bounds
    overlay.hole = cropRect
    spinner.center = CGPoint(x: view.bounds.midX, y: view.bounds.midY)

    titleLabel.frame = CGRect(
      x: 16, y: max(safe.top, 20) + 12, width: view.bounds.width - 32, height: 24)

    let margin: CGFloat = 20
    let bottom = view.bounds.height - max(safe.bottom, 20) - 8
    for (button, leading) in [(cancelButton, true), (chooseButton, false)] {
      let size = button.sizeThatFits(view.bounds.size)
      button.frame = CGRect(
        x: leading ? margin : view.bounds.width - margin - size.width, y: bottom - size.height,
        width: size.width, height: size.height)
    }
    fitIfNeeded()
  }

  /// The photo arrived, once it's been read.
  func show(_ image: UIImage) {
    loadViewIfNeeded()
    imageView.image = image
    imageView.frame = CGRect(origin: .zero, size: image.size)
    scrollView.contentSize = image.size
    spinner.stopAnimating()
    chooseButton.isEnabled = true
    fitted = false
    view.setNeedsLayout()
  }

  /// Fills the square, centered, the first time there's a photo and a size.
  private func fitIfNeeded() {
    guard !fitted, let image = imageView.image, view.bounds.width > 0 else { return }
    fitted = true
    let crop = cropRect
    let fill = crop.width / max(min(image.size.width, image.size.height), 1)
    scrollView.minimumZoomScale = fill
    scrollView.maximumZoomScale = fill * Self.maxZoomFactor
    scrollView.zoomScale = fill
    // Room to bring any edge of the photo up to the square's edge, and no more.
    scrollView.contentInset = UIEdgeInsets(
      top: crop.minY, left: crop.minX, bottom: view.bounds.height - crop.maxY,
      right: view.bounds.width - crop.maxX)
    scrollView.contentOffset = CGPoint(
      x: (image.size.width * fill - view.bounds.width) / 2,
      y: (image.size.height * fill - view.bounds.height) / 2)
  }

  func viewForZooming(in scrollView: UIScrollView) -> UIView? {
    imageView
  }

  @objc private func doubleTapped(_ recognizer: UITapGestureRecognizer) {
    let fill = scrollView.minimumZoomScale
    if scrollView.zoomScale > fill * 1.01 {
      scrollView.setZoomScale(fill, animated: true)
      return
    }
    let scale = fill * Self.doubleTapZoomFactor
    let point = recognizer.location(in: imageView)
    let size = CGSize(
      width: scrollView.bounds.width / scale, height: scrollView.bounds.height / scale)
    scrollView.zoom(
      to: CGRect(
        x: point.x - size.width / 2, y: point.y - size.height / 2, width: size.width,
        height: size.height),
      animated: true)
  }

  /// What's inside the square, in the photo's pixels, written as a JPEG.
  private func choose() {
    guard let image = imageView.image else { return }
    let crop = cropRect
    let zoom = scrollView.zoomScale
    let side = min(crop.width / zoom, image.size.width, image.size.height)
    let x = min(
      max((scrollView.contentOffset.x + crop.minX) / zoom, 0), image.size.width - side)
    let y = min(
      max((scrollView.contentOffset.y + crop.minY) / zoom, 0), image.size.height - side)
    let pixels = max(side.rounded(), 1)
    let format = UIGraphicsImageRendererFormat()
    format.scale = 1
    format.opaque = true
    let data = UIGraphicsImageRenderer(
      size: CGSize(width: pixels, height: pixels), format: format
    ).jpegData(withCompressionQuality: Self.jpegQuality) { _ in
      let scale = pixels / side
      image.draw(
        in: CGRect(
          x: -x * scale, y: -y * scale, width: image.size.width * scale,
          height: image.size.height * scale))
    }
    let url = FileManager.default.temporaryDirectory
      .appendingPathComponent("crop-\(UUID().uuidString).jpg")
    do {
      try data.write(to: url)
      onChoose?(["uri": url.absoluteString, "width": Int(pixels)])
    } catch {
      onCancel?()
    }
  }
}

/// The shade around the square, with a hairline along its edge.
private final class CropOverlayView: UIView {
  var hole: CGRect = .zero {
    didSet { setNeedsDisplay() }
  }

  override init(frame: CGRect) {
    super.init(frame: frame)
    isOpaque = false
    contentMode = .redraw
  }

  @available(*, unavailable)
  required init?(coder: NSCoder) { fatalError("not from a storyboard") }

  override func draw(_ rect: CGRect) {
    UIColor.black.withAlphaComponent(0.62).setFill()
    UIRectFill(bounds)
    UIColor.clear.setFill()
    UIRectFillUsingBlendMode(hole, .clear)
    UIColor.white.withAlphaComponent(0.5).setStroke()
    let border = UIBezierPath(rect: hole)
    border.lineWidth = 1 / max(traitCollection.displayScale, 1)
    border.stroke()
  }
}
