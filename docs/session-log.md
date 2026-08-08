# Sitzungsprotokoll

Eine Zeile Geschichte pro Arbeitssitzung: was passiert ist, was
entschieden wurde, was offen blieb. Ergänzt die Git-Historie um das,
was ein Commit nicht zeigt — verworfene Wege, Begründungen im Vorbeigehen,
offene Fäden.

Wird von `ende unfold` fortgeschrieben und von `scripts/session-check.sh`
eingefordert. Neueste Sitzung oben.

---

## 2026-08-08 — Löschregeln: entschieden und gebaut

**Gemacht**

- **Alle vier Löschregel-Fragen entschieden** (`spec.md` §4.3, seit dem
  2026-08-06 offen) und anschließend umgesetzt.
- **Rückgängig-Zeile an Ort und Stelle**, fünf Sekunden, dann endgültig.
  Zwei Platzierungen wurden als Bild vorgelegt; der Nutzer wählte die
  Zeile am Ort des Geschehens.
- **Rückfrage beim Löschen einer Gruppe** mit Listen.
- **`closePanelsFrom()`** ersetzt zwei Einzelfall-Reparaturen und wird an
  vier Stellen benutzt.
- **Gruppenname zeigt jetzt die greifende Hand.** Der Nutzer meldete, das
  Verschieben ganzer Gruppen fehle — es gab es längst, aber der Name war
  als einziges Element der Zeile mit Textcursor versehen.
- **Artifact-Prüfung in `ende unfold`** (Schritt 11) — das veröffentlichte
  Mockup war einen Commit älter als das Repo.

**Entschieden** (Begründungen in `docs/decisions.md`)

- Gelöschte **Gruppe** nimmt ihre Listen mit, gelöschte **Aufgabe** ihre
  Unteraufgaben. Ich hatte bei der Gruppe das Gegenteil empfohlen; das
  Argument des Nutzers (der geplante Papierkorb macht es gefahrlos) hebt
  den Einwand auf — **erzwingt aber die Rückfrage, solange es ihn nicht
  gibt.**
- **Papierkorb: 30 Tage ab dem Löschen**, aufgeräumt beim App-Start und
  beim Öffnen. In der Sidebar nur sichtbar, wenn etwas drin ist. Kommt mit
  der Datenschicht, nicht ins Mockup.
- Rückgängig **am Ort des Geschehens** statt als schwebende Meldung.

**Lehre**

Zum dritten Mal in wenigen Tagen eine Funktion, die arbeitet, aber nicht
zeigt, dass sie arbeitet — diesmal der Gruppenname mit Textcursor. Für den
Nutzer ist so etwas nicht vorhanden, schlimmer als eine sichtbare Lücke,
denn er sucht nicht weiter. Als **Prüffrage für den Flutter-Bau**
festgehalten: *Sieht man einer Sache an, was mit ihr möglich ist?*

Und beim Bauen der Rückgängig-Zeile: Der eigentliche Gewinn zeigte sich
erst im gebauten Zustand — **nichts springt**. Das war in keiner der
beiden Skizzen zu sehen und hätte sich nicht erraten lassen.

**Offen**

- **Globales Tastenkürzel** (`spec.md` §4.1) — nur noch „welches Kürzel?".
- **Mockup einfrieren** (§4.5), **Aufräum-Modus**, **Flutter-Umstieg**.
- `test_4bugs` bleibt der bekannte Wackelkandidat (Lauf vom 2026-08-08:
  50 grün, 1 rot — dieses eine).
- `verify_center` meldet die Gruppenzeilen weiter als „MISALIGNED";
  veraltete Erwartung im Skript, kein Fehler.

## 2026-08-08 — Nachtrag: das veröffentlichte Mockup war veraltet

**Gemacht**

- Der Nutzer fragte, ob Variante 2 (Datum an der Zeile) eingebaut sei.
  Sie war es — `b432eca`, in `main`, Variante 1 restlos entfernt. **Das
  Artifact war jedoch einen Commit älter**, weil ich nach dem Umbau nicht
  mehr veröffentlicht hatte. Neu veröffentlicht unter derselben URL.
- **`ende unfold` um Schritt 11 erweitert:** „Passt das veröffentlichte
  Mockup zum Repo-Stand?"

**Lehre**

