/** Start-of-frame markers (SOF0–SOF15), which carry the size: not DHT, JPG, or DAC. */
function isStartOfFrame(marker: number) {
  return (
    marker >= 0xc0 &&
    marker <= 0xcf &&
    marker !== 0xc4 &&
    marker !== 0xc8 &&
    marker !== 0xcc
  );
}

function uint16(bytes: Uint8Array, offset: number) {
  return ((bytes[offset] ?? 0) << 8) + (bytes[offset + 1] ?? 0);
}

/** A JPEG's pixel size from its start-of-frame marker, or null. */
export function jpegSize(bytes: Uint8Array) {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  for (let offset = 2; offset + 9 < bytes.length; ) {
    if (bytes[offset] !== 0xff) return null;
    if (isStartOfFrame(bytes[offset + 1] ?? 0)) {
      return { height: uint16(bytes, offset + 5), width: uint16(bytes, offset + 7) };
    }
    offset += 2 + uint16(bytes, offset + 2);
  }
  return null;
}
