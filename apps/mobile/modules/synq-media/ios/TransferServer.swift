import Foundation
import Network

/// Wi-Fi Transfer's web server: a small HTTP/1.1 server on the local network
/// (Network.framework) that serves the upload page and streams each uploaded
/// file straight to disk, so no file passes through JavaScript.
///
/// - `GET /` serves the page.
/// - `POST /upload` takes one file as the raw request body, named by the
///   `X-File-Name` header (percent-encoded), with a `Content-Length`.
///
/// Every connection handles one request and closes. All state lives on
/// `queue`.
final class TransferServer {
  typealias Emit = (_ event: String, _ body: [String: Any]) -> Void

  let queue = DispatchQueue(label: "com.directedbyshawn.synq.transfer")
  let page: Data
  let uploadDirectory: URL
  let allowedExtensions: Set<String>
  let emit: Emit
  private var listener: NWListener?
  private var connections: [ObjectIdentifier: TransferConnection] = [:]

  init(page: String, uploadDirectory: URL, allowedExtensions: [String], emit: @escaping Emit) {
    self.page = Data(page.utf8)
    self.uploadDirectory = uploadDirectory
    self.allowedExtensions = Set(allowedExtensions.map { $0.lowercased() })
    self.emit = emit
  }

  /// Listens on `preferredPort` (2.5.2's 3000, which people may remember),
  /// or any free port if it's taken. Returns the port.
  func start(preferredPort: Int) async throws -> Int {
    try FileManager.default.createDirectory(at: uploadDirectory, withIntermediateDirectories: true)
    if let port = NWEndpoint.Port(rawValue: UInt16(clamping: preferredPort)),
      let bound = try? await listen(on: port)
    {
      return bound
    }
    return try await listen(on: .any)
  }

  func stop() {
    queue.async {
      self.listener?.cancel()
      self.listener = nil
      for connection in self.connections.values { connection.cancel() }
      self.connections.removeAll()
    }
  }

  func remove(_ connection: TransferConnection) {
    connections.removeValue(forKey: ObjectIdentifier(connection))
  }

  private func listen(on port: NWEndpoint.Port) async throws -> Int {
    let parameters = NWParameters.tcp
    parameters.allowLocalEndpointReuse = true
    let listener = try NWListener(using: parameters, on: port)
    return try await withCheckedThrowingContinuation { continuation in
      var resumed = false
      listener.stateUpdateHandler = { [weak self] state in
        switch state {
        case .ready:
          guard !resumed else { return }
          resumed = true
          self?.listener = listener
          continuation.resume(returning: Int(listener.port?.rawValue ?? port.rawValue))
        case .failed(let error), .waiting(let error):
          if !resumed {
            resumed = true
            listener.cancel()
            continuation.resume(throwing: error)
          } else {
            listener.cancel()
            self?.emit("onTransferStopped", ["reason": error.localizedDescription])
          }
        case .cancelled:
          if !resumed {
            resumed = true
            continuation.resume(throwing: CancellationError())
          }
        default:
          break
        }
      }
      listener.newConnectionHandler = { [weak self] connection in
        guard let self else {
          connection.cancel()
          return
        }
        let handler = TransferConnection(connection: connection, server: self)
        self.connections[ObjectIdentifier(handler)] = handler
        handler.start()
      }
      listener.start(queue: queue)
    }
  }
}

final class TransferConnection {
  private struct Upload {
    let id: String
    let name: String
    let mimeType: String
    let directory: URL
    let url: URL
    let handle: FileHandle
    let expected: Int64
    var received: Int64 = 0
    var lastProgress = Date.distantPast
  }

  private static let headLimit = 32 * 1024
  private let connection: NWConnection
  private weak var server: TransferServer?
  private var buffer = Data()
  private var upload: Upload?
  private var closed = false

  init(connection: NWConnection, server: TransferServer) {
    self.connection = connection
    self.server = server
  }

  func start() {
    guard let server else { return }
    connection.start(queue: server.queue)
    readHead()
  }

  func cancel() {
    if upload != nil { failUpload() }
    close()
  }

  // MARK: Request head

  private func readHead() {
    connection.receive(minimumIncompleteLength: 1, maximumLength: 64 * 1024) {
      [weak self] data, _, complete, error in
      guard let self else { return }
      if let data { self.buffer.append(data) }
      if let end = self.buffer.range(of: Data("\r\n\r\n".utf8)) {
        let head = self.buffer.subdata(in: self.buffer.startIndex..<end.lowerBound)
        let body = self.buffer.subdata(in: end.upperBound..<self.buffer.endIndex)
        self.buffer.removeAll()
        self.handle(head: head, body: body)
      } else if error != nil || complete {
        self.close()
      } else if self.buffer.count > Self.headLimit {
        self.respond(431, json: ["error": "Request too large."])
      } else {
        self.readHead()
      }
    }
  }

  private func handle(head: Data, body: Data) {
    guard let text = String(data: head, encoding: .utf8) ?? String(data: head, encoding: .isoLatin1)
    else { return respond(400, json: ["error": "Bad request."]) }
    var lines = text.components(separatedBy: "\r\n")
    let requestLine = lines.removeFirst().split(separator: " ")
    guard requestLine.count >= 2 else { return respond(400, json: ["error": "Bad request."]) }
    let method = String(requestLine[0]).uppercased()
    let path = String(requestLine[1].split(separator: "?").first ?? "/")
    var headers: [String: String] = [:]
    for line in lines {
      guard let colon = line.firstIndex(of: ":") else { continue }
      let name = line[..<colon].trimmingCharacters(in: .whitespaces).lowercased()
      headers[name] = line[line.index(after: colon)...].trimmingCharacters(in: .whitespaces)
    }

    switch (method, path) {
    case ("GET", "/"), ("GET", "/index.html"):
      respond(200, contentType: "text/html; charset=utf-8", body: server?.page ?? Data())
    case ("GET", "/ping"):
      respond(200, json: ["ok": true])
    case ("GET", "/favicon.ico"):
      respond(204, contentType: "text/plain", body: Data())
    case ("POST", "/upload"):
      beginUpload(headers: headers, initial: body)
    default:
      respond(404, json: ["error": "Not found."])
    }
  }

