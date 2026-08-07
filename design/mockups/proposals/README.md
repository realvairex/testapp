# Entwürfe zur Entscheidung

Hier liegen **Vorschauen für Änderungen, die noch nicht beschlossen sind**.
Nichts davon ist Teil des Mockups.

## Warum als Skript und nicht als zweite HTML-Datei

Ein Entwurf soll sich anschauen lassen, **ohne** dass der veröffentlichte
Stand sich ändert. Eine kopierte Mockup-Datei wäre der naheliegende Weg,
hat aber drei Nachteile: Sie driftet ab dem ersten Tag vom Original weg,
sie verdoppelt 2600 Zeilen für eine Handvoll Elemente, und sie bleibt
liegen, wenn der Entwurf verworfen wird.

Die Skripte hier blenden ihre Entwürfe stattdessen **zur Laufzeit** in das
echte Mockup ein und fotografieren das Ergebnis. Das Mockup bleibt
unberührt, die Vorschau zeigt den Entwurf trotzdem im echten Zusammenhang,
und wird er verworfen, ist nur eine Datei zu löschen.

## Ausführen

```bash
node design/mockups/proposals/vorschau-entwuerfe.js
```

Die Bilder landen in `design/mockups/tests/out/` (nicht im Git — sie
lassen sich jederzeit neu erzeugen).

## Was gerade offen ist

`vorschau-entwuerfe.js` — angeregt durch ein Referenzbild, das der Nutzer
am 2026-08-07 gezeigt hat:

| Entwurf | Was er ändert |
|---|---|
| **1** | Spaltentitel bekommt ein Aufklapp-Menü: Umbenennen · Farbe ändern · In Gruppe verschieben · Löschen |
| **2a** | Fälligkeit als segmentierte Zeile, **dauerhaft** im Kopf der Aufgabenseite |
| **2b** | Dieselbe Zeile, aber erst nach Klick — ersetzt das heutige fünfzeilige Menü |

**Bekannter Befund, vor der Entscheidung gemessen:** Beide Spielarten von
Entwurf 2 sind **zu breit für den engsten Fall** (drei offene Spalten).
Bei 2a wird der Datums-Chip vom Spaltenrand abgeschnitten, bei 2b vom
Fensterrand. Wer Entwurf 2 umsetzt, muss das mitlösen — entweder über
kantenbewusste Ausrichtung des Menüs oder über kürzere Beschriftungen.
Die Bilder `vorschau-2a-faelligkeit-eng.png` und
`vorschau-2b-faelligkeit-eng.png` zeigen es.

## Nach der Entscheidung

Angenommene Entwürfe werden **richtig ins Mockup gebaut** (samt Prüfskript),
und die Vorschau hier wird gelöscht. Verworfene Entwürfe werden ebenfalls
gelöscht — die Begründung bleibt in `docs/decisions.md`, das ist der Ort
dafür.
