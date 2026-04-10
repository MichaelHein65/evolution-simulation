#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

FRONTEND_HOST="${EVOLUTION_FRONTEND_HOST:-127.0.0.1}"
FRONTEND_PORT="${EVOLUTION_FRONTEND_PORT:-5173}"
BACKEND_PORT="${EVOLUTION_BACKEND_PORT:-3001}"
FRONTEND_URL="http://${FRONTEND_HOST}:${FRONTEND_PORT}"
BACKEND_HEALTH_URL="http://127.0.0.1:${BACKEND_PORT}/api/health"
LOG_FILE="${SCRIPT_DIR}/.evolution-launch.log"

notify_error() {
  local message="${1//\"/\\\"}"
  if command -v osascript >/dev/null 2>&1; then
    /usr/bin/osascript <<OSA >/dev/null 2>&1 || true
display alert "Evolution" message "${message}" as critical
OSA
  fi
}

wait_for_url() {
  local url="$1"
  local attempts="$2"
  local delay_seconds="$3"
  local i

  for ((i = 0; i < attempts; i += 1)); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep "$delay_seconds"
  done

  return 1
}

open_browser_fullscreen() {
  if command -v osascript >/dev/null 2>&1; then
    /usr/bin/osascript <<OSA >/dev/null 2>&1 || true
set appUrl to "${FRONTEND_URL}"
tell application "Safari"
  activate
  make new document with properties {URL:appUrl}
end tell
delay 1.8
tell application "System Events"
  tell process "Safari"
    set frontmost to true
  end tell
  keystroke "f" using {command down, control down}
end tell
OSA
  elif command -v open >/dev/null 2>&1; then
    open "$FRONTEND_URL"
  fi
}

if ! command -v npm >/dev/null 2>&1; then
  notify_error "npm wurde nicht gefunden. Evolution kann nicht gestartet werden."
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  notify_error "curl wurde nicht gefunden. Evolution kann nicht gestartet werden."
  exit 1
fi

if [ ! -d "${SCRIPT_DIR}/node_modules" ]; then
  notify_error "node_modules fehlt. Bitte zuerst npm install in 20251108_Evolution ausführen."
  exit 1
fi

touch "$LOG_FILE"

if ! curl -fsS "$BACKEND_HEALTH_URL" >/dev/null 2>&1; then
  nohup npm run server >>"$LOG_FILE" 2>&1 &
fi

if ! curl -fsS "$FRONTEND_URL" >/dev/null 2>&1; then
  nohup npm run dev -- --host "$FRONTEND_HOST" --port "$FRONTEND_PORT" >>"$LOG_FILE" 2>&1 &
fi

if ! wait_for_url "$FRONTEND_URL" 80 0.25; then
  notify_error "Das Evolution-Frontend ist nicht gestartet. Details stehen in .evolution-launch.log."
  exit 1
fi

if ! wait_for_url "$BACKEND_HEALTH_URL" 40 0.25; then
  notify_error "Evolution wurde geöffnet, aber der AI-Server auf Port 3001 antwortet nicht. Details stehen in .evolution-launch.log."
fi

open_browser_fullscreen
