// Runs the real TransferServer on the Mac for `transfer-server.test.ts`.
// Reads commands from stdin, one JSON object a line; writes each event the
// module would send to JavaScript to stdout, one JSON object a line.
import Foundation

guard CommandLine.arguments.count >= 3, let port = Int(CommandLine.arguments[1]) else {
  fatalError("usage: harness <port> <upload directory> [page file]")
}

func write(_ object: [String: Any]) {
  guard let data = try? JSONSerialization.data(withJSONObject: object),
    let line = String(data: data, encoding: .utf8)
  else { return }
  print(line)
  fflush(stdout)
}

let page =
  CommandLine.arguments.count > 3
  ? (try? String(contentsOfFile: CommandLine.arguments[3], encoding: .utf8)) ?? ""
  : "<!doctype html><script type=\"application/json\">\(TransferServer.stateToken)</script>"
let server = TransferServer(
  page: page,
  uploadDirectory: URL(fileURLWithPath: CommandLine.arguments[2], isDirectory: true),
  allowedExtensions: ["mp3", "flac"],
  live: TransferLiveState(),
  finished: FinishedUploads()
) { event, body in
  var message = body
  message["event"] = event
  write(message)
}

Task {
  do {
    let bound = try await server.start(preferredPort: port)
    write(["event": "listening", "port": bound])
  } catch {
    write(["event": "failed", "reason": error.localizedDescription])
  }
  while let line = readLine() {
    guard let data = line.data(using: .utf8),
      let command = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
    else { continue }
    switch command["command"] as? String {
    case "state":
      server.setLive(
        TransferLiveState(
          json: command["json"] as? String ?? "{}",
          accepting: command["accepting"] as? Bool ?? true))
      write(["event": "stateSet"])
    case "alive":
      write(["event": "alive", "alive": await server.isAlive()])
    case "stop":
      server.stop()
      write(["event": "stopped"])
    default:
      break
    }
  }
  exit(0)
}
dispatchMain()
