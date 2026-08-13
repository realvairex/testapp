#!/usr/bin/env bash
# Laesst alle Pruefskripte zum Mockup laufen und faellt ein Urteil.
#
#   bash scripts/run-mockup-tests.sh          # alle
#   bash scripts/run-mockup-tests.sh test_fmt # nur passende
#   bash scripts/run-mockup-tests.sh --neu    # messen, auch wenn unveraendert
#
# Warum es dieses Skript gibt: In docs/status.md stand "alle 40 laufen
# gruen" - eine geerbte Behauptung, die niemand nachpruefen konnte, ohne
# 40 Aufrufe von Hand abzusetzen und ihre Ausgaben zu lesen. Eine
# Zusicherung, die zu teuer im Nachpruefen ist, wird nicht nachgeprueft.
#
# Urteil pro Skript:
#   - Rueckgabewert != 0            -> FEHLER  (Absturz)
#   - eine ">>>"-Zeile endet auf false -> ROT  (Zusicherung verletzt)
#   - sonst                         -> ok
#
# Die reinen Messskripte (measure_*, verify_*) haben keine ">>>"-Zeilen.
# Sie gelten als bestanden, wenn sie ohne Absturz durchlaufen - ihre
# Zahlen beurteilt ein Mensch.
#
# Rueckgabewert 0 = alles gruen, 1 = mindestens ein Skript rot.

set -uo pipefail
cd "$(git rev-parse --show-toplevel 2>/dev/null || echo .)" || exit 1

# Die Skripte loesen den Pfad zum Mockup ueber process.cwd() auf und
# muessen deshalb aus dem Wurzelverzeichnis laufen. Playwright liegt in
# dieser Umgebung global - siehe design/mockups/tests/README.md.
export NODE_PATH="${NODE_PATH:-$(npm root -g 2>/dev/null)}"

filter="${1:-}"
erzwingen=0
[ "$filter" = "--neu" ] && { erzwingen=1; filter=""; }
outdir="design/mockups/tests/out"
mkdir -p "$outdir"

pw_version="$(node -e 'try{console.log(require("playwright/package.json").version)}catch(e){console.log("unbekannt")}' 2>/dev/null)"
echo "=== Mockup-Pruefung - $(date '+%Y-%m-%d %H:%M') ==="
echo "Playwright: $pw_version   (erwartet: siehe design/mockups/tests/README.md)"
echo

# --- Gedaechtnis: schon gemessen? -------------------------------------
#
# Der Lauf dauert rund acht Minuten. Am 2026-08-13 lief er zweimal ueber
# denselben unveraenderten Stand - acht verschenkte Minuten. Der Vorsatz
# "nicht zweimal messen" ist genau die Sorte Regel, die laut
# docs/lernkurve.md nicht traegt; deshalb steht hier Mechanik.
#
# Die Signatur deckt alles ab, was das Ergebnis beeinflussen kann: das
# Mockup, jedes mitlaufende Skript und die Playwright-Version. Aendert
# sich irgendetwas davon, faellt die Signatur anders aus und es wird
# gemessen. Der Merkzettel liegt in out/ und ist nicht eingecheckt - ein
# frischer Klon oder Container misst also immer.
#
# Nur vollstaendige Laeufe werden gemerkt: Ein gefilterter Lauf sagt
# nichts ueber die uebrigen Skripte aus.
merkzettel="$outdir/.letzter-lauf"
signatur="$( { cat design/mockups/v1-desktop.html \
                   design/mockups/tests/test_*.js \
                   design/mockups/tests/measure_*.js \
                   design/mockups/tests/verify_*.js 2>/dev/null
               echo "$pw_version"; } | sha256sum | cut -d' ' -f1)"

if [ -z "$filter" ] && [ "$erzwingen" -eq 0 ] && [ -f "$merkzettel" ]; then
  # shellcheck disable=SC1090
  . "$merkzettel"
  if [ "${LAUF_SIGNATUR:-}" = "$signatur" ]; then
    echo "=== Ergebnis (nicht neu gemessen) ==="
    echo "Stand unveraendert seit dem Lauf vom ${LAUF_DATUM:-?}."
    echo "gruen: ${LAUF_GRUEN:-?}   rot: ${LAUF_ROT:-?}   abgestuerzt: ${LAUF_ABSTURZ:-?}"
    [ -n "${LAUF_BETROFFEN:-}" ] && echo "Betroffen:${LAUF_BETROFFEN}"
    echo
    echo "Weder Mockup noch Pruefskripte noch die Playwright-Version haben"
    echo "sich geaendert."
    echo
    echo "ACHTUNG - was das heisst und was nicht: Gemerkt ist, dass DERSELBE"
    echo "CODE gemessen wurde. Nicht, dass ein neuer Lauf dasselbe ergaebe."
    echo "Bei einem wackelnden Skript friert das Gedaechtnis eine Stichprobe"
    echo "ein: test_4bugs traf am 2026-08-13 bei identischer Signatur einmal"
    echo "56/1 und einmal 57/0 (siehe docs/status.md, Abschnitt 4)."
    echo "Vor einem Meilenstein oder einer Freigabe deshalb:"
    echo "  bash scripts/run-mockup-tests.sh --neu"
    exit "${LAUF_RC:-0}"
  fi
