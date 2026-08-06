#!/usr/bin/env bash
# Sitzungs-Abschlussprüfung für Unfold.
#
# Prüft mechanisch nach, ob der Chat vollständig ins Repo überführt
# wurde. Wird von /ende aufgerufen, läuft aber auch allein:
#
#   bash scripts/session-check.sh
#
# Rückgabewert 0 = alles gesichert, 1 = mindestens ein Punkt offen.

set -uo pipefail
cd "$(git rev-parse --show-toplevel 2>/dev/null || echo .)" || exit 1

fails=0
warns=0
ok()   { printf '  [ok]      %s\n' "$1"; }
bad()  { printf '  [OFFEN]   %s\n' "$1"; fails=$((fails+1)); }
warn() { printf '  [pruefen] %s\n' "$1"; warns=$((warns+1)); }

echo "=== Abschlusspruefung Unfold - $(date '+%Y-%m-%d %H:%M') ==="
echo

echo "1. Arbeitsverzeichnis"
dirty="$(git status --porcelain)"
if [ -z "$dirty" ]; then
  ok "sauber, nichts uncommittet"
else
  bad "nicht committete Aenderungen:"
  printf '%s\n' "$dirty" | sed 's/^/              /'
fi

echo
echo "2. Branch gepusht"
branch="$(git rev-parse --abbrev-ref HEAD)"
if git rev-parse --verify --quiet "origin/$branch" >/dev/null; then
  ahead="$(git rev-list --count "origin/$branch..HEAD")"
  if [ "$ahead" = "0" ]; then
    ok "$branch ist mit origin gleichauf"
  else
    bad "$branch hat $ahead Commit(s), die nicht gepusht sind"
  fi
else
  bad "$branch existiert nicht auf origin - noch nie gepusht"
fi

echo
echo "3. Uebergabestand aktuell"
if [ ! -f docs/status.md ]; then
  bad "docs/status.md fehlt"
else
  last_status="$(git log -1 --format=%cd --date=short -- docs/status.md 2>/dev/null)"
  last_any="$(git log -1 --format=%cd --date=short 2>/dev/null)"
  if [ "$last_status" = "$last_any" ]; then
    ok "docs/status.md zuletzt am $last_status geaendert - so aktuell wie das Repo"
  else
    warn "docs/status.md ist von $last_status, letzter Commit ist von $last_any"
    warn "  -> gab es seitdem Entscheidungen oder Fortschritt, die dort fehlen?"
  fi
fi

echo
echo "4. Entscheidungsprotokoll"
today="$(date '+%Y-%m-%d')"
if grep -q "$today" docs/decisions.md 2>/dev/null; then
  ok "docs/decisions.md enthaelt einen Eintrag von heute"
else
  warn "docs/decisions.md hat keinen Eintrag von heute ($today)"
  warn "  -> wurde heute wirklich nichts entschieden?"
fi

echo
echo "5. Ungerettete Dateien im Scratchpad"
sp="${CLAUDE_SCRATCHPAD:-}"
if [ -z "$sp" ]; then
  sp="$(ls -d /tmp/claude-*/*/*/scratchpad 2>/dev/null | head -1)"
fi
if [ -n "$sp" ] && [ -d "$sp" ]; then
  # Alles, was wiederverwendbar aussieht: Skripte und Daten, keine Bilder.
  # Dateien, deren Name schon im Repo liegt, sind bereits gerettet.
  known="$(git ls-files | xargs -n1 basename 2>/dev/null | sort -u)"
  keep=""
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    printf '%s\n' "$known" | grep -qxF "$(basename "$f")" && continue
    keep="${keep}${f}"$'\n'
  done <<< "$(find "$sp" -maxdepth 1 -type f \( -name '*.js' -o -name '*.sh' -o -name '*.json' -o -name '*.md' \) 2>/dev/null | sort)"
  keep="$(printf '%s' "$keep" | sed '/^$/d')"
  if [ -z "$keep" ]; then
    ok "nichts Wiederverwendbares offen (alles Uebrige ist schon im Repo)"
  else
    n="$(printf '%s\n' "$keep" | wc -l | tr -d ' ')"
    warn "$n Datei(en) liegen nur im Scratchpad und gehen verloren:"
    printf '%s\n' "$keep" | head -15 | xargs -n1 basename 2>/dev/null | sed 's/^/              /'
    [ "$n" -gt 15 ] && printf '              ... und %s weitere\n' "$((n-15))"
    warn "  -> pruefen, ob davon etwas ins Repo gehoert (Pfad: $sp)"
  fi
else
  ok "kein Scratchpad-Verzeichnis gefunden"
fi

echo
echo "6. Sitzungsprotokoll"
if [ -f docs/session-log.md ] && grep -q "^## $today" docs/session-log.md; then
  ok "docs/session-log.md hat einen Eintrag von heute"
else
  bad "docs/session-log.md hat keinen Eintrag von heute ($today)"
fi

echo
echo "=== Ergebnis ==="
if [ "$fails" -eq 0 ] && [ "$warns" -eq 0 ]; then
  echo "Alles gesichert. Die naechste Session kann ohne diesen Chat weiterarbeiten."
  exit 0
elif [ "$fails" -eq 0 ]; then
  echo "Nichts blockiert - aber $warns Punkt(e) wollen angeschaut werden (siehe [pruefen])."
  exit 0
else
  echo "$fails Punkt(e) OFFEN, $warns zum Pruefen. Erst erledigen, dann den Chat verlassen."
  exit 1
fi
