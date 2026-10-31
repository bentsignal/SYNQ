import Darwin
import Foundation

/// The device's IPv4 address on Wi-Fi (`en0`), or on any other non-loopback
/// interface that is up (a personal hotspot's bridge, a simulator's Mac).
enum NetworkAddress {
  static func wifiIPv4() -> String? {
    var addresses: [(name: String, address: String)] = []
    var head: UnsafeMutablePointer<ifaddrs>?
    guard getifaddrs(&head) == 0, let first = head else { return nil }
    defer { freeifaddrs(head) }
    for pointer in sequence(first: first, next: { $0.pointee.ifa_next }) {
      let entry = pointer.pointee
      let flags = Int32(entry.ifa_flags)
      guard let socket = entry.ifa_addr, socket.pointee.sa_family == UInt8(AF_INET),
        flags & IFF_UP != 0, flags & IFF_LOOPBACK == 0
      else { continue }
      var host = [CChar](repeating: 0, count: Int(NI_MAXHOST))
      guard
        getnameinfo(
          socket, socklen_t(socket.pointee.sa_len), &host, socklen_t(host.count), nil, 0,
          NI_NUMERICHOST) == 0
      else { continue }
      let address = String(cString: host)
      // Self-assigned link-local addresses aren't reachable from a computer.
      if address.hasPrefix("169.254.") { continue }
      addresses.append((String(cString: entry.ifa_name), address))
    }
    return addresses.first(where: { $0.name == "en0" })?.address
      ?? addresses.first(where: { $0.name.hasPrefix("en") || $0.name.hasPrefix("bridge") })?
      .address
  }
}
