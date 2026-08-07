# Sitzungsprotokoll

Eine Zeile Geschichte pro Arbeitssitzung: was passiert ist, was
entschieden wurde, was offen blieb. Ergänzt die Git-Historie um das,
was ein Commit nicht zeigt — verworfene Wege, Begründungen im Vorbeigehen,
offene Fäden.

Wird von `ende unfold` fortgeschrieben und von `scripts/session-check.sh`
eingefordert. Neueste Sitzung oben.

---

## 2026-08-07 — Umgebungsannahmen nachgezogen, Portabilität geklärt

Eine kurze Aufräum-Sitzung ohne inhaltliche Produktarbeit. Anlass war,
dass beim Sitzungsstart drei Aussagen im Repo auffielen, die aus der alten
Container-Umgebung stammten und nach dem Umzug auf den lokalen Rechner
niemand nachgeprüft hatte.

**Gemacht**

- **Session-Start-Hook nachgewiesen.** Die Zeile `=== Projekt Unfold ===`
  erschien — diese Sitzung startete anders als die vorige direkt im
  Repo-Verzeichnis. Damit ist auch der frühere Fehlschlag erklärt: falsches
  Arbeitsverzeichnis, nicht defekter Hook. Offener Punkt in `status.md`
  gestrichen und durch die Diagnoseregel ersetzt (bleibt die Zeile aus,
  zuerst das Arbeitsverzeichnis prüfen).
- **Git-Tag-Push geprüft statt vermutet.** Wegwerf-Tag
  `test-tag-push-probe` angelegt, gepusht, per `git ls-remote --tags` auf
  dem Server bestätigt, beidseitig wieder gelöscht. Alle Schritte
  fehlerfrei; der Server ist danach wieder tag-frei. Die alte 403-Sperre
  war tatsächlich nur eine Eigenschaft der Container-Umgebung.
- **`CLAUDE.md` an drei Stellen korrigiert**, die Doku- und Push-Pflicht
  noch mit dem temporären Session-Container begründeten.
- **Portabilität nachgesehen** (auf Nachfrage des Nutzers): Suche nach
  absoluten Pfaden über alle eingecheckten Dateien — kein Treffer. Hooks
  adressieren über `$CLAUDE_PROJECT_DIR`. Klon-Anleitung in `status.md` §0
  aufgenommen.

**Entschieden**

- **Tags bleiben vorerst ungenutzt** — aber jetzt aus inhaltlichem Grund
  statt aus technischem Zwang: `milestones.md` trägt Beschreibungen, die
  ein Tag-Name nicht fassen kann. Tags kommen mit echtem App-Code dazu,
  zusätzlich zur Tabelle, nicht an ihrer Stelle.
- **Die repo-lokale Commit-Identität bleibt**, obwohl sie einen Klon nicht
  überlebt. Der Preis ist ein Konfigurationsschritt nach jedem Klon; der
  Gegenwert ist, dass die globale Konfiguration anderer Projekte des
  Nutzers unberührt bleibt.
- **Historische Einträge in `decisions.md` werden nicht überschrieben.**
  Der Nutzer hat das ausdrücklich bestätigt: Korrekturen kommen als
  Nachtrag darunter. Ein Protokoll soll zeigen, was damals galt — sonst
  ist später nicht mehr nachvollziehbar, warum eine Entscheidung so fiel.

**Was ein Commit nicht zeigt**

- Der eigentliche Ertrag der Sitzung ist ein Muster, nicht ein Fix: **Eine
  Konvention, die aus einer technischen Einschränkung entstanden ist,
  braucht eine neue Begründung, sobald die Einschränkung wegfällt.** Sonst
  schleppt das Projekt Regeln mit, deren Grund niemand mehr kennt — und
  beim ersten Hinterfragen kippt mit der hinfälligen Begründung auch die
  weiterhin richtige Regel. Beide heutigen Korrekturen sind Fälle davon.
- Die Container-Begründung wurde aus `CLAUDE.md` entfernt, aber **nicht
  ersatzlos**: Für den Web-Weg (Claude Code ohne lokalen Klon) stimmt sie
  weiterhin und steht jetzt dort, wo sie zutrifft.
