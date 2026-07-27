// OFX 1.x from Brazilian banks is usually ISO-8859-1; OFX 2.x is XML and
// usually UTF-8. Rather than reading the CHARSET/ENCODING header — which banks
// fill in wrong — try UTF-8 strictly and fall back: a latin-1 accent IS an
// invalid UTF-8 sequence, so the throw is the detection. `iso-8859-1` and
// `windows-1252` resolve to the same decoder per the WHATWG Encoding Standard,
// which is why no encoding dependency is needed.
export function decodeOfx(bytes: Uint8Array): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder("windows-1252").decode(bytes);
  }
}
