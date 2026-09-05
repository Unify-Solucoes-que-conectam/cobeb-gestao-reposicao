#!/bin/sh
set -eu

js_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

api_url="$(js_escape "${API_URL:-http://localhost:8000}")"
app_mode="$(js_escape "${APP_MODE:-production}")"
reverb_key="$(js_escape "${REVERB_APP_KEY:-}")"
reverb_host="$(js_escape "${REVERB_HOST:-localhost}")"
reverb_port="${REVERB_PORT:-443}"
reverb_scheme="$(js_escape "${REVERB_SCHEME:-https}")"

printf '%s\n' \
  'window.__COBEB_CONFIG__ = {' \
  "  API_URL: \"${api_url}\"," \
  "  APP_MODE: \"${app_mode}\"," \
  "  REVERB_APP_KEY: \"${reverb_key}\"," \
  "  REVERB_HOST: \"${reverb_host}\"," \
  "  REVERB_PORT: ${reverb_port}," \
  "  REVERB_SCHEME: \"${reverb_scheme}\"" \
  '};' > /usr/share/nginx/html/runtime-config.js
