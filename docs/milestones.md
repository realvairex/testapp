# Meilensteine

Bedeutsame Zwischenstände werden hier mit dem jeweiligen Commit-Hash
festgehalten. Damit lässt sich jederzeit per `git checkout <hash>` zu
einem markanten Stand zurückspringen — genauso zuverlässig wie mit einem
Tag, nur ohne extra Git-Referenz.

> **Hinweis 2026-08-06:** Ursprünglich stand hier, Git-Tags ließen sich
> nicht pushen. Das galt für die alte Container-Umgebung, in der nur der
> Arbeits-Branch freigegeben war. Seit dem Umzug auf den lokalen Rechner
> mit `gh`-Anmeldung (Scope `repo`) **wäre Taggen möglich**. Diese Tabelle
> bleibt trotzdem die Wahrheit: Sie trägt Beschreibungen, die ein Tag-Name
> nicht fassen kann, und ist ohne Git-Kenntnisse lesbar. Tags kommen erst
> mit echtem App-Code und Semantic Versioning dazu, nicht vorher.

| Datum | Commit | Beschreibung |
|---|---|---|
| 2026-08-05 | `8296b27` | Mockup v2 "Unfold": Seiten-Modell statt Baumliste, Mehrspalten-Drilldown, warmer Akzent, durchgängige Animationen |
| 2026-08-05 | `193a8d4` | Mockup v3: Listen/Aufgaben-Seiten als echtes Freitext-Dokument (contenteditable), Listen-Gruppen mit Drag&Drop, Auto-Vervollständigung, Lösch-Optionen |
| 2026-08-05 | `badb471` | Push-Animation: App-Shell von Grid auf Flex umgebaut, Sidebar-Collapse-Snap/Standbild-Bug behoben (siehe `decisions.md`) |
| 2026-08-05 | `1ef5e49` | Drag&Drop komplett auf einen gemeinsamen Pointer-Sortierer umgestellt (Sidebar + Aufgaben), App-Freeze behoben, touch-tauglich |
| 2026-08-06 | `3891fed` | **↩︎ RÜCKKEHRPUNKT vor der Flutter-Entscheidung** — siehe eigener Abschnitt unten |
| 2026-08-06 | `512cc9f` | Mockup fertig iteriert und durchgemessen; Uebergabe-Infrastruktur fuer Sitzungswechsel (`status.md`, `session-log.md`, `start unfold`, `ende unfold`, Pruefskript) |
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
