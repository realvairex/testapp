# Produktkonzept: Todo App

Stand: 2026-08-05 (Brainstorming-Phase, wird laufend aktualisiert)

## Inspiration

- **[Superlist](https://www.superlist.com/)** — Haupt-Inspirationsquelle.
  Bevorzugte App des Nutzers bisher. Übernommen werden soll vor allem die
  *Funktionsweise*, nicht zwingend der volle Funktionsumfang.
- **[Xdo](https://apps.apple.com/de/app/xdo-die-todo-app/id6778055794)** —
  Zweite Inspirationsquelle für den minimalistischen Gegenpol: "weniger
  Rauschen statt mehr Produktivität". Quick-Capture-Prinzip.

Kernidee: Die Funktionstiefe von Superlist, aber mit der Reduziertheit von
Xdo — viele Todo-Apps sind für das, was sie eigentlich sein sollten, zu
kompliziert und überladen.

## Zielgruppe / erster Nutzungskontext

- v1: Solo-App für den Eigengebrauch.
- Langfristig geplant (nicht v1): Listen mit anderen Personen teilen und
  gemeinsam bearbeiten. Siehe `decisions.md` zur Frage, wie das Datenmodell
  darauf vorbereitet wird, ohne es in v1 bereits umzusetzen.

## Kernfunktionen (v1)

### 1. Unendlich verschachtelte Aufgaben
Jede Aufgabe ist im Grunde eine eigene Mini-Seite/Liste:
- Kann Notizen, Bilder/Anhänge und wiederum Unteraufgaben enthalten.
- Beliebig tief verschachtelbar (Unteraufgabe einer Unteraufgabe einer
  Unteraufgabe, ...).
- Sobald eine Aufgabe Unteraufgaben hat, erscheint automatisch ein
  Fortschrittsbalken, der den Erledigungsgrad anzeigt.

### 2. Slide-in-Detailpanel
- Öffnet sich beim Klick/Wisch auf eine Aufgabe.
- Desktop: Panel erscheint seitlich (Side-Panel).
- Mobile: Wisch-Geste (rechts nach links) oder Pfeil-Icon öffnet die
  Detailansicht.
- Zeigt die volle Detail-/Unteraufgaben-Ansicht der jeweiligen Aufgabe.

### 3. Quick Capture (Kernprinzip, hohe Priorität)
- Neue Aufgabe muss in unter einer Sekunde erfassbar sein.
- Keine Dialoge/Zwischenschritte, die im Weg stehen.
- Details (Tags, Fälligkeitsdatum, etc.) sollen nachträglich leicht
  ergänzbar sein, ohne die Schnellerfassung zu verlangsamen.

### 4. Fälligkeitsdaten + "Heute"-Seite
- Aufgaben können ein optionales Fälligkeitsdatum bekommen.
- Eigene "Heute"-Seite bündelt alle Aufgaben mit heutigem Fälligkeitsdatum,
  listenübergreifend.
- Ansonsten bleiben Listen als separate, eigenständige Einheiten bestehen
  (keine große vereinheitlichte Gesamtliste außerhalb von "Heute").

## Design-Richtung

Mix aus Minimalismus und gezielter Verspieltheit — "knackiges",
Apple-inspiriertes Design. Nicht so reduziert/nüchtern wie Xdo, aber auch
nicht so bunt/verspielt wie Superlist in Reinform. Qualitätsanspruch:
Apple Reminders/Notes-Niveau, mit eigenständigem Charakter.

## Out of scope für v1 (bewusst zurückgestellt)

- Sharing/Kollaboration zwischen mehreren Nutzern (geplant für später,
  Datenmodell soll das aber nicht ausschließen — siehe `decisions.md`)
- Große listenübergreifende Gesamtansicht (nur "Heute" ist listenübergreifend)

## Offene Punkte

- Konkrete Akzentfarbe(n) / Farbpalette
- Finaler App-Name (aktuell Arbeitstitel "Todo App")
- Visueller Mockup zur Validierung der Design-Richtung (nächster Schritt)