- Die Commit-Identitäts-Falle ist deshalb heikel, weil sie geräuschlos
  ist: nichts bricht, der Push gelingt, und auffallen kann sie erst in der
  GitHub-Historie — wenn die falschen Commits schon geschrieben sind.

**Offen**

- **Inhaltlich unverändert:** Am Produkt wurde heute nichts entschieden.
  Der nächste Schritt bleibt derselbe wie gestern — Löschregeln und
  Papierkorb (`spec.md` §4.3). Die vier Fragen wurden dem Nutzer gestellt,
  aber nicht beantwortet; die Sitzung endete vorher.
- **Kleinigkeit ohne Antwort:** In `spec.md` steht §4.6 vor §4.5. Angeboten
  umzusortieren, keine Rückmeldung erhalten — bewusst nicht eigenmächtig
  geändert, weil Abschnittsnummern anderswo referenziert sein könnten.

---

## 2026-08-06 — Mockup-Feinschliff und Übergabe-Infrastruktur

**Gemacht**

- Editor-Fehler behoben: Abstände zwischen Aufgaben, Backspace löschte
  fälschlich die Aufgabe über der leeren Zeile, zu kleiner Cursor.
- Fälligkeitsdaten eingebaut, überfällige Aufgaben bleiben auf der
  Heute-Seite sichtbar.
- Textformatierung ohne dauerhafte Werkzeugleiste: Auswahl-Popover,
  `/`-Menü, Markdown-Kürzel.
- Logo eingebunden, Sidebar-Hover im hellen Design sichtbar gemacht,
  Verbindungslinien der Gruppen verstärkt und abgerundet.
- Gestaltung komplett normalisiert: 12→5 Schriftgrößen, 8→5 Radien,
  13→3 Dauern, 18→11 Abstände, 7→1 Icon-Strichstärke. WCAG AA in beiden
  Themes nachgemessen, 0 Verstöße.
- Tastaturbedienbarkeit, Überlauf bei langen Namen, Verhalten bei vielen
  Aufgaben geprüft.
- Papierkorb-Icon neu gezeichnet (war optisch außermittig).
- Listenpunkte waren zu Ellipsen geworden — Ursache: der 15px-Abstand
  war als `padding` gesetzt, wodurch `border-radius: 50%` gegen die
  15×8-Box rechnete. Auf `margin` umgestellt.
- Gruppen-Knopf unten links auf die Grundlinie des Listen-Knopfes
  gesetzt statt neben dessen Mitte.
- **40 Playwright-Prüfskripte aus dem temporären Verzeichnis ins Repo
  gerettet** (`design/mockups/tests/`) — sie wären beim Sessionwechsel
  ersatzlos verloren gewesen. Zwei davon waren veraltet und wurden
  repariert; alle 40 laufen grün, inklusive Fuzz-Lauf über 760
  Drag-Kombinationen ohne Hänger.
- Übergabe-Infrastruktur gebaut: `docs/status.md`, `docs/session-log.md`,
  `scripts/session-check.sh`, die Befehle `start unfold` und `ende unfold`, sowie ein
  Session-Start-Hook.

**Entschieden**

- Vier Entwürfe für den unteren Sidebar-Bereich vorgelegt, **alle vom
  Nutzer abgelehnt**. Der Bereich bleibt unverändert. Einzige Änderung:
  Grundlinien-Ausrichtung. → In `status.md` vermerkt, damit es nicht
  erneut vorgeschlagen wird.
- Die Prüfskripte gehören ins Repo, nicht ins temporäre Verzeichnis.