Ein Fehler, der in jeder Prüfung grün ist: Im Repo stimmt alles, der
Sitzungs-Check meldet „alles gesichert" — nur das, was der Nutzer
*ansieht*, ist veraltet. Bewusst als Frage in der Anleitung statt als
Prüfung im Skript, weil `session-check.sh` ohne Netz läuft und das
Artifact ohne Abruf nicht zu beurteilen ist.

**Offen**

Unverändert die Liste aus `status.md`: Löschregeln und Papierkorb
(`spec.md` §4.3) als nächster inhaltlicher Schritt, dann das globale
Kürzel, das Einfrieren des Mockups, der Aufräum-Modus und der
Flutter-Umstieg.

## 2026-08-07 (zweite Sitzung) — Vom Aufräumen zur Gestaltung: Eingang, Datum, Ziehen

**Gemacht**

Der Tag begann mit Aufräumen und endete bei Produktgestaltung.

- **Prüfwerkzeug geschaffen:** `scripts/run-mockup-tests.sh` fällt ein
  Urteil pro Skript. Die Behauptung „alle 40 laufen grün" war seit Wochen
  ungeprüft weitergereicht worden — es gab schlicht keinen Läufer.
- **Playwright auf 1.56.1 festgenagelt** (`package.json` + Lockfile), die
  eigene Regel aus `CLAUDE.md` war unbemerkt verletzt.
