import Foundation
import Network

/// Upload ids that arrived in full, kept across server restarts, so a page
/// that lost the response to a finished upload doesn't send the file twice.
final class FinishedUploads {
  private let lock = NSLock()
  private var ids = Set<String>()

  func insert(_ id: String) {
    lock.lock()
    defer { lock.unlock() }
    ids.insert(id)
  }

  func contains(_ id: String) -> Bool {
    lock.lock()
    defer { lock.unlock() }
    return ids.contains(id)
  }
}

/// What the page is told: whether uploads are allowed, and everything else
/// it shows (the accent, how an import is going), as JSON from JavaScript.
struct TransferLiveState {
  var json = "{}"
  /// A build of the JavaScript that never sets this keeps today's behavior:
  /// the server takes uploads whenever it runs.
  var accepting = true
}

/// Wi-Fi Transfer's web server: a small HTTP/1.1 server on the local network
/// (Network.framework) that serves the upload page and streams each uploaded
/// file straight to disk, so no file passes through JavaScript.
///
/// - `GET /` serves the page, with the live state in place of
///   `TransferServer.stateToken` so its first paint is already right.
/// - `GET /events` is a Server-Sent Events stream: `state` on every change,
///   and a `ping` every few seconds so the page notices a suspended app.
/// - `GET /uploaded?id=` says whether an upload id arrived in full.
/// - `POST /upload` takes one file as the raw request body, named by the
///   `X-File-Name` header (percent-encoded), with a `Content-Length`, and is
///   refused with 403 while transfers are off. Uploads already on their way
///   finish.
///
/// Every connection but `/events` handles one request and closes. All state
/// lives on `queue`.
final class TransferServer {
  typealias Emit = (_ event: String, _ body: [String: Any]) -> Void

  static let stateToken = "__SYNQ_LIVE_STATE__"
  /// Often enough that a page notices a suspended app within seconds.
  private static let pingSeconds = 3
  /// An upload with no data for this long lost its browser without saying so.
  private static let stalledSeconds: TimeInterval = 45

  let queue = DispatchQueue(label: "com.directedbyshawn.synq.transfer")
  let page: String
  let uploadDirectory: URL
  let allowedExtensions: Set<String>
  let finished: FinishedUploads
  let emit: Emit
  private(set) var live: TransferLiveState
  private var listener: NWListener?
  private var connections: [ObjectIdentifier: TransferConnection] = [:]
  private var pages: [ObjectIdentifier: TransferConnection] = [:]
  private var timer: DispatchSourceTimer?

