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

## Behaupten ist nicht prüfen

Der teuerste wiederkehrende Fehler dieses Projekts — in zwei Spielarten
zusammen **zehnmal** vorgekommen. Die Muster mit Belegen und die Kennzahl
„wer findet die Fehler": `docs/lernkurve.md`.

1. **Jede Behauptung über ein Verhalten braucht ihre Messung** — im selben
   Arbeitsschritt. „Läuft grün" ohne Lauf und „ist eingebaut" für Code, der
   nie ausgeführt wird, sind hier beide schon passiert.
2. **Bei einem roten Punkt zuerst die Messung anzweifeln, dann das
   Erzeugnis** — dreimal lag der Fehler in der Messung. Die Messung dann
   aber auch **reparieren**, nicht die Zusicherung entschärfen.
3. **Wirkung gegenprüfen, wenn man sie nicht unmittelbar sieht:** Fix per
   `git stash` entfernen, gleich messen, Unterschied ansehen. Sonst wird
   eine Reparatur gemeldet, von der niemand weiß, ob sie repariert.
4. **Der erste plausible Verursacher ist nicht automatisch der richtige.**
5. **Eine Zusammenfassung ist keine Quelle.** Wer aus einer Webseite, einem
   fremden Repo oder einem Dokument etwas ableitet, holt es **frisch** und
   liest es **selbst** — und gleicht die eigene Analyse dann *gegnerisch*
   damit ab, in der Annahme, sie enthalte Fehler. Das gilt erst recht für
   Zusammenfassungen, die ein **anderes Werkzeug** erzeugt hat: Ein Repo
   wird geklont und gelesen, nicht über eine Vorschau beurteilt.
6. **Erfolgskriterien vor der Arbeit, nicht danach.** Aus „ich mache X"
   wird „X → prüfbar an: Y". Bei einer vagen Vorgabe („noch nicht ganz
   clean") zuerst nach **Ort und Auslöser** fragen, statt breit zu suchen —
   breites Suchen hat hier mehr Zeit gekostet als jede einzelne Reparatur.

## Chirurgisch ändern

- **Wer etwas entfernt, prüft, was daran hing.**
- **Kein Suchen-und-Ersetzen über Dateien, die je einen eigenen Zweck
  haben.** *Ein Selektor, der wieder matcht, ist keine Prüfung, die wieder
  prüft.*
- **Umliegenden Code nicht nebenbei „verbessern"** — nennen, nicht
  anfassen.

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
- **Alles gehört ins Netz.** *„Wenn etwas in dieses Netz nicht verwoben
  ist, benutzt es auch keiner"* (Festlegung des Nutzers, 2026-08-12). Wer
  eine Datei anlegt, verwebt sie **im selben Schritt**: Von wo wird auf sie
  verwiesen, und **bei welchem Auslöser**? Wer schreibt sie fort? Eine
  Datei, die niemand nennt, ist praktisch nicht vorhanden — und beide
  Seiten sehen für sich genommen in Ordnung aus, weshalb es niemandem
  auffällt. `scripts/session-check.sh` prüft das mechanisch (Abschnitt 7).

## Entwicklungs-Konventionen

- **Backup:** Regelmäßig committen und pushen (kleine, häufige Commits statt
  eines großen am Ende). Ungepushtes ist in **jeder** Arbeitsumgebung
  gefährdet — am lokalen Klon durch Plattendefekt oder verlorenen Rechner,
  in einer Web-Sitzung durch den temporären Container. Wo gerade gearbeitet
  wird, steht in `docs/status.md` §0.
- **Werkzeuge gehören ins Repo, nicht ins Scratchpad.** Faustregel:
  *Würde ich das in vier Wochen noch einmal brauchen? Dann sofort ins
  Repo.* Das Scratchpad ist nur für echten Wegwerf. Im Zweifel ins Repo —
  eine überflüssige Datei kostet nichts, eine verlorene die Arbeit darin.
  (Anlass: `docs/decisions.md`, 2026-08-06.)
- **Secrets:** Niemals ins Repo. `.gitignore` sauber halten (node_modules,
  Build-Artefakte, `.env`). Zukünftige API-Keys etc. nur über
  Umgebungsvariablen.
- **Commit-Größe:** Kleine, thematisch klare Schritte statt Mega-Commits.
- **Diese Datei schlank halten.** Sie wird bei **jeder** Sitzung
  vollständig gelesen; jede Regel darin konkurriert mit allen anderen um
  Aufmerksamkeit. Hier steht nur, was **durchgängig** gilt. Regeln für
  bestimmte Arbeiten stehen in `docs/conventions.md` — mit ihrem Auslöser:
  - **Bevor du eine Bibliothek hinzufügst oder aktualisierst** → dort
    nachlesen (exakte Version, Prüfung vor Übernahme).
  - **Bevor du die Datenschicht baust** → dort nachlesen (offenes Format,
    Export, Schema-Version, atomares Schreiben). Die Daten liegen nur auf
    dem Gerät; ein Fehler hier ist unwiederbringlich.
  - **Bevor du ein Feature beginnst oder abschließt** → dort nachlesen
    (Tests parallel, Selbst-Review).
  - **Beim ersten Flutter-Code** → dort nachlesen (CI, Hook erweitern,
    Semantic Versioning).
- **Meilensteine:** Bedeutsame Zwischenstände selbstständig in
  `docs/milestones.md` mit Commit-Hash festhalten — lieber häufiger als zu
  selten, ohne Aufforderung. **Git-Tags bewusst noch nicht**, obwohl sie
  sich pushen lassen; die Tabelle trägt Beschreibungen, die ein Tag-Name
  nicht fasst. Begründung: `docs/decisions.md`.

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

- `CLAUDE.md` — diese Datei: **nur was durchgängig gilt** (Haltung,
  Doku-Pflicht, Sitzungswechsel)
- `docs/status.md` — **zuerst lesen**: aktueller Stand, nächster Schritt,
  Festlegungen des Nutzers, bekannte Fallstricke
- `docs/lernkurve.md` — **wiederkehrende Fehlermuster**, was dagegen
  geholfen hat, Impulse von außen und offene Schwächen. Das Warum hinter
  den Regeln in dieser Datei.
- `docs/conventions.md` — Regeln für **bestimmte** Arbeiten
  (Abhängigkeiten, Datenschicht, Features, Flutter-Start)
- `docs/session-log.md` — was in welcher Sitzung passiert ist
- `docs/concept.md` — Produktvision, Inspiration, Feature-Liste, Design-Richtung
- `docs/spec.md` — **Umsetzungsvorlage**: Datenmodell, Verhaltensregeln,
  Design-Tokens. Das ist die Wahrheit für den Flutter-Bau, nicht das Mockup.
- `docs/decisions.md` — laufendes Entscheidungsprotokoll
- `docs/milestones.md` — Meilensteine mit Commit-Hash zum Zurückspringen
- `docs/research-superlist.md` — Recherche zu Superlists Open-Source-Fundament
- `design/mockups/tests/` — Playwright-Prüfskripte zum Mockup (eigene README)
- `scripts/run-mockup-tests.sh` — lässt alle Prüfskripte laufen, mit Urteil
- `scripts/session-check.sh` — Abschlussprüfung beim Sitzungswechsel
