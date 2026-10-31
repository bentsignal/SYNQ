import AVKit
import ExpoModulesCore

/// The system AirPlay button (`AVRoutePickerView`): tapping it opens iOS's
/// own route picker, and it tints itself while audio goes to another device.
final class RoutePickerView: ExpoView {
  let picker = AVRoutePickerView()

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    picker.prioritizesVideoDevices = false
    picker.backgroundColor = .clear
    addSubview(picker)
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    picker.frame = bounds
  }
}