- **`README.md` geschrieben**, bestand vorher aus einer Zeile.
- **Sitzungsbefehle handeln jetzt selbst** statt zu fragen: `start unfold`
  holt den Stand per Fast-Forward, `ende unfold` überführt ihn nach `main`.
  `session-check.sh` bekam Abschnitt 3 („Stand in main angekommen").
- **Darstellungs-Schalter** ersetzt den Optionen-Knopf: zwei Felder mit
  gleitendem Knopf, direkt in der Sidebar.
- **Spaltenkopf ohne Menü:** Titel ist ein Eingabefeld (Umbenennen war
  vorher gar nicht möglich), Farbe über den Punkt davor.
- **Fälligkeit** als dauerhafte Zeile mit eigenem Kalender, der an der
  Spalte verankert schwebt.
- **Fenster** hört bei 490 px auf zu schrumpfen, die Seite scrollt
  stattdessen und behält ihren Abstand.
- **Der Eingang** wurde vom Xdo-Vorbild abgeleitet: ein Ort statt einer
  Liste, Startansicht, Einsortieren durch Ziehen auf eine Sidebar-Liste.
- **Ziehen sichtbar gemacht:** mitziehendes Etikett, greifender Zeiger,
  angedeutete Ziele.

**Entschieden** (alles mit Begründung in `docs/decisions.md`)

- Overlays sind die letzte Wahl; wenn doch nötig, verankert am
  nächstgelegenen begrenzten Behälter — nicht am Fenster. Steht als
  Grundsatz in `spec.md` §2.5.
- „Nächste Woche" aus der Fälligkeit entfernt; „System" aus dem
  Darstellungs-Schalter entfernt; kein Stern für „wichtig"; keine
  Tastenkürzel für die Triage.
- CI bleibt zurückgestellt bis zum ersten Flutter-Code — schriftlich statt
  stillschweigend.
- `test_4bugs` wird nicht repariert: Der Fehler verschwindet beim
  Flutter-Umstieg ersatzlos.

**Lehre — dreimal derselbe Fund**

Bei **drei** roten Punkten lag der Fehler im **Prüfwerkzeug**, nicht im
Geprüften: eine um eine Sekunde zu knappe Zeitgrenze, eine Textsuche, die
`false` im Mess-JSON traf, eine Erwartung „Zähler +1" bei einem Zähler,
der verschachtelte Aufgaben mitsummiert, und eine Messung des linken
Randes im nach rechts gescrollten Zustand. **Bei einem roten Punkt zuerst
fragen, ob die Messung stimmt.**

Und zweimal riss eine Entfernung etwas mit, das niemand vermutet hätte:
die Animation `due-menu-in`, die das `/`-Menü noch brauchte, und neun
Prüfskripte, die auf den Eingang zeigten. **Wer etwas entfernt, muss
suchen, was daran hing** — und ein pauschales Ersetzen leistet das nicht:
Ein Selektor, der wieder matcht, ist keine Prüfung, die wieder prüft.

**Offen**

- **Aufräum-Modus** für den Eingang — beauftragt, noch nicht gebaut. Die
  drei Fragen davor stehen in `status.md`.
- **Löschregeln und Papierkorb** (`spec.md` §4.3) — weiterhin der nächste
  inhaltliche Schritt. Dabei mit anschauen: Der Löschknopf wandert mit der
  Titellänge, was mit Wiederherstellung an Gewicht verliert.
- **`test_4bugs`** bleibt der bekannte Wackelkandidat.

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

## 2026-08-07 — Aufräumen: Prüfwerkzeug, Abhängigkeit, Sitzungsbefehle

**Gemacht**

- **Session-Start-Hook auch im Web nachgewiesen.** Diese Sitzung lief in
  einem frischen Web-Container ohne lokalen Klon; die Zeile
  „=== Projekt Unfold ===" erschien. Die eingecheckte Arbeitsweise trägt
  damit auf beiden Wegen.
- **Zwei Lücken in den Sitzungsbefehlen geschlossen**, beide vom Nutzer
  aufgedeckt: `ende unfold` brachte den Stand nicht nach `main`,
  `start unfold` holte ihn nicht von GitHub. Beide handeln jetzt selbst,
  begrenzt auf den Fast-Forward. `session-check.sh` bekam Abschnitt 3
  („Stand in main angekommen") als Netz darunter.
- **`scripts/run-mockup-tests.sh` angelegt** — ein Befehl, der alle
  Prüfskripte laufen lässt und ein Urteil fällt, statt Zahlen zu drucken.
- **Playwright auf 1.56.1 festgenagelt** (`package.json` +
  `package-lock.json`, erzeugt mit `--package-lock-only`, also ohne
  `node_modules`).
- **`README.md` geschrieben.** Bestand vorher aus der Zeile `# testapp`.
- **Datums-Widerspruch bereinigt:** Der Tag-Push-Nachweis ist vom
  **2026-08-06** (Commit `2c26402`), `status.md` hatte 2026-08-07.

**Entschieden**

- Sitzungsbefehle **handeln**, statt zu fragen — Grenze ist der
  Fast-Forward, der per Konstruktion nichts verlieren kann. `--force`
  verboten. (Korrigiert eine Festlegung vom selben Vormittag.)
- **CI bleibt zurückgestellt**, aber schriftlich statt stillschweigend:
  Sie müsste beim Flutter-Umstieg neu geschrieben werden und würde ein
  eingefrorenes Mockup bewachen.
- **`test_4bugs` wird nicht repariert.** Der Fehler steckt in der
  Füllzeilen-Konstruktion, die laut `spec.md` §2.3 ohnehin nicht nach
  Flutter übernommen wird.

**Befunde aus dem ersten echten Prüflauf**

Die Aussage „alle 40 laufen grün" war seit Wochen ungeprüft weitergereicht
worden. Nachgemessen mit Playwright 1.56.1: **43 grün, 1 Wackelkandidat.**

- `test_4bugs`: über 10 Läufe **5× grün, 5× rot**. Getippter Text
  zwischen zwei Aufgaben verliert die ersten Zeichen.
- `test_fuzz_all`: 760 Drag-Kombinationen, **0 Hänger**, keine
  Seitenfehler — der Pointer-Sortierer ist erneut bestätigt.
- **Nur sechs** der 44 Skripte haben überhaupt Zusicherungen. Der Rest
  sind Messskripte, deren Zahlen ein Mensch beurteilen muss — auch
  `test_contrast`, auf dem die WCAG-Aussage beruht.

**Lehre**

Zwei der drei „Fehler" im ersten Lauf lagen im **Prüfwerkzeug**: eine um
eine Sekunde zu knappe Zeitgrenze und eine Textsuche, die das Wort
`false` im angehängten Mess-JSON traf. Ein frisch gebautes Prüfwerkzeug
gehört zuerst gegen sich selbst geprüft.

Und: Eine Zusicherung, die zu teuer im Nachprüfen ist, wird nicht
nachgeprüft, sondern geglaubt. Genau deshalb hielt sich „alle grün" so
lange.

**Offen**

- **Löschregeln und Papierkorb** (`spec.md` §4.3) — weiterhin der nächste
  inhaltliche Schritt, die vier Fragen stehen unverändert.
- Der Arbeitsstand liegt auf `claude/start-unfold-r00zcz` und muss nach
  `main` (erledigt `ende unfold` jetzt selbst).
