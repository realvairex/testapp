# Meilensteine

Bedeutsame Zwischenstände werden hier mit dem jeweiligen Commit-Hash
festgehalten. Damit lässt sich jederzeit per `git checkout <hash>` zu
einem markanten Stand zurückspringen — genauso zuverlässig wie mit einem
Tag, nur ohne extra Git-Referenz.

> **Hinweis 2026-08-06 (nachgemessen):** Ursprünglich stand hier, Git-Tags
> ließen sich nicht pushen. Das galt für die alte Container-Umgebung, in der
> nur der Arbeits-Branch freigegeben war. Vom lokalen Klon mit
> `gh`-Anmeldung aus **funktioniert Taggen** — nicht bloß vermutet, sondern
> mit einem Wegwerf-Tag (`test-tag-push-probe`) geprüft: anlegen, pushen,
> auf dem Server nachsehen, beidseitig wieder löschen. Alle vier Schritte
> liefen durch, der Server ist danach wieder tag-frei.
>
> Diese Tabelle bleibt trotzdem die Wahrheit: Sie trägt Beschreibungen, die
> ein Tag-Name nicht fassen kann, und ist ohne Git-Kenntnisse lesbar. Tags
> kommen erst mit echtem App-Code und Semantic Versioning dazu — dann
> **zusätzlich** zu dieser Tabelle, nicht an ihrer Stelle.

| Datum | Commit | Beschreibung |
|---|---|---|
| 2026-08-05 | `8296b27` | Mockup v2 "Unfold": Seiten-Modell statt Baumliste, Mehrspalten-Drilldown, warmer Akzent, durchgängige Animationen |
| 2026-08-05 | `193a8d4` | Mockup v3: Listen/Aufgaben-Seiten als echtes Freitext-Dokument (contenteditable), Listen-Gruppen mit Drag&Drop, Auto-Vervollständigung, Lösch-Optionen |
| 2026-08-05 | `badb471` | Push-Animation: App-Shell von Grid auf Flex umgebaut, Sidebar-Collapse-Snap/Standbild-Bug behoben (siehe `decisions.md`) |
| 2026-08-05 | `1ef5e49` | Drag&Drop komplett auf einen gemeinsamen Pointer-Sortierer umgestellt (Sidebar + Aufgaben), App-Freeze behoben, touch-tauglich |
| 2026-08-06 | `3891fed` | **↩︎ RÜCKKEHRPUNKT vor der Flutter-Entscheidung** — siehe eigener Abschnitt unten |
| 2026-08-06 | `512cc9f` | Mockup fertig iteriert und durchgemessen; Uebergabe-Infrastruktur fuer Sitzungswechsel (`status.md`, `session-log.md`, `start unfold`, `ende unfold`, Pruefskript) |
| 2026-08-08 | `b8e90f4` | **Loeschregeln entschieden und gebaut** (`spec.md` §4.3): Kaskade nach unten, Papierkorb mit 30 Tagen beschlossen, Rueckgaengig-Zeile am Ort des Geschehens, Rueckfrage beim Gruppenloeschen, Spaltenregel an einer Stelle |
| 2026-08-07 | `aee4337` | **Projekt auf pruefbaren Boden gestellt:** `run-mockup-tests.sh` faellt ein Urteil pro Skript (die Aussage "alle gruen" war Wochen ungeprueft weitergereicht), Playwright auf 1.56.1 festgenagelt, README geschrieben, CI-Zurueckstellung schriftlich begruendet |
| 2026-08-11 | `8105a18` | **Aufraeum-Modus entschieden und gebaut** (`spec.md` §2.8): gefuehrter Durchgang durch den Eingang, die Spalte uebernimmt statt eines Overlays; jede Entscheidung mit eigener Bewegung, federnder Balken, rollender Zaehler, Haptik. Belohnungsschicht als verbindlicher Teil der Spec, zweite Bewegungskurve `--ease-spring` eingefuehrt und eingegrenzt. Voller Pruefungslauf 52 gruen, 0 rot |
| 2026-08-11 | `244e2ad` | **Aufraeum-Modus fertig ausgearbeitet** (`spec.md` §2.8): gefuehrter Durchgang durch den Eingang, ein Knopf statt zwei, Belohnungsschicht als verbindlicher Teil der Spec, dritte Bewegungskurve `ease-lauf` fuer Balken und Zaehler. Zwei stille Animationsfehler behoben (Balken lief nie), das Aufblitzen beim Abhaken gemessen und als Anforderung nach §2.2 ueberfuehrt. 53 Pruefskripte, alle gruen |
| 2026-08-12 | `51cc141` | **Das „Refreshen" der Listen abgestellt** — drei Ursachen: die Einblend-Animation lief bei jedem Klick fuer jede Zeile, Kalender und Farbreihe blendeten trotz offenem Zustand neu ein, und Scrollstand samt Cursorposition gingen bei jedem Neuaufbau verloren. Dazu: der Fortschrittsbalken an der Aufgabenzeile lief seit Wochen ueberhaupt nicht. Zwei neue Pruefskripte (`test_kein_flackern`, `test_fortschritt`), 54 Skripte insgesamt |
| 2026-08-12 | `PLATZ` | **Arbeitsweise selbst ueberarbeitet:** `CLAUDE.md` gegen zwei fremde Vorlagen geprueft und umgeschichtet (situative Regeln nach `docs/conventions.md`, neue Abschnitte "Behaupten ist nicht pruefen" und "Chirurgisch aendern"), `docs/lernkurve.md` mit neun Fehlermustern und der Kennzahl "wer findet die Fehler", Grundsatz "Alles gehoert ins Netz" samt mechanischer Pruefung, `scripts/lernkurve-abgleich.sh` |
| 2026-08-07 | `f70abb1` | **Der Eingang:** vom Xdo-Vorbild abgeleiteter Ort zum schnellen Erfassen, Startansicht, Einsortieren durch Ziehen auf eine Sidebar-Liste. Beantwortet nebenbei `spec.md` §4.1 |
| 2026-08-06 | `5f5c161` | **Projekt auf sicheren Boden gestellt:** Hauptstand von einem automatisch benannten Branch nach `main` ueberfuehrt, Arbeit auf lokalem Klon, GitHub-Zugang auf `realvairex` repariert. Erster Stand, der beim Loeschen des `claude/…`-Branches nicht verloren waere. |

