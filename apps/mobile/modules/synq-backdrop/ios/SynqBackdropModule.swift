import ExpoModulesCore

/// The player's backdrop and the read of a cover behind it.
/// JavaScript: `src/features/player/native-backdrop.ts`.
public class SynqBackdropModule: Module {
  public func definition() -> ModuleDefinition {
    Name("SynqBackdrop")

    AsyncFunction("analyzeArtwork") { (imageUri: String) -> [String: Any]? in
      guard let url = URL(string: imageUri),
        let result = ArtworkAnalysis.read(imageURL: url)
      else { return nil }
      return [
        "clusters": result.clusters.map { cluster -> [String: Any] in
          [
            "color": cluster.color,
            "x": cluster.x,
            "y": cluster.y,
            "population": cluster.population,
          ]
        },
        "cornerInset": result.cornerInset,
      ]
    }.runOnQueue(.global(qos: .userInitiated))

    Function("frameStats") { () -> [String: Any] in
      let stats = BackdropView.stats
      return [
        "frames": stats.frames,
        "encodeMs": stats.frames == 0 ? 0 : stats.encodeSeconds * 1000 / Double(stats.frames),
        "gpuMs": stats.gpuFrames == 0 ? 0 : stats.gpuSeconds * 1000 / Double(stats.gpuFrames),
      ]
    }

    View(BackdropView.self) {
      Prop("swatches") { (view: BackdropView, swatches: [BackdropSwatch]) in
        view.setSwatches(swatches)
      }
      Prop("animating") { (view: BackdropView, animating: Bool) in
        view.animating = animating
      }
    }
  }
}
