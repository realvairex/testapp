# Projekt: Unfold (Todo App)

Dieses Dokument wird von Claude Code automatisch bei jeder Session gelesen.
Es ist der Einstiegspunkt in den Projektkontext — halte es aktuell.

## Grundhaltung: proaktiv arbeiten

Der Nutzer soll nicht danach fragen müssen. Das ist keine Nettigkeit am
Rande, sondern die wichtigste Erwartung an die Zusammenarbeit in diesem
Projekt. Konkret heißt das:

- **Auffälligkeiten sofort melden**, nicht auf Nachfrage warten:
  Sicherheitsrisiken, Datenverlustgefahr, Widersprüche zwischen
  Dokumenten, veralteter Stand, unsaubere Abhängigkeiten, Dinge die
  später teuer werden.
- **Mitdenken statt abarbeiten.** Wenn eine Aufgabe eine bessere Lösung
  nahelegt als die wörtlich verlangte, wird sie genannt — und die
  verlangte trotzdem geliefert, wenn der Nutzer dabei bleibt.
- **Widersprechen, wenn etwas nicht stimmt.** Auch bei einer Bitte des
  Nutzers. Einmal sagen, begründen, dann seiner Entscheidung folgen.
- **Unnötige Arbeit abraten.** Wenn ein gemeldeter Fehler beim
  anstehenden Umstieg ohnehin verschwindet, wird das gesagt, bevor Zeit
  hineinfließt.
- **Selbst dokumentieren, selbst committen, selbst Meilensteine setzen** —
  ohne Aufforderung, siehe unten.
- **Ehrlich berichten.** Was nicht geprüft wurde, wird nicht als geprüft
  dargestellt. Fehlgeschlagenes wird benannt, nicht weggelassen.

## Arbeitsweise / Doku-Pflicht

Für dieses Projekt gilt durchgängig:

- **Jede wesentliche Entscheidung** (Tech-Stack, Architektur, Feature-Scope,
  Datenmodell, Design-Richtung) wird in `docs/decisions.md` protokolliert —
  mit Kontext, abgewogenen Optionen und Begründung, nicht nur dem Ergebnis.
- **Die Produktvision und Feature-Liste** lebt in `docs/concept.md` und wird
  aktuell gehalten, wenn sich der Scope ändert.
- **Commits** bekommen aussagekräftige, nachvollziehbare Messages.
- Alles, was über den aktuellen Chat hinaus Bestand haben soll, muss ins
  Repo committed werden — der Chat ist temporär, das Repo ist es nicht.
- Ziel: Jede Entscheidung und jeder Arbeitsschritt soll im Nachhinein aus
  dem Repo (Docs + Git-Historie) nachvollziehbar sein, auch ohne Zugriff auf
  den ursprünglichen Chat.
- Dies gilt automatisch, ohne dass der Nutzer danach fragen oder es
  einfordern muss.

## Entwicklungs-Konventionen

- **Backup:** Regelmäßig committen und pushen (kleine, häufige Commits statt
  eines großen am Ende). Gearbeitet wird auf einem lokalen Klon; GitHub ist
  die einzige Kopie außerhalb dieses einen Rechners. Ungepushtes überlebt
  keinen Plattendefekt und keinen verlorenen Rechner.
- **Werkzeuge gehören ins Repo, nicht ins Scratchpad.** Ein Skript, das
  **mehr als einmal** ausgeführt wird oder eine **Messung, Regel oder
  Erkenntnis** festhält, wird von vornherein im Repo angelegt und
  committet — nicht im temporären Verzeichnis. Das Scratchpad ist
  ausschließlich für echten Wegwerf: ein einmaliger Bildschirmschuss,
  eine Zwischenablage, ein Einzeiler zum Nachsehen. Faustregel: *Würde
  ich das in vier Wochen noch einmal brauchen? Dann sofort ins Repo.*
  Im Zweifel ins Repo — eine überflüssige Datei kostet nichts, eine
  verlorene kostet die Arbeit, die in ihr steckt.
  (Anlass: 40 Prüfskripte lagen ausschließlich im Scratchpad und wären
  bei einem Sitzungswechsel ersatzlos verloren gewesen. Siehe
  `docs/decisions.md`, 2026-08-06.)
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
- **Abhängigkeiten:** Jede Fremdbibliothek auf eine **exakte Version**
  festnageln (keine Versionsbereiche), Lockfile mitcommitten. Updates
  passieren nie nebenbei: erst in einer abgesicherten Umgebung
  (eigener Branch/Worktree) einspielen, Funktionsfähigkeit prüfen, und
  **erst nach bestandener Prüfung** in den Hauptstand übernehmen. Gilt
  besonders für Vorabversionen (z.B. `super_editor` vor 1.0), bei denen
  es keine Stabilitätsgarantie gibt.
