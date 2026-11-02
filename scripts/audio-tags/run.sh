#!/usr/bin/env bash
# The full cross-tool audio tag check. See scripts/audio-tags/README.md.
set -euo pipefail
root="$(git rev-parse --show-toplevel)"
here="$root/scripts/audio-tags"
work="$root/.cache/audio-tags"
mkdir -p "$work"
if [ ! -x "$work/venv/bin/python" ]; then
  python3 -m venv "$work/venv"
  "$work/venv/bin/pip" -q install mutagen
fi
rm -rf "$work/corpus" "$work/out"
python3 "$here/make-corpus.py" "$work/corpus"
cat > "$work/expected.json" <<'JSON'
{"title":"Señorita 🎵 東京 مرحبا","artists":["Shawn Mendes","Camila Cabello"],"artist":"Shawn Mendes, Camila Cabello","albumArtist":"Various Artists","album":"Romance ✨","year":2021,"track":3}
JSON
node --disable-warning=ExperimentalWarning "$here/export-corpus.ts" "$work/corpus" "$work/out" "$work/expected.json"
"$work/venv/bin/python" "$here/verify.py" "$work/corpus" "$work/out" "$work/expected.json"
"$here/verify-apple.sh" "$work/corpus" "$work/out" "$work/build"
