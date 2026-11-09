#!/bin/bash
# sadece-tasarim :: macOS icin .jsx calistirici (run_jsx.ps1 karsiligi). DENENMEDI: ilk kullanimda dogrula.
# Kullanim: bash run_jsx.sh photoshop|illustrator /yol/proje/_script/build.jsx
set -e
APP="$1"; SRC="$2"
DIR="$(cd "$(dirname "$SRC")" && pwd)"; TMP="$DIR/_ascii_$(basename "$SRC")"
# ASCII disi karakterleri \uXXXX'e cevir (ExtendScript UTF-8'i guvenilir okumaz)
perl -CSD -pe 's/([^\x00-\x7F])/sprintf("\\u%04X", ord($1))/ge' "$SRC" > "$TMP"
if [ "$APP" = "illustrator" ]; then ID="com.adobe.illustrator"; else ID="com.adobe.Photoshop"; fi
osascript -e "tell application id \"$ID\" to activate" \
          -e "tell application id \"$ID\" to do javascript file (POSIX file \"$TMP\")"
rm -f "$TMP"
