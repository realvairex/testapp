# Projekt: Todo App (Arbeitstitel)

Dieses Dokument wird von Claude Code automatisch bei jeder Session gelesen.
Es ist der Einstiegspunkt in den Projektkontext — halte es aktuell.

## Arbeitsweise / Doku-Pflicht

Für dieses Projekt gilt durchgängig:

- **Jede wesentliche Entscheidung** (Tech-Stack, Architektur, Feature-Scope,
  Datenmodell, Design-Richtung) wird in `docs/decisions.md` protokolliert —
  mit Kontext, abgewogenen Optionen und Begründung, nicht nur dem Ergebnis.
- **Die Produktvision und Feature-Liste** lebt in `docs/concept.md` und wird
  aktuell gehalten, wenn sich der Scope ändert.
- **Commits** bekommen aussagekräftige, nachvollziehbare Messages.
- Alles, was über den aktuellen Chat hinaus Bestand haben soll, muss ins
  Repo committed werden — die Session-Umgebung ist temporär.
- Ziel: Jede Entscheidung und jeder Arbeitsschritt soll im Nachhinein aus
  dem Repo (Docs + Git-Historie) nachvollziehbar sein, auch ohne Zugriff auf
  den ursprünglichen Chat.

## Status

Projekt befindet sich in der Brainstorming-/Konzeptphase. Noch kein Code
geschrieben. Siehe `docs/concept.md` für den aktuellen Stand und
`docs/decisions.md` für die bisherige Entscheidungshistorie.

## Tech-Stack

Noch nicht final festgelegt. Vorschlag in Diskussion: React/TypeScript als
Basis, verpackt als Desktop-App (Electron oder Tauri), später Web (gleicher
Code im Browser) und Mobile (PWA oder React Native). Siehe
`docs/decisions.md` für den Stand der Diskussion.

## Doku-Struktur

- `CLAUDE.md` — dieser Datei: Projektüberblick, Konventionen (dieses Dokument)
- `docs/concept.md` — Produktvision, Inspiration, Feature-Liste, Design-Richtung
- `docs/decisions.md` — laufendes Entscheidungsprotokoll
