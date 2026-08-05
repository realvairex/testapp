# Projekt: Unfold (Todo App)

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
- Dies gilt automatisch, ohne dass der Nutzer danach fragen oder es
  einfordern muss.

## Entwicklungs-Konventionen

- **Backup:** Regelmäßig committen und pushen (kleine, häufige Commits statt
  eines großen am Ende) — GitHub ist der einzige dauerhafte Speicher, der
  Session-Container ist temporär.
- **CI:** Sobald eine lauffähige Codebasis existiert, GitHub-Actions-Pipeline
  einrichten, die bei jedem Push Linting, Type-Checking und Tests laufen
  lässt.
- **Tests:** Parallel zu Features schreiben, nicht nachträglich. Kernlogik
  (z.B. Task-Verschachtelung, Fortschrittsberechnung, Datumsfilter) hat
  Priorität.
- **Secrets:** Niemals ins Repo. `.gitignore` sauber halten (node_modules,
  Build-Artefakte, `.env`). Zukünftige API-Keys etc. nur über
  Umgebungsvariablen.
- **Code-Reviews:** In sinnvollen Abständen selbstständig durchführen
  (Code-Qualität, Sicherheit), bevor ein Feature als fertig gilt.
- **Commit-Größe:** Kleine, thematisch klare Schritte statt Mega-Commits.
- **Session-Start-Hook:** Einrichten, sobald das Projekt bau-/testbar ist,
  damit jede Web-Session automatisch weiß, wie sie build/lint/test
  ausführt.
- **Diese Datei schlank halten:** Details gehören in `docs/`, nicht hier
  rein.
- **Proaktive Hinweise:** Sicherheitsrelevante oder anderweitig sinnvolle
  Verbesserungen ("schlaue Sachen"), die während der Arbeit auffallen,
  werden dem Nutzer von sich aus mitgeteilt, ohne dass er danach fragen
  muss.
- **Meilensteine:** Bedeutsame Zwischenstände (abgeschlossene
  Mockup-Iterationen, erste lauffähige Version, etc.) werden selbstständig
  per Git-Tag markiert — im Zweifel lieber häufiger als zu selten, ohne
  dass der Nutzer danach fragen muss. Volles Semantic-Versioning-Schema
  erst ab echtem App-Code (siehe `docs/decisions.md`).

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
