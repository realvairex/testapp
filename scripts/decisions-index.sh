#!/usr/bin/env bash
# Schreibt das Verzeichnis am Kopf von docs/decisions.md neu.
#
#   bash scripts/decisions-index.sh          # Verzeichnis erneuern
#   bash scripts/decisions-index.sh --pruefen # nur melden, ob es veraltet ist
#
# Warum es das gibt: docs/decisions.md ist auf 79 Eintraege und rund
# 3.900 Zeilen gewachsen. Wer nachschlagen will, WARUM etwas entschieden
# wurde, hatte bis 2026-08-13 keinen Weg dorthin ausser Suchen - oder im
# schlimmsten Fall die ganze Datei zu lesen. Das Verzeichnis macht
# gezieltes Nachschlagen moeglich, ohne dass ein einziges Zeichen aus dem
# Protokoll entfernt wird.
#
# Es wird erzeugt, nicht gepflegt: Von Hand nachgetragene Zeilen gehen
# beim naechsten Lauf verloren. Die Wahrheit sind die Ueberschriften.

set -uo pipefail
cd "$(git rev-parse --show-toplevel 2>/dev/null || echo .)" || exit 1

datei="docs/decisions.md"
start="<!-- VERZEICHNIS:ANFANG - erzeugt von scripts/decisions-index.sh, nicht von Hand aendern -->"
ende="<!-- VERZEICHNIS:ENDE -->"

[ -f "$datei" ] || { echo "FEHLER: $datei nicht gefunden"; exit 1; }

nur_pruefen=0
[ "${1:-}" = "--pruefen" ] && nur_pruefen=1

# Verzeichnis aus den Ueberschriften bauen. Die Zeilennummer zeigt auf die
# Fassung OHNE Verzeichnis - sonst verschoebe sich jede Angabe um die
# Laenge des Verzeichnisses selbst, und zwar bei jedem Lauf anders.
# Entfernen ist exakt die Umkehrung des Schreibens: Der Block traegt seine
# Leerzeilen INNERHALB der Marken, deshalb genuegt "alles zwischen den
# Marken weg" - und die Datei ist wieder Byte fuer Byte die alte.
#
# Der erste Bauversuch setzte die Leerzeilen ausserhalb und versuchte, sie
# beim Entfernen zu erraten. Ergebnis: Die Datei wuchs bei jedem Lauf um
# eine Leerzeile, alle Zeilennummern im Verzeichnis verschoben sich, und
# --pruefen meldete direkt nach einem Lauf "veraltet".
ohne_verzeichnis="$(mktemp)"
awk -v s="$start" -v e="$ende" '
  $0 == s { drin=1; next }
  drin && $0 == e { drin=0; next }
  drin { next }
  { print }
' "$datei" > "$ohne_verzeichnis"

neu="$(mktemp)"
{
  echo "$start"
  echo
  echo "## Verzeichnis"
  echo
  echo "Erzeugt von \`scripts/decisions-index.sh\`. Die Zeilennummern"
  echo "beziehen sich auf diese Datei **ohne** das Verzeichnis - beim"
  echo "Nachschlagen also grob anspringen, nicht blind zaehlen."
  echo
  echo "| Zeile | Datum | Thema |"
  echo "|---|---|---|"
  grep -n '^## ' "$ohne_verzeichnis" \
    | grep -v '^[0-9]*:## Verzeichnis$' \
    | while IFS= read -r zeile; do
        nr="${zeile%%:*}"
        text="${zeile#*:## }"
        # "2026-08-13 — Thema" in Datum und Thema trennen. Der Gedankenstrich
        # ist in dieser Datei durchgaengig ein Halbgeviert (—); faellt die
        # Trennung aus, steht alles in der Themenspalte statt zu fehlen.
        case "$text" in
          *" — "*) datum="${text%% — *}"; thema="${text#* — }" ;;
          *)       datum="";             thema="$text" ;;
        esac
        printf '| %s | %s | %s |\n' "$nr" "$datum" "$thema"
      done
  echo
  echo "$ende"
} > "$neu"

ergebnis="$(mktemp)"
{
  # Kopfzeilen bis zum ersten Trennstrich unveraendert uebernehmen, dann
  # den Block (der seine Leerzeilen selbst mitbringt), dann den Rest
  # unveraendert - er beginnt ohnehin mit einer Leerzeile.
  awk 'NR==1,/^---$/' "$ohne_verzeichnis"
  cat "$neu"
  awk 'f{print} /^---$/{f=1}' "$ohne_verzeichnis"
} > "$ergebnis"

if [ "$nur_pruefen" -eq 1 ]; then
  if cmp -s "$ergebnis" "$datei"; then
    echo "[ok]      Verzeichnis in $datei ist aktuell"
    rm -f "$ohne_verzeichnis" "$neu" "$ergebnis"; exit 0
  fi
  echo "[pruefen] Verzeichnis in $datei ist veraltet"
  echo "            -> bash scripts/decisions-index.sh"
  rm -f "$ohne_verzeichnis" "$neu" "$ergebnis"; exit 1
fi

anzahl="$(grep -c '^| [0-9]' "$neu" || true)"
mv "$ergebnis" "$datei"
rm -f "$ohne_verzeichnis" "$neu"
echo "Verzeichnis erneuert: $anzahl Eintraege in $datei"
