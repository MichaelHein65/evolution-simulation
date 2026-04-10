#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:${PATH:-}"

APP_HOST="${EVOLUTION_APP_HOST:-127.0.0.1}"
APP_PORT="${EVOLUTION_APP_PORT:-3001}"
FRONTEND_URL="http://${APP_HOST}:${APP_PORT}"
BROWSER_URL="${FRONTEND_URL}/?launcher_ts=$(date +%s)"
BACKEND_HEALTH_URL="${FRONTEND_URL}/api/health"
LOG_FILE="${SCRIPT_DIR}/.evolution-launch.log"
DIST_INDEX_FILE="${SCRIPT_DIR}/dist/index.html"
NPM_BIN=""

resolve_binary() {
  local candidate
  for candidate in "$@"; do
    if [ -n "$candidate" ] && [ -x "$candidate" ]; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done

  return 1
}

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

project_listener_pid_for_port() {
  local port="$1"
  local pid
  local cwd

  while IFS= read -r pid; do
    [ -n "$pid" ] || continue
    cwd="$(lsof -a -p "$pid" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p' | head -n 1)"
    if [ "$cwd" = "$SCRIPT_DIR" ]; then
      printf '%s\n' "$pid"
      return 0
    fi
  done < <(lsof -ti TCP:"$port" -sTCP:LISTEN 2>/dev/null || true)

  return 1
}

stop_project_listener_for_port() {
  local port="$1"
  local pid

  if pid="$(project_listener_pid_for_port "$port")"; then
    kill "$pid" >/dev/null 2>&1 || true
    sleep 1
  fi
}

resolve_npm() {
  if command -v npm >/dev/null 2>&1; then
    command -v npm
    return 0
  fi

  resolve_binary \
    "/usr/local/bin/npm" \
    "/opt/homebrew/bin/npm" \
    "/opt/local/bin/npm"
}

open_browser_fullscreen() {
  if command -v osascript >/dev/null 2>&1; then
    /usr/bin/osascript <<OSA >/dev/null 2>&1 || true
set appUrl to "${BROWSER_URL}"
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
    open "$BROWSER_URL"
  fi
}

if ! NPM_BIN="$(resolve_npm)"; then
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

if [ ! -f "${DIST_INDEX_FILE}" ]; then
  notify_error "dist/index.html fehlt. Bitte die App zuerst bauen."
  exit 1
fi

touch "$LOG_FILE"

if ! curl -fsS "$FRONTEND_URL" >/dev/null 2>&1; then
  stop_project_listener_for_port "$APP_PORT"
  nohup "$NPM_BIN" run serve:prod >>"$LOG_FILE" 2>&1 &

  if ! wait_for_url "$FRONTEND_URL" 80 0.25; then
    notify_error "Die Evolution-App ist nicht gestartet. Details stehen in .evolution-launch.log."
    exit 1
  fi
fi

if ! wait_for_url "$BACKEND_HEALTH_URL" 40 0.25; then
  notify_error "Evolution wurde geöffnet, aber der Server auf Port ${APP_PORT} antwortet nicht korrekt. Details stehen in .evolution-launch.log."
  exit 1
fi

open_browser_fullscreen
