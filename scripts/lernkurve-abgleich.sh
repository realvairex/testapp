#!/usr/bin/env bash
# Gleicht docs/lernkurve.md gegen den vorhandenen Bestand ab.
#
# WARUM ES DIESES SKRIPT GIBT
#
# Beim Anlegen der Lernkurve habe ich die Fehler gesammelt, die im
# laufenden Gespräch vorkamen — nicht die, die im Repo standen. Muster 7
# („der Nutzer sieht einen anderen Stand als das Repo") fehlte deshalb,
# obwohl es seit Tagen in status.md §6 dokumentiert war. Der Nutzer fragte:
# *„Wie kann es sein, dass du jedes Mal etwas übersiehst?"*
#
# Die ehrliche Antwort: weil ich aus dem Arbeitsgedächtnis gesammelt habe
# statt aus der Quelle. Das ist derselbe Fehler wie „eine Zusammenfassung
# ist keine Quelle" (CLAUDE.md, Regel 5) — nur nach innen gerichtet.
#
# Gegen so etwas hilft kein Vorsatz, sondern eine Liste zum Abarbeiten.
# Dieses Skript erzeugt sie: Es zieht jedes Datum, an dem im Protokoll ein
# Fehler festgehalten wurde, und zeigt, ob die Lernkurve dieses Datum kennt.
#
# Es entscheidet NICHT, ob etwas ein Muster ist — das bleibt Urteilssache.
# Es sorgt nur dafür, dass nichts unbesehen durchrutscht.
#
# Aufruf:  bash scripts/lernkurve-abgleich.sh
# Läuft mit in:  ende unfold (Schritt 5)

cd "$(dirname "$0")/.." || exit 1

if [ ! -f docs/lernkurve.md ]; then
  echo "docs/lernkurve.md fehlt - nichts abzugleichen."
  exit 0
fi

echo "=== Abgleich: Bestand gegen docs/lernkurve.md ==="
echo

# --- Kandidaten aus dem Entscheidungsprotokoll -------------------------
# Überschriften, die von einem Fehler, einer Korrektur oder einer Lehre
# handeln. Bewusst weit gefasst - lieber ein Kandidat zu viel auf der
# Liste als einer, den niemand ansieht.
offen=0
echo "-- Fehler-Einträge in docs/decisions.md --"
grep -n '^## ' docs/decisions.md \
  | grep -iE 'fehler|lehre|messung|nicht |korrektur|uebersehen|übersehen|falsch|behoben|Nachtrag' \
  | while IFS= read -r zeile; do
      datum=$(echo "$zeile" | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}' | head -1)
      voll=$(echo "$zeile" | sed 's/^[0-9]*:## //')
      titel=$(echo "$voll" | cut -c1-72)
      # Bewusst als "gehoert nicht in die Lernkurve" entschieden? Dann nicht
      # jedes Mal erneut fragen. Ohne das meldete der Abgleich vier
      # Eintraege bei jedem Lauf - darunter zwei, die gar keine Fehler sind.
      ign="scripts/lernkurve-ignore.txt"
      uebergehen=0
      if [ -f "$ign" ]; then
        while IFS= read -r muster; do
          case "$muster" in ''|'#'*) continue;; esac
          case "$voll" in *"$muster"*) uebergehen=1; break;; esac
        done < "$ign"
      fi
      if [ "$uebergehen" = "1" ]; then
        printf "  [bewusst] %s\n" "$titel"
      elif [ -z "$datum" ]; then
        printf "  [?]      %s\n" "$titel"
      elif grep -q "$datum" docs/lernkurve.md; then
        printf "  [erfasst] %s\n" "$titel"
      else
        printf "  [OFFEN]   %s\n" "$titel"
      fi
    done

echo
echo "-- Stellen im Uebergabestand, die ein Muster enthalten KOENNTEN --"
# BEWUSST OHNE URTEIL. Die erste Fassung versuchte zu entscheiden, ob ein
# Fallstrick schon erfasst ist - ueber ein Suchwort aus der Zeile. Das ging
# schief: "Fallstrick" kommt in beiden Dateien vor, also meldete das Skript
# [erfasst] fuer genau das Muster, das FEHLTE (der veraltete Artifact-Stand).
#
# Ein Werkzeug, das faelschlich "alles gut" sagt, ist schlimmer als eines,
# das nur auflistet - weil man sich darauf verlaesst. Ob ein Eintrag ein
# Muster ist, entscheidet das Lesen, nicht ein grep.
grep -nE '⚠️|Fallstrick|Zeit gekostet|geräuschlos|unbemerkt|nicht erneut|noch einmal' docs/status.md \
  | while IFS= read -r zeile; do
      nr=${zeile%%:*}
      txt=$(echo "$zeile" | sed 's/^[0-9]*://; s/^[[:space:]]*//' | cut -c1-66)
      printf "  status.md:%-4s %s\n" "$nr" "$txt"
    done

echo
echo "Lesart:"
echo "  [OFFEN] bei decisions.md = das Datum kommt in lernkurve.md nicht vor."
echo "          Das ist ein harter Abgleich und darf man glauben."
echo "  Die status.md-Liste traegt ABSICHTLICH kein Urteil - sie ist die"
echo "          Liste zum Durchgehen, mehr nicht."
echo
echo "Ein Vorfall gehoert erst in die Lernkurve, wenn er ZUM ZWEITEN MAL"
echo "auftrat. Einmal ist ein Vorfall und gehoert nach decisions.md."
