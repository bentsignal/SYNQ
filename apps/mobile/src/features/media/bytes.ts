/**
 * Byte helpers for the tag readers and writers. Hermes has no
 * `TextDecoder`, so UTF-8 and UTF-16 are coded here.
 */

export function concatBytes(parts: readonly Uint8Array[]) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

export function latin1Bytes(text: string) {
  return Uint8Array.from(text, (char) => char.charCodeAt(0) & 0xff);
}

export function latin1Text(bytes: Uint8Array) {
  let text = "";
  for (const byte of bytes) text += String.fromCharCode(byte);
  return text;
}

export function utf8Bytes(text: string) {
  const out = new Array<number>();
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    if (code < 0x80) out.push(code);
    else if (code < 0x800) out.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    else if (code < 0x10000) {
      out.push(
        0xe0 | (code >> 12),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      );
    } else {
      out.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      );
    }
  }
  return Uint8Array.from(out);
}

/** The code point at `index` and its length in bytes (U+FFFD when malformed). */
function decodeAt(bytes: Uint8Array, index: number) {
  const byte = bytes[index] ?? 0;
  if (byte < 0x80) return { code: byte, length: 1 };
  const length = byte >= 0xf0 ? 4 : byte >= 0xe0 ? 3 : 2;
  if (byte < 0xc0 || index + length > bytes.length) {
    return { code: 0xfffd, length: 1 };
  }
  let code = byte & (0xff >> (length + 1));
  for (let next = 1; next < length; next++) {
    const continuation = bytes[index + next] ?? 0;
    if ((continuation & 0xc0) !== 0x80) return { code: 0xfffd, length: 1 };
    code = (code << 6) | (continuation & 0x3f);
  }
  return { code, length };
}

/** Decodes UTF-8, replacing malformed sequences with U+FFFD. */
export function utf8Text(bytes: Uint8Array) {
  const codes = new Array<number>();
  for (let index = 0; index < bytes.length; ) {
    const { code, length } = decodeAt(bytes, index);
    codes.push(code);
    index += length;
  }
  let text = "";
  for (let start = 0; start < codes.length; start += 4096) {
    text += String.fromCodePoint(...codes.slice(start, start + 4096));
  }
  return text;
}

/** UTF-16 little-endian with a byte order mark (ID3v2.3's Unicode text). */
export function utf16Bytes(text: string) {
  const out = new Uint8Array(2 + text.length * 2);
  out[0] = 0xff;
  out[1] = 0xfe;
  for (let index = 0; index < text.length; index++) {
    const unit = text.charCodeAt(index);
    out[2 + index * 2] = unit & 0xff;
    out[3 + index * 2] = unit >> 8;
  }
  return out;
}

export function uint32BE(value: number) {
  return Uint8Array.of(
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  );
}

export function readUint32BE(bytes: Uint8Array, offset: number) {
  return (
    ((bytes[offset] ?? 0) * 0x1000000 +
      ((bytes[offset + 1] ?? 0) << 16) +
      ((bytes[offset + 2] ?? 0) << 8) +
      (bytes[offset + 3] ?? 0)) >>>
    0
  );
}

export function readUint32LE(bytes: Uint8Array, offset: number) {
  return (
    ((bytes[offset + 3] ?? 0) * 0x1000000 +
      ((bytes[offset + 2] ?? 0) << 16) +
      ((bytes[offset + 1] ?? 0) << 8) +
      (bytes[offset] ?? 0)) >>>
    0
  );
}

export function uint32LE(value: number) {
  return Uint8Array.of(
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff,
  );
}