---

## ↩︎ Rückkehrpunkt: `3891fed` (2026-08-06)

**Der Stand unmittelbar bevor wir uns auf Flutter als Fundament
festgelegt haben.** Falls sich diese Entscheidung als falsch erweist,
ist dies der Punkt, an den zurückgesprungen wird.

**Was dieser Stand enthält:**

- Vollständiges, funktionierendes Desktop-Mockup
  (`design/mockups/v1-desktop.html`) — eine einzelne HTML-Datei ohne
  Build-Schritt, in jedem Browser direkt lauffähig:
  Mehrspalten-Drilldown mit Push-Animation, Freitext-Seiten mit
  gemischten Text-/Aufgaben-/Bild-Blöcken, Listen-Gruppen,
  Drag&Drop-Sortierung über einen gemeinsamen Pointer-Mechanismus,
  Heute-Ansicht, Hell/Dunkel-Umschaltung.
- Das komplette Produktkonzept (`concept.md`), das
  Entscheidungsprotokoll (`decisions.md`) und die Superlist-Recherche
  (`research-superlist.md`).
- **Noch keinerlei App-Code und keine Festlegung auf eine Plattform.**

**So springst du zurück:**

```bash
# Ansehen, ohne etwas zu verändern:
git checkout 3891fed

# Von hier aus in eine neue Richtung weiterarbeiten:
git checkout -b <neuer-branch-name> 3891fed
```

**Verifiziert:** Dieser Stand wurde testweise in einem separaten
Arbeitsverzeichnis ausgecheckt und das Mockup dort im Browser
gegengeprüft — Spalten, Editor-Blöcke und Sidebar rendern korrekt, keine
Konsolenfehler. Der Rückkehrpunkt funktioniert also nachweislich und ist
nicht nur notiert.
