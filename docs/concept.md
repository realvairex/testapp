# Produktkonzept: Unfold

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

### 1. Jede Liste und jede Aufgabe ist eine eigene Seite
- Listen und Aufgaben funktionieren wie eine freie "Word-Seite": Man kann
  überall reinklicken und direkt lostippen (echtes Freitext-Dokument, kein
  starres Formular mit festen Feldern). Aufgaben und Bilder werden an der
  aktuellen Cursor-Position eingefügt (Button oder Drag&Drop fürs Bild)
  und mischen sich frei mit dem Text.
- Geplant, noch nicht umgesetzt: eingebettete Aufgaben/Bilder per Drag frei
  innerhalb der Seite verschieben (wie bei Superlist).
- Die Hauptliste zeigt Unteraufgaben **nicht** inline/verschachtelt an.
  Eine auf der eigenen Seite einer Aufgabe angelegte Unteraufgabe taucht
  nur dort auf, nicht rückwirkend in der übergeordneten Liste.
- Beliebig tief verschachtelbar (Aufgabe einer Aufgabe einer Aufgabe, ...).
- Sobald eine Aufgabe Unteraufgaben hat, erscheint automatisch ein
  Fortschrittsbalken, der den Erledigungsgrad anzeigt.

### 2. Mehrspalten-Drilldown (Miller-Columns)
- Klick auf eine Aufgabe öffnet ihre Seite als neue Spalte direkt daneben.
- Klick auf eine Unteraufgabe darin öffnet wiederum eine weitere Spalte —
  bis zu drei Seiten gleichzeitig sichtbar (ähnlich der
  macOS-Finder-Spaltenansicht).
- Kommt eine vierte Spalte hinzu, rücken ältere Spalten aus dem sichtbaren
  Bereich; über Zurückklicken in eine frühere Spalte lässt sich jederzeit
  neu verzweigen (tiefere Spalten werden dabei ersetzt).

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

- **Akzentfarbe:** warmes, gedämpftes Orange (siehe `decisions.md`).
- **Bewegung:** durchgängig ruhige, gefederte Animationen für alles
  Interaktive (Öffnen/Schließen von Seiten, Löschen, Checkbox-Feedback,
  Theme-Wechsel) — nicht nur punktuelle Effekte, siehe `decisions.md`.

## Out of scope für v1 (bewusst zurückgestellt)

- Sharing/Kollaboration zwischen mehreren Nutzern (geplant für später,
  Datenmodell soll das aber nicht ausschließen — siehe `decisions.md`)
- Große listenübergreifende Gesamtansicht (nur "Heute" ist listenübergreifend)

## Offene Punkte

- Feinschliff des Desktop-Mockups im Dialog mit dem Nutzer (laufend)
- Mobile-Ansicht mocken (noch nicht begonnen)
- Endgültige Bestätigung des Namens "Unfold" (aktuell Arbeitstitel, wurde
  vom Nutzer vorgeschlagen und positiv aufgenommen)
