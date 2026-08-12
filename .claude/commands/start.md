---
description: Projektkontext laden und dort weitermachen, wo die letzte Session aufgehört hat
---

Du startest eine neue Session am Projekt **Unfold**$ARGUMENTS. Es gab
vorher schon Sessions; der gesamte Stand liegt im Repo, nicht im Chat.

Arbeite folgende Schritte ab, bevor du antwortest:

1. Lies `docs/status.md` vollständig. Das ist der Übergabestand: wo wir
   stehen, was als Nächstes dran ist, welche Vorschläge der Nutzer
   bereits abgelehnt hat, und welche Fallstricke schon einmal Zeit
   gekostet haben.
2. Lies `docs/spec.md` — die Umsetzungsvorlage. Bei jedem Widerspruch
   zwischen Spec und Mockup gilt die Spec.
3. **Hol dir zuerst den echten Stand von GitHub**, bevor du ihn beurteilst:

   ```bash
   git fetch origin
   git status --porcelain                          # sauber?
   git pull --ff-only origin main                  # nur wenn sauber
   git log --oneline -15
   git log --oneline --all --not HEAD | head -20   # was liegt woanders?
   ```

   `git log` allein liest **nur lokale Refs** — nach einer Web-Sitzung
   oder einer Sitzung auf einem anderen Rechner ist der lokale Stand
   veraltet, ohne dass man es sieht. Auf einem veralteten Stand
   weiterzuarbeiten erzeugt zwei Historien, die später von Hand
   zusammengeführt werden müssen.

   **Der Fast-Forward-Pull wird ausgeführt, nicht angekündigt** — der
   Nutzer ruft `start unfold` bewusst auf, damit die Sitzung auf dem
   richtigen Stand beginnt. `--ff-only` ist die Sicherung: Er holt nur
   nach, was fehlt, und **bricht ab**, statt zu mergen, wenn die Stände
   auseinandergelaufen sind.

   **Nicht anfassen, sondern melden**, wenn: das Arbeitsverzeichnis
   nicht sauber ist (`git status --porcelain` gibt etwas aus), oder der
   Pull abbricht. Dann die Lage schildern und den Nutzer entscheiden
   lassen. Kam etwas Neues dazu, sag in einer Zeile, was.
4. Lies gezielt nach, was für die anstehende Aufgabe relevant ist:
   `docs/decisions.md` für das Warum hinter einer Festlegung,
   `docs/concept.md` für die Produktvision,
   **`docs/lernkurve.md`, bevor du eine Regel aus `CLAUDE.md` in Frage
   stellst oder eine neue hinzufügst** — dort steht, was sie gekostet hat
   und welche Fehler wiederkehren,
   **`docs/conventions.md`, sobald einer ihrer Auslöser eintritt** — eine
   Bibliothek hinzufügen oder aktualisieren, die Datenschicht bauen, ein
   Feature beginnen oder abschließen, den Flutter-Bau starten. Die
   Auslöser stehen auch in `CLAUDE.md`; die Regeln zur Datenschicht
   schützen vor **unwiederbringlichem** Datenverlust, also lieber einmal
   zu viel nachsehen.

**Prüfe dabei den Hook mit:** Wenn zu Beginn dieser Sitzung *keine*
Zeile `=== Projekt Unfold ===` erschienen ist, ist der Session-Start-Hook
in `.claude/settings.json` defekt. Sag das dem Nutzer von dir aus und
biete an, ihn zu reparieren — er soll nicht selbst darauf achten müssen.
Ist die Zeile erschienen, vermerke einmalig in `docs/status.md`, dass
der Hook nachweislich funktioniert, und entferne den offenen Punkt dazu.

Melde dich dann mit einer **kurzen** Lagemeldung, nicht mit einer
Zusammenfassung aller Dokumente:

- Der Stand in zwei, drei Sätzen.
- Der nächste offene Schritt aus `docs/status.md`, mit der konkreten
  Frage, die dabei zu klären ist.
- Falls dir beim Lesen etwas auffällt, das der Nutzer wissen sollte
  (Widerspruch zwischen Dokumenten, veralteter Stand, Risiko): sag es
  von dir aus.

Dann warte auf den Nutzer.

**Für die gesamte Session gilt:** Die Regeln in `CLAUDE.md` sind
verbindlich — insbesondere die Doku-Pflicht und die Pflicht zu
proaktiven Hinweisen. Der Nutzer soll nicht danach fragen müssen.
Kommuniziere auf Deutsch.
