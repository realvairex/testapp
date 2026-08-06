# Sitzungsprotokoll

Eine Zeile Geschichte pro Arbeitssitzung: was passiert ist, was
entschieden wurde, was offen blieb. Ergänzt die Git-Historie um das,
was ein Commit nicht zeigt — verworfene Wege, Begründungen im Vorbeigehen,
offene Fäden.

Wird von `/ende` fortgeschrieben und von `scripts/session-check.sh`
eingefordert. Neueste Sitzung oben.

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
  `scripts/session-check.sh`, die Befehle `/start` und `/ende`, sowie ein
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

**Offen**

- Löschregeln und Papierkorb (`spec.md` §4.3) — der nächste Schritt.
- Ob die Hooks tatsächlich feuern, ist noch unbewiesen: Sie greifen erst
  beim Start der *nächsten* Session bzw. beim nächsten Stop-Ereignis,
  nicht in der laufenden. Die aufgerufenen Kommandos wurden einzeln
  nachgestellt und laufen korrekt. Beim nächsten Sessionstart prüfen:
  Erscheint die Zeile „=== Projekt Unfold ==="?
