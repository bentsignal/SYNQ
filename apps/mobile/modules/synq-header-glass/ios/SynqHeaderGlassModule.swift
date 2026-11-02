import ExpoModulesCore

/// A root tab's glass header. JavaScript: `src/components/header-glass.tsx`.
public class SynqHeaderGlassModule: Module {
  public func definition() -> ModuleDefinition {
    Name("SynqHeaderGlass")

    View(HeaderGlassView.self) {}
  }
}