  init(
    page: String, uploadDirectory: URL, allowedExtensions: [String], live: TransferLiveState,
    finished: FinishedUploads, emit: @escaping Emit
  ) {
    self.page = page
    self.uploadDirectory = uploadDirectory
    self.allowedExtensions = Set(allowedExtensions.map { $0.lowercased() })
    self.live = live
    self.finished = finished
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
      self.timer?.cancel()
      self.timer = nil
      for connection in self.connections.values { connection.cancel() }
      self.connections.removeAll()
    }
  }

  func setLive(_ live: TransferLiveState) {
    queue.async {
      guard self.live.json != live.json || self.live.accepting != live.accepting else { return }
      self.live = live
      self.broadcast(Self.stateEvent(live.json))
    }
  }

  /// Whether the listener still answers. iOS can reclaim it while the app is
  /// suspended, and doesn't always say so. Connecting to oneself over the
  /// loopback never asks for Local Network permission.
  func isAlive() async -> Bool {
    await withCheckedContinuation { continuation in
      queue.async {
        guard let port = self.listener?.port else { return continuation.resume(returning: false) }
        let probe = NWConnection(host: .ipv4(.loopback), port: port, using: .tcp)
        var answered = false
        func answer(_ alive: Bool) {
          guard !answered else { return }
          answered = true
          probe.cancel()
          continuation.resume(returning: alive)
        }
        probe.stateUpdateHandler = { state in
          switch state {
          case .ready: answer(true)
          case .failed, .waiting: answer(false)
          default: break
          }
        }
        probe.start(queue: self.queue)
        self.queue.asyncAfter(deadline: .now() + 1) { answer(false) }
      }
    }
  }

  func remove(_ connection: TransferConnection) {
    connections.removeValue(forKey: ObjectIdentifier(connection))
    if pages.removeValue(forKey: ObjectIdentifier(connection)) != nil { reportPages() }
  }

  /// A connection became a page's event stream.
  func addPage(_ connection: TransferConnection) {
    pages[ObjectIdentifier(connection)] = connection
    connection.push(Self.stateEvent(live.json))
    reportPages()
  }

  private func reportPages() {
    emit("onTransferClients", ["count": pages.count])
  }

  private func broadcast(_ text: String) {
    for page in pages.values { page.push(text) }
  }

  private static func stateEvent(_ json: String) -> String {
    "event: state\ndata: \(json)\n\n"
  }

  private func startTimer() {
    let timer = DispatchSource.makeTimerSource(queue: queue)
    timer.schedule(deadline: .now() + .seconds(Self.pingSeconds), repeating: .seconds(Self.pingSeconds))
    timer.setEventHandler { [weak self] in
      guard let self else { return }
      self.broadcast("event: ping\ndata: 1\n\n")
      let now = Date()
      for connection in self.connections.values {
        connection.failIfStalled(now: now, after: Self.stalledSeconds)
      }
    }
    timer.resume()
    self.timer = timer
  }

  private static func parameters() -> NWParameters {
    let tcp = NWProtocolTCP.Options()
    // A browser that vanishes (a closed laptop) is noticed in seconds, so the
    // phone doesn't go on showing a computer as connected.
    tcp.enableKeepalive = true
    tcp.keepaliveIdle = 5
    tcp.keepaliveInterval = 2
    tcp.keepaliveCount = 3
    tcp.connectionDropTime = 15
    let parameters = NWParameters(tls: nil, tcp: tcp)
    parameters.allowLocalEndpointReuse = true
    return parameters
  }

  private func listen(on port: NWEndpoint.Port) async throws -> Int {
    let listener = try NWListener(using: Self.parameters(), on: port)
    return try await withCheckedThrowingContinuation { continuation in
      var resumed = false
      listener.stateUpdateHandler = { [weak self] state in
        switch state {
        case .ready:
          guard !resumed else { return }
          resumed = true
          self?.listener = listener
          self?.startTimer()
          continuation.resume(returning: Int(listener.port?.rawValue ?? port.rawValue))
        case .failed(let error), .waiting(let error):
          if !resumed {
            resumed = true
            listener.cancel()
            continuation.resume(throwing: error)
          } else {
            listener.cancel()
            self?.listenerLost(reason: error.localizedDescription)
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

  /// On `queue`. Its connections usually died with it; JavaScript restarts.
  private func listenerLost(reason: String) {
    listener = nil
    timer?.cancel()
    timer = nil
    for connection in connections.values { connection.cancel() }
    connections.removeAll()
    emit("onTransferStopped", ["reason": reason])
  }
}

final class TransferConnection {
  private struct Upload {
    let id: String
    /// The page's own id for the file, the same on a retry.
    let pageId: String?
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
  private static let drainSeconds: TimeInterval = 10
  private let connection: NWConnection
  private weak var server: TransferServer?
  private var buffer = Data()
  private var upload: Upload?
  private var lastData = Date()
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

  func failIfStalled(now: Date, after seconds: TimeInterval) {
    guard upload != nil, now.timeIntervalSince(lastData) > seconds else { return }
    cancel()
  }

  /// Sends text down an event stream.
  func push(_ text: String) {
    guard !closed else { return }
    connection.send(
      content: Data(text.utf8),
      completion: .contentProcessed { [weak self] error in
        if error != nil { self?.close() }
      })
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
    let target = requestLine[1].split(separator: "?", maxSplits: 1)
    let path = String(target.first ?? "/")
    let query = target.count > 1 ? String(target[1]) : ""
    var headers: [String: String] = [:]
    for line in lines {
      guard let colon = line.firstIndex(of: ":") else { continue }
      let name = line[..<colon].trimmingCharacters(in: .whitespaces).lowercased()
      headers[name] = line[line.index(after: colon)...].trimmingCharacters(in: .whitespaces)
    }

    switch (method, path) {
    case ("GET", "/"), ("GET", "/index.html"):
      respond(200, contentType: "text/html; charset=utf-8", body: pageWithState())
    case ("GET", "/events"):
      beginEvents()
    case ("GET", "/ping"):
      respond(200, json: ["ok": true])
    case ("GET", "/uploaded"):
      respond(200, json: ["received": hasFinished(query: query)])
    case ("GET", "/favicon.ico"):
      respond(204, contentType: "text/plain", body: Data())
    case ("POST", "/upload"):
      beginUpload(headers: headers, initial: body)
    default:
      respond(404, json: ["error": "Not found."])
    }
  }

  private func pageWithState() -> Data {
    guard let server else { return Data() }
    return Data(
      server.page.replacingOccurrences(of: TransferServer.stateToken, with: server.live.json).utf8)
  }

  private func hasFinished(query: String) -> Bool {
    guard let server else { return false }
    for pair in query.split(separator: "&") {
      let parts = pair.split(separator: "=", maxSplits: 1)
      if parts.count == 2, parts[0] == "id",
        let id = String(parts[1]).removingPercentEncoding
      {
        return server.finished.contains(id)
      }
    }
    return false
  }

  // MARK: Event stream

  private func beginEvents() {
    guard let server else { return close() }
    let head =
      "HTTP/1.1 200 OK\r\n"
      + "Content-Type: text/event-stream\r\n"
      + "Cache-Control: no-store\r\n"
      + "Connection: keep-alive\r\n\r\n"
    connection.send(
      content: Data(head.utf8),
      completion: .contentProcessed { [weak self] error in
        if error != nil { self?.close() }
      })
    server.addPage(self)
    watchEventStream()
  }

  /// A browser sends nothing on an event stream, so any read ends it.
  private func watchEventStream() {
    connection.receive(minimumIncompleteLength: 1, maximumLength: 1024) {
      [weak self] _, _, complete, error in
      guard let self else { return }
      if complete || error != nil {
        self.close()
      } else {
        self.watchEventStream()
      }
    }
  }

  // MARK: Upload

  private func beginUpload(headers: [String: String], initial: Data) {
    guard let server else { return close() }
    guard server.live.accepting else {
      return refuse(403, json: ["error": "Wi-Fi Transfer is off.", "off": true])
    }
    guard let lengthText = headers["content-length"], let expected = Int64(lengthText),
      expected > 0
    else { return refuse(411, json: ["error": "Send the file with a Content-Length."]) }
    let rawName = headers["x-file-name"].flatMap { $0.removingPercentEncoding } ?? ""
    let name = Self.safeFileName(rawName)
    let fileExtension = (name as NSString).pathExtension.lowercased()
    guard server.allowedExtensions.contains(fileExtension) else {
      return refuse(415, json: ["error": "SYNQ imports MP3, M4A, AAC, FLAC, and WAV files."])
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
        id: id, pageId: headers["x-upload-id"], name: name,
        mimeType: headers["content-type"] ?? "application/octet-stream",
        directory: directory, url: url, handle: handle, expected: expected)
    } catch {
      try? FileManager.default.removeItem(at: directory)
      return refuse(500, json: ["error": "SYNQ couldn't save the file."])
    }
    server.emit(
      "onTransferStart",
      [
        "id": id, "name": name, "size": Double(expected),
        "mimeType": headers["content-type"] ?? "application/octet-stream",
      ])
    receive(initial)
  }

  private func receive(_ data: Data) {
    guard var current = upload else { return }
    if !data.isEmpty {
      lastData = Date()
      let remaining = current.expected - current.received
      let chunk = Int64(data.count) > remaining ? data.prefix(Int(remaining)) : data
      do {
        try current.handle.write(contentsOf: chunk)
      } catch {
        upload = current
        failUpload()
        return refuse(500, json: ["error": "SYNQ couldn't save the file."])
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
    if let pageId = current.pageId { server?.finished.insert(pageId) }
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
    connection.send(
      content: Self.response(status, contentType: contentType, body: body),
      completion: .contentProcessed { [weak self] _ in self?.close() })
  }

  /// Turns an upload away. The browser is still sending its body, and closing
  /// now would reset the connection before it reads the answer, so the rest
  /// is read and dropped for a while first.
  private func refuse(_ status: Int, json: [String: Any]) {
    let body = (try? JSONSerialization.data(withJSONObject: json)) ?? Data("{}".utf8)
    connection.send(
      content: Self.response(status, contentType: "application/json", body: body),
      completion: .contentProcessed { [weak self] _ in self?.drain() })
    server?.queue.asyncAfter(deadline: .now() + Self.drainSeconds) { [weak self] in self?.close() }
  }

  private func drain() {
    connection.receive(minimumIncompleteLength: 1, maximumLength: 1 << 20) {
      [weak self] _, _, complete, error in
      guard let self, !self.closed else { return }
      if complete || error != nil {
        self.close()
      } else {
        self.drain()
      }
    }
  }

  private static func response(_ status: Int, contentType: String, body: Data) -> Data {
    let head =
      "HTTP/1.1 \(status) \(reason(status))\r\n"
      + "Content-Type: \(contentType)\r\n"
      + "Content-Length: \(body.count)\r\n"
      + "Cache-Control: no-store\r\n"
      + "Connection: close\r\n\r\n"
    return Data(head.utf8) + body
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
    case 403: return "Forbidden"
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