fi

green=0; red=0; crash=0
red_names=""

# Nur Skripte, die etwas PRUEFEN oder MESSEN - erkennbar am Namen. Vorher
# stand hier *.js, und damit lief jede Hilfsdatei im Verzeichnis mit: ein
# Skript zum Erzeugen von Entwurfs-Screenshots etwa, dessen DOM-Annahmen
# nach der naechsten Aenderung nicht mehr stimmen, meldete sich hier als
# "Absturz" - obwohl am Mockup nichts kaputt war. Wer ein Werkzeug ins
# Verzeichnis legt, das nicht mitlaufen soll, nennt es anders (z.B. shot_).
for f in design/mockups/tests/test_*.js \
         design/mockups/tests/measure_*.js \
         design/mockups/tests/verify_*.js; do
  [ -e "$f" ] || continue
  name="$(basename "$f" .js)"
  [ -n "$filter" ] && case "$name" in *"$filter"*) ;; *) continue;; esac

  log="$outdir/$name.log"
  # Grosszuegig: die Fuzz-Skripte spielen hunderte Drag-Kombinationen
  # durch und brauchen mehrere Minuten. Eine zu knappe Grenze meldet
  # einen "Absturz", wo nur die Uhr abgelaufen ist - genau so wurde
  # test_fuzz_all am 2026-08-07 faelschlich als kaputt gemeldet.
  if ! timeout "${MOCKUP_TEST_TIMEOUT:-600}" node "$f" >"$log" 2>&1; then
    crash=$((crash+1)); red_names="$red_names $name"
    printf '  [FEHLER] %-28s Absturz oder Zeitueberschreitung\n' "$name"
    sed 's/^/             /' "$log" | tail -3
    continue
  fi

  # Nur ">>>"-Zeilen sind Zusicherungen. Alles andere sind Messwerte.
  #
  # Der Wert steht am Zeilenende, oft gefolgt von einem JSON-Anhang mit
  # Messwerten. Nach 'false' irgendwo in der Zeile zu suchen waere falsch:
  #   >>> click inserts there, not at end: true {"idx":0,"atEnd":false}
  # ist gruen, enthaelt aber 'false'. Deshalb erst den Anhang abschneiden
  # ([ oder {), dann auf ': false' am Zeilenende pruefen. Ein Waechter,
  # der falschen Alarm schlaegt, wird nach zwei Tagen ignoriert.
  bad="$(grep '>>>' "$log" 2>/dev/null | sed 's/[[{].*$//' \
         | grep -cE ':[[:space:]]*false[[:space:]]*$' || true)"
  total="$(grep -c '>>>' "$log" 2>/dev/null || true)"
  if [ "${bad:-0}" -gt 0 ]; then
    red=$((red+1)); red_names="$red_names $name"
    printf '  [ROT]    %-28s %s von %s Zusicherung(en) verletzt\n' "$name" "$bad" "$total"
    grep '>>>' "$log" | grep 'false' | sed 's/^/             /'
  elif [ "${total:-0}" -gt 0 ]; then
    green=$((green+1))
    printf '  [ok]     %-28s %s Zusicherung(en)\n' "$name" "$total"
  else
    green=$((green+1))
    printf '  [ok]     %-28s Messskript, ohne Absturz durchgelaufen\n' "$name"
  fi
done

echo
echo "=== Ergebnis ==="
echo "gruen: $green   rot: $red   abgestuerzt: $crash"

rc=0
[ "$red" -eq 0 ] && [ "$crash" -eq 0 ] || rc=1

# Nur vollstaendige Laeufe merken - ein gefilterter Lauf sagt nichts
# ueber die uebrigen Skripte aus.
if [ -z "$filter" ]; then
  {
    echo "LAUF_SIGNATUR=$signatur"
    echo "LAUF_DATUM='$(date '+%Y-%m-%d %H:%M')'"
    echo "LAUF_GRUEN=$green"
    echo "LAUF_ROT=$red"
    echo "LAUF_ABSTURZ=$crash"
    echo "LAUF_BETROFFEN='$red_names'"
    echo "LAUF_RC=$rc"
  } > "$merkzettel"
fi

if [ "$rc" -eq 0 ]; then
  echo "Alle Pruefskripte bestanden (Playwright $pw_version)."
  echo "Vollstaendige Ausgaben: $outdir/"
  exit 0
fi
echo "Betroffen:$red_names"
echo "Vollstaendige Ausgaben: $outdir/"
exit 1