- Nach der Rückfrage „wie verhindern wir das künftig?" eine dreistufige
  Absicherung gebaut: Konvention („Werkzeuge gehören ins Repo") in
  `CLAUDE.md`, Prüfung an vier Hooks (`SessionStart`, `Stop`,
  `PreCompact`, `SessionEnd`), und zwei stille Kurzmodi
  (`--kurz`, `--drift`), damit der Wächter nicht zum Hintergrundrauschen
  wird. Dazu `scripts/scratchpad-ignore.txt`, damit einmal verworfene
  Dateien verworfen bleiben.

**Entschieden (Nachtrag)**

- Der `Stop`-Hook fragt bewusst **nur** nach Dateien außerhalb des
  Repos, nicht nach nicht committeten Änderungen — sonst würde er nach
  jedem Arbeitsschritt anschlagen und binnen Tagen ignoriert.
- Kein automatisches Committen durch Hooks: Das würde die Git-Historie
  als Mittel der Nachvollziehbarkeit entwerten. Die Hooks melden, sie
  handeln nicht.

- **Korrektur am selben Tag:** Die Auslöser waren als Slash-Befehle
  gedacht. Der Nutzer probierte es und bekam „kein bekannter Befehl" —
  eingecheckte Slash-Befehle stehen nur im Claude-Code-Terminal zur
  Verfügung, nicht in der Web-Oberfläche. Umgestellt auf Text-Auslöser
  (`start unfold` / `ende unfold`), verbindlich verankert in `CLAUDE.md`,
  im Session-Start-Hook und in `status.md`. Lehre: eine empfohlene
  Mechanik ohne Probe ist eine Vermutung.

**Offen**

- Löschregeln und Papierkorb (`spec.md` §4.3) — der nächste Schritt.
- Ob die Hooks tatsächlich feuern, ist noch unbewiesen: Sie greifen erst
  beim Start der *nächsten* Session bzw. beim nächsten Stop-Ereignis,
  nicht in der laufenden. Die aufgerufenen Kommandos wurden einzeln
  nachgestellt und laufen korrekt. Beim nächsten Sessionstart prüfen:
  Erscheint die Zeile „=== Projekt Unfold ==="?

---

## Sitzung 2026-08-06 (später Abend) — Umzug auf den lokalen Rechner

**Ausgangslage:** Der Nutzer schrieb `start unfold`, aber die Sitzung lief
erstmals **nicht** im Claude-Container, sondern auf seinem Mac in einem
leeren Verzeichnis. Kein Repo, kein Kontext — der Auslöser lief ins Leere.
Nach Nennung der Repo-Adresse geklont und den Kontext von dort geladen.

**Getan**

- Repo `github.com/realvairex/testapp` nach `~/Documents/Claude/testapp`
  geklont; Projektkontext aus `status.md`, `CLAUDE.md` und `spec.md`
  geladen.
- **Sicherung vor jedem Eingriff:** `git bundle --all` außerhalb des Repos
  abgelegt und mit `git bundle verify` geprüft.
- **`main` per Fast-Forward auf `4374af9`** gezogen und gepusht. Vorher
  lag der gesamte Stand nur im Branch `claude/todo-app-brainstorm-fmv1sd`
  — ein Wegwerf-Name, dessen Löschung die komplette Arbeit vernichtet
  hätte. Der Branch bleibt als zweite Kopie bestehen.
- **GitHub-Zugang repariert:** Git zog einen abgelaufenen
  Schlüsselbund-Eintrag des alten Accounts `SchnapsideeAT`. `gh`
  installiert, als `realvairex` angemeldet; Commit-Identität repo-lokal
  gesetzt, damit andere Projekte des Nutzers unberührt bleiben.
- Ergebnis serverseitig gegengeprüft (`gh api`), nicht nur lokal:
  beide Branches auf `4374af9`, `main` ist Default, Dateien liegen oben.

**Lehre**

Der Projektstand war die ganze Zeit an einem automatisch benannten Branch
aufgehängt, ohne dass es jemandem auffiel — inklusive aller Dokumente, die
genau vor solchen Verlusten schützen sollten. Die Absicherung galt dem
Inhalt der Sitzung, nicht der Frage, ob der Ort selbst haltbar ist.
Nachgezogen in `status.md` §0.

**Offen**

- Löschregeln und Papierkorb (`spec.md` §4.3) — weiterhin der nächste
  inhaltliche Schritt.
- **Hooks bleiben ungeprüft.** Die Zeile „=== Projekt Unfold ===" kam
  nicht, aber die Sitzung startete eine Ebene über dem Repo — der Hook
  konnte gar nicht auslösen. Der Test hat nicht stattgefunden, statt
  fehlzuschlagen. Richtige Probe: Sitzung direkt in `testapp/` starten.