- **Datensicherheit der Nutzerdaten:** Die App ist local-first, die Daten
  liegen also nur auf dem Gerät. Deshalb ab der ersten lauffähigen
  Version: offenes, dokumentiertes Speicherformat (JSON/SQLite, nichts
  Undurchsichtiges), eine Export-Funktion, Schema-Version in den
  gespeicherten Daten plus Migrationen, und atomares Schreiben
  (erst in temporäre Datei, dann umbenennen), damit ein Absturz während
  des Speicherns den Bestand nicht zerstört.
- **Proaktive Hinweise:** Sicherheitsrelevante oder anderweitig sinnvolle
  Verbesserungen ("schlaue Sachen"), die während der Arbeit auffallen,
  werden dem Nutzer von sich aus mitgeteilt, ohne dass er danach fragen
  muss.
- **Meilensteine:** Bedeutsame Zwischenstände (abgeschlossene
  Mockup-Iterationen, erste lauffähige Version, etc.) werden selbstständig
  in `docs/milestones.md` mit Commit-Hash festgehalten — im Zweifel lieber
  häufiger als zu selten, ohne dass der Nutzer danach fragen muss. Git-Tags
  **lassen sich inzwischen pushen** (am 2026-08-06 nachgewiesen), werden
  aber bewusst noch nicht vergeben — die Tabelle trägt Beschreibungen, die
  ein Tag-Name nicht fassen kann. Begründung: `docs/decisions.md`. Volles
  Semantic-Versioning-Schema erst ab echtem App-Code.

## Status

**➡︎ Der aktuelle Stand steht in `docs/status.md`. Diese Datei zuerst
lesen** — dort stehen auch der nächste offene Schritt, die bereits
getroffenen Festlegungen des Nutzers (inklusive abgelehnter Vorschläge)
und die Fallstricke, die schon einmal Zeit gekostet haben.

Grob: Konzept steht, das Mockup ist fertig iteriert und durchgemessen,
App-Code existiert noch nicht.

## Sitzungswechsel

Der Chat ist temporär: Kein Wissen aus einer Sitzung ist in der nächsten
noch da, wenn es nicht im Repo steht. Deshalb gibt es zwei feste
Auslöser:

- **`start unfold`** zu Beginn einer neuen Sitzung — lädt den
  Projektkontext aus dem Repo. Anweisung: `.claude/commands/start.md`.
- **`ende unfold`** vor dem Verlassen einer Sitzung — überführt alles
  Wissenswerte ins Repo und läuft dabei `scripts/session-check.sh`, das
  mechanisch nachprüft, ob wirklich nichts verloren geht. Anweisung:
  `.claude/commands/ende.md`.

**Wichtig — diese Auslöser sind Text, kein Slash-Befehl.** Eingecheckte
Slash-Befehle stehen nur im Claude-Code-Terminal zur Verfügung; in der
Web- und App-Oberfläche kennt sie die Eingabezeile nicht. Der Nutzer
schreibt sie deshalb als normale Nachricht.

**Verbindlich:** Schreibt der Nutzer `start unfold` oder `ende unfold` —
in beliebiger Schreibweise, mit oder ohne Schrägstrich, auch als
`starte unfold`, `unfold start`, `session ende` oder ähnlich —, dann
wird die zugehörige Datei unter `.claude/commands/` gelesen und ihre
Anweisung vollständig ausgeführt. Nicht nachfragen, ob das gemeint war.

Das Prüfskript läuft auch jederzeit allein:
`bash scripts/session-check.sh`

## Tech-Stack

**Flutter** (Dart) — eine Codebasis für Desktop, Mobile und Web. Als
Editor-Fundament ist `super_editor` vorgesehen (MIT, von Superlist
mitentwickelt). Ausschlaggebend war die Mobile-Perspektive; Begründung,
bekannte Risiken und Ausstiegsweg siehe `docs/decisions.md`, Recherche
zum Superlist-Fundament siehe `docs/research-superlist.md`.

Rückkehrpunkt vor dieser Entscheidung: Commit `3891fed`, siehe
`docs/milestones.md`.

## Doku-Struktur

- `CLAUDE.md` — diese Datei: Projektüberblick, Konventionen
- `docs/status.md` — **zuerst lesen**: aktueller Stand, nächster Schritt,
  Festlegungen des Nutzers, bekannte Fallstricke
- `docs/session-log.md` — was in welcher Sitzung passiert ist
- `docs/concept.md` — Produktvision, Inspiration, Feature-Liste, Design-Richtung
- `docs/spec.md` — **Umsetzungsvorlage**: Datenmodell, Verhaltensregeln,
  Design-Tokens. Das ist die Wahrheit für den Flutter-Bau, nicht das Mockup.
- `docs/decisions.md` — laufendes Entscheidungsprotokoll
- `docs/milestones.md` — Meilensteine mit Commit-Hash zum Zurückspringen
- `docs/research-superlist.md` — Recherche zu Superlists Open-Source-Fundament
- `design/mockups/tests/` — Playwright-Prüfskripte zum Mockup (eigene README)
- `scripts/session-check.sh` — Abschlussprüfung beim Sitzungswechsel
