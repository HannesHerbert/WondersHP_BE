#!/usr/bin/env bash
# Deploy auf netcup Webhosting (Plesk Node.js / Passenger): eine App liefert API, Medien und Frontend aus.
#
#   ./scripts/deploy-netcup.sh            # Code + Frontend
#   ./scripts/deploy-netcup.sh --media    # zusätzlich storage/ (Bilder, Videos, Audio) hochladen
#
# Lädt hoch: src/, app.cjs, package.json, package-lock.json, public/ (gebautes Frontend)
# Fasst auf dem Server nie an: .env*, node_modules/, storage/ (außer mit --media)
# npm install läuft in Plesk ("NPM install"), weil die SSH-Shell kein node hat.
set -euo pipefail

SSH_HOST="${SSH_HOST:-netcup-allflavours}"
APP_DIR="${APP_DIR:-hosting229701.ae8e2.netcup.net}"   # App-Root auf dem Server (relativ zu ~)

BE="$(cd "$(dirname "$0")/.." && pwd)"
FE="$(cd "$BE/../wonders-fe" && pwd)"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

echo "▶ Frontend bauen (API unter derselben Adresse)"
# Geheimcode für die Login-Seite aus der lokalen Entwicklungs-Env übernehmen
LOGIN_CODE="$(grep -E '^VITE_ADMIN_LOGIN_PW=' "$FE/.env.development" | cut -d= -f2- | tr -d '"' || true)"
( cd "$FE" && VITE_API_URL="" VITE_ADMIN_LOGIN_PW="${LOGIN_CODE:-admin}" npx vite build --outDir "$STAGE/public" --emptyOutDir >/dev/null )

echo "▶ Paket schnüren"
cp -r "$BE/src" "$BE/app.cjs" "$BE/package.json" "$BE/package-lock.json" "$STAGE/"

echo "▶ Upload nach $SSH_HOST:~/$APP_DIR"
ssh "$SSH_HOST" "mkdir -p '$APP_DIR/tmp' '$APP_DIR/storage' && rm -rf '$APP_DIR/src' '$APP_DIR/public'"
tar czf - -C "$STAGE" src public app.cjs package.json package-lock.json | ssh "$SSH_HOST" "tar xzf - -C '$APP_DIR'"

if [[ "${1:-}" == "--media" ]]; then
  echo "▶ Medien (storage/) hochladen – überschreibt gleichnamige Dateien, löscht nichts"
  tar czf - -C "$BE" storage | ssh "$SSH_HOST" "tar xzf - -C '$APP_DIR'"
fi

echo "▶ Neustart (Passenger)"
ssh "$SSH_HOST" "touch '$APP_DIR/tmp/restart.txt'"

echo "✔ Fertig. Nach Änderungen an package.json: in Plesk 'NPM install' und App neu starten."
