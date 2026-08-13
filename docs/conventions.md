# Konventionen für bestimmte Arbeiten

Diese Regeln gelten **nicht in jeder Sitzung**, sondern erst, wenn eine
bestimmte Arbeit ansteht. Deshalb stehen sie hier und nicht in `CLAUDE.md`
— dort steht nur, was durchgängig gilt, plus je eine Zeile mit dem Auslöser,
der hierher verweist.

> **Warum getrennt:** `CLAUDE.md` wird bei **jeder** Sitzung vollständig
> gelesen. Jede Regel darin konkurriert mit allen anderen um Aufmerksamkeit —
> auch mit denen, die gerade nichts mit der Aufgabe zu tun haben. Eine Regel
> über Datenbank-Migrationen hilft niemandem, der an einer CSS-Animation
> arbeitet; sie verdünnt nur die Regeln, die gerade zählen. Entscheidend
> ist, dass `CLAUDE.md` den **Auslöser** nennt („bevor du eine Bibliothek
> hinzufügst: …"), nicht bloß das Thema — sonst wird diese Datei nie
> aufgeschlagen. Anlass: `docs/decisions.md`, 2026-08-12.

---

## Abhängigkeiten hinzufügen oder aktualisieren

- Jede Fremdbibliothek auf eine **exakte Version** festnageln (keine
  Versionsbereiche), Lockfile mitcommitten.
- Updates passieren **nie nebenbei**: erst in einer abgesicherten Umgebung
  (eigener Branch/Worktree) einspielen, Funktionsfähigkeit prüfen, und
  **erst nach bestandener Prüfung** in den Hauptstand übernehmen.
- Gilt besonders für Vorabversionen (z. B. `super_editor` vor 1.0), bei
  denen es keine Stabilitätsgarantie gibt.

## Die Datenschicht bauen (Speichern der Nutzerdaten)

Die App ist local-first, die Daten liegen also **nur auf dem Gerät**. Es
gibt keinen Server, der sie im Zweifel noch hat. Deshalb ab der ersten
lauffähigen Version:

- **Offenes, dokumentiertes Speicherformat** (JSON/SQLite, nichts
  Undurchsichtiges).
- **Export-Funktion.**
- **Schema-Version** in den gespeicherten Daten, plus Migrationen.
- **Atomares Schreiben** (erst in temporäre Datei, dann umbenennen), damit
  ein Absturz während des Speicherns den Bestand nicht zerstört.

## Ein Feature bauen

- **Tests parallel schreiben, nicht nachträglich.** Kernlogik (z. B.
  Task-Verschachtelung, Fortschrittsberechnung, Datumsfilter) hat Priorität.
- **Code-Review selbstständig durchführen** (Code-Qualität, Sicherheit),
  bevor ein Feature als fertig gilt.
- **Zusicherungen prüfen Regeln, nicht Zustände.** Der Test beim
  Schreiben: *Wenn der Nutzer morgen eine erlaubte Entscheidung ändert —
  meldet die Prüfung dann rot?* Wenn ja, ist ein **Zustand**
  festgeschrieben (der heutige Farbwert, die heutige Liste der
  Fundstellen, die heutige Achse), und die Prüfung meldet künftig genau
  dann einen Fehler, wenn korrekt gearbeitet wurde. Zugesichert wird die
  **Beziehung** („der Punkt trägt dieselbe Farbe wie die Liste"), nicht
  der Wert. Das ist am 2026-08-13 dreimal an einem Tag schiefgegangen;
  Belege in `docs/lernkurve.md`, Muster 10. Ein mechanisches Netz dagegen
  gibt es nicht — nur diese Frage.

## Ab dem ersten Flutter-Code

- **CI aufsetzen:** GitHub-Actions-Pipeline (Lint, Type-Check, Tests bei
  jedem Push). Für das Mockup bewusst zurückgestellt — sie müsste beim
  Umstieg neu geschrieben werden und würde ein eingefrorenes Artefakt
  bewachen. Der Zweck ist bis dahin über `bash scripts/run-mockup-tests.sh`
  erreichbar. Begründung: `docs/decisions.md`, 2026-08-07.
- **Session-Start-Hook erweitern** um die Build-/Lint-/Test-Befehle. Der
  Hook selbst läuft bereits (nachgewiesen lokal am 2026-08-06 und in einer
  Web-Sitzung am 2026-08-07).
- **Semantic Versioning** einführen; ab dann zusätzlich zu
  `docs/milestones.md` auch Git-Tags vergeben.