  // MARK: Upload

  private func beginUpload(headers: [String: String], initial: Data) {
    guard let server else { return close() }
    guard let lengthText = headers["content-length"], let expected = Int64(lengthText),
      expected > 0
    else { return respond(411, json: ["error": "Send the file with a Content-Length."]) }
    let rawName = headers["x-file-name"].flatMap { $0.removingPercentEncoding } ?? ""
    let name = Self.safeFileName(rawName)
    let fileExtension = (name as NSString).pathExtension.lowercased()
    guard server.allowedExtensions.contains(fileExtension) else {
      return respond(415, json: ["error": "SYNQ imports MP3, M4A, AAC, FLAC, and WAV files."])
    }
    let id = UUID().uuidString
    let directory = server.uploadDirectory.appendingPathComponent(id, isDirectory: true)
    let url = directory.appendingPathComponent(name)
    do {
      try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
      guard FileManager.default.createFile(atPath: url.path, contents: nil) else {
        throw CocoaError(.fileWriteUnknown)
      }
      let handle = try FileHandle(forWritingTo: url)
      upload = Upload(
        id: id, name: name,
        mimeType: headers["content-type"] ?? "application/octet-stream",
        directory: directory, url: url, handle: handle, expected: expected)
    } catch {
      try? FileManager.default.removeItem(at: directory)
      return respond(500, json: ["error": "SYNQ couldn't save the file."])
    }
    server.emit("onTransferStart", ["id": id, "name": name, "size": Double(expected)])
    receive(initial)
  }

  private func receive(_ data: Data) {
    guard var current = upload else { return }
    if !data.isEmpty {
      let remaining = current.expected - current.received
      let chunk = Int64(data.count) > remaining ? data.prefix(Int(remaining)) : data
      do {
        try current.handle.write(contentsOf: chunk)
      } catch {
        upload = current
        failUpload()
        return respond(500, json: ["error": "SYNQ couldn't save the file."])
      }
      current.received += Int64(chunk.count)
      let now = Date()
      if now.timeIntervalSince(current.lastProgress) > 0.2 {
        current.lastProgress = now
        server?.emit(
          "onTransferProgress",
          ["id": current.id, "received": Double(current.received), "size": Double(current.expected)])
      }
      upload = current
    }
    if current.received >= current.expected {
      finishUpload()
    } else {
      readBody()
    }
  }

  private func readBody() {
    connection.receive(minimumIncompleteLength: 1, maximumLength: 1 << 20) {
      [weak self] data, _, complete, error in
      guard let self else { return }
      if let data, !data.isEmpty {
        self.receive(data)
      } else if error != nil || complete {
        self.failUpload()
        self.close()
      } else {
        self.readBody()
      }
    }
  }

  private func finishUpload() {
    guard let current = upload else { return }
    upload = nil
    try? current.handle.close()
    server?.emit(
      "onTransferFile",
      [
        "id": current.id, "uri": current.url.absoluteString, "name": current.name,
        "mimeType": current.mimeType, "size": Double(current.received),
      ])
    respond(200, json: ["ok": true])
  }

  private func failUpload() {
    guard let current = upload else { return }
    upload = nil
    try? current.handle.close()
    try? FileManager.default.removeItem(at: current.directory)
    server?.emit("onTransferFailed", ["id": current.id])
  }

  // MARK: Responses

  private func respond(_ status: Int, json: [String: Any]) {
    let body = (try? JSONSerialization.data(withJSONObject: json)) ?? Data("{}".utf8)
    respond(status, contentType: "application/json", body: body)
  }

  private func respond(_ status: Int, contentType: String, body: Data) {
    let head =
      "HTTP/1.1 \(status) \(Self.reason(status))\r\n"
      + "Content-Type: \(contentType)\r\n"
      + "Content-Length: \(body.count)\r\n"
      + "Cache-Control: no-store\r\n"
      + "Connection: close\r\n\r\n"
    connection.send(
      content: Data(head.utf8) + body,
      completion: .contentProcessed { [weak self] _ in self?.close() })
  }

  private func close() {
    guard !closed else { return }
    closed = true
    connection.cancel()
    server?.remove(self)
  }

  private static func reason(_ status: Int) -> String {
    switch status {
    case 200: return "OK"
    case 204: return "No Content"
    case 400: return "Bad Request"
    case 404: return "Not Found"
    case 411: return "Length Required"
    case 415: return "Unsupported Media Type"
    case 431: return "Request Header Fields Too Large"
    default: return "Internal Server Error"
    }
  }

  /// One path component: no separators or control characters.
  private static func safeFileName(_ name: String) -> String {
    let cleaned = name.precomposedStringWithCanonicalMapping
      .components(separatedBy: CharacterSet(charactersIn: "/\\:").union(.controlCharacters))
      .joined(separator: "_")
      .trimmingCharacters(in: .whitespaces)
    return cleaned.isEmpty || cleaned == "." || cleaned == ".." ? "Untitled" : cleaned
  }
}
