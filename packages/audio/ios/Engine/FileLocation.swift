import Foundation

/// A song's file from what JavaScript sends: a `file://` URL or an absolute path.
///
/// Never `URL(string:)` for a file URL. expo-file-system leaves `[`, `{`, and
/// letters like `é` as they are in a URI, and on iOS 17 `URL(string:)` "repairs" a
/// string with one of those by encoding all of it again: `%20` turns into `%2520`,
/// and the URL names a file that doesn't exist. 2.5.2 kept people's file names as
/// they were, so this is what real libraries look like.
public enum FileLocation {
  public static func url(from string: String) -> URL? {
    if string.hasPrefix("/") { return URL(fileURLWithPath: string) }
    guard string.hasPrefix("file://"),
      let path = String(string.dropFirst("file://".count)).removingPercentEncoding
    else { return nil }
    return URL(fileURLWithPath: path)
  }
}
