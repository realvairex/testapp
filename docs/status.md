# Aktueller Stand & nächste Schritte

**Dieses Dokument ist das Erste, was in einer neuen Session gelesen
wird.** Es beantwortet drei Fragen: Wo stehen wir, was ist als Nächstes
dran, und was darf nicht noch einmal vorgeschlagen werden.

Stand: 2026-08-06

---

## 1. Wo wir stehen

**Phase:** Konzept abgeschlossen, Mockup fertig iteriert, Umsetzung noch
nicht begonnen. Es existiert **kein App-Code**.

Was fertig ist:

- **`design/mockups/v1-desktop.html`** — ein vollständiges, interaktives
  Desktop-Mockup als einzelne HTML-Datei ohne Build-Schritt. Enthält:
  Mehrspalten-Drilldown mit Push-Animation, Seiten als Freitext-Dokument
  mit gemischten Text-/Aufgaben-/Bild-Blöcken, Listen-Gruppen,
  Drag&Drop-Sortierung, Heute-Ansicht inkl. überfälliger Aufgaben,
  Fälligkeitsdaten, Textformatierung über Auswahl-Popover und
  `/`-Menü, Hell/Dunkel-Umschaltung.
- **`docs/spec.md`** — die Umsetzungsvorlage für den Flutter-Bau.
  Datenmodell, Verhaltensregeln, Design-Tokens. **Das ist die Wahrheit,
  nicht das Mockup.**
- **`design/mockups/tests/`** — 40 Playwright-Skripte, die das Mockup in
  einem echten Browser nachmessen. Alle laufen grün.
- Die Gestaltung ist einmal komplett durchnormalisiert (Schriftgrößen,
  Radien, Abstände, Dauern, Icon-Strichstärke) und erfüllt WCAG AA in
  beiden Themes — nachgemessen mit `test_contrast.js`.

## 2. Was als Nächstes dran ist

Der abgestimmte Plan, in dieser Reihenfolge:

1. **Löschregeln und Papierkorb** (`spec.md` §4.3) — offen. Zu klären:
   Löscht das Entfernen einer Gruppe die Listen darin oder hebt es sie
   eine Ebene hoch? Papierkorb mit Wiederherstellung oder
   Rückgängig-Meldung? Was passiert mit Unteraufgaben, wenn die
   Elternaufgabe verschwindet?
2. **Globales Tastenkürzel für Quick Capture** (`spec.md` §4.1) — lässt
   sich im Browser nicht bauen, muss also rein spezifiziert werden.
3. **Spec vervollständigen, Mockup einfrieren** (`spec.md` §4.5).
4. **Flutter-Umstieg beginnen:** Projekt aufsetzen, CI-Pipeline
   (Lint/Typecheck/Test bei jedem Push), Session-Start-Hook um
   Build-/Test-Befehle erweitern — und **die Datenschicht zuerst**
   (Speicherformat, Schema-Version, atomares Schreiben, Export), bevor
   Oberfläche entsteht.

Auf der Merkliste, bewusst zurückgestellt: Befehlspalette ⌘K
(`spec.md` §4.6), Teilen von Listen, Spracheingabe.

Aufgeschoben bis zum echten App-Code: `prefers-reduced-motion` wieder
einbauen (im Mockup absichtlich deaktiviert, damit die Animationen
sichtbar bleiben).

**Beim nächsten Sitzungsstart zu prüfen:** Ob die Hooks in
`.claude/settings.json` tatsächlich feuern. Sie konnten in der Sitzung,
in der sie entstanden sind, nicht scharf geprüft werden — die
aufgerufenen Kommandos wurden einzeln nachgestellt und laufen korrekt,
aber ob Claude Code sie auslöst, zeigt sich erst beim nächsten Start.
Erscheint zu Beginn keine Zeile „=== Projekt Unfold ===", ist der Hook
defekt und muss repariert werden.

## 3. Festlegungen des Nutzers, die nicht neu aufgerollt werden

Diese Punkte sind entschieden. Sie hier zu wiederholen spart dem Nutzer,
dieselbe Antwort noch einmal geben zu müssen.

| Thema | Festlegung |
|---|---|
| Die zwei Knöpfe unten links in der Sidebar | Die **unterschiedliche Größe ist Absicht**. Nicht angleichen. Der kleinere steht seit `432b409` auf derselben Grundlinie wie der große, nicht neben dessen Mitte. |
| Neuentwurf des unteren Sidebar-Bereichs | Vier Varianten wurden vorgelegt und **alle abgelehnt** (2026-08-06). Der Bereich bleibt wie er ist. Nicht erneut vorschlagen. |
| „+ Bild" in der unteren Leiste | Bleibt. |
| „+ Aufgabe" in der unteren Leiste | Wurde entfernt — das Eingabefeld erfüllt denselben Zweck. |
| Listen-Kennzeichnung in der Sidebar | **Farbige Punkte**, keine Ordner-Icons. |
| Hover im hellen Design | Muss **heller** als der Grundton sein, nicht dunkler. |
| Farben aus fremden Screenshots | Werden nicht übernommen — nur Struktur und Anordnung. |

## 4. Fallstricke, die schon einmal Zeit gekostet haben

- **Drei Theme-Blöcke, nicht einer.** Farb-Tokens stehen in `:root`, in
  `:root[data-theme="dark"]` *und* in der
  `@media (prefers-color-scheme: dark)`-Rückfallebene. Wer nur einen
  ändert, erzeugt ein Theme, das je nach Systemeinstellung anders
  aussieht.
- **`border-radius: 50%` rechnet gegen die Border-Box.** Ein Abstand als
  `padding` statt `margin` macht aus einem Kreis eine Ellipse — genau so
  ist der Listenpunkt kaputtgegangen (`ab6cdb4`).
- **`<button>` bringt ein Browser-Standard-Padding mit.** Ohne
  `padding: 0` wird jedes kleine Icon darin gequetscht.
- **Natives HTML5-Drag&Drop hat die App zweimal eingefroren.** Ist
  vollständig durch einen gemeinsamen Pointer-Sortierer ersetzt. Nicht
  zurückbauen.
- **Die Füllzeilen-Konstruktion im Editor ist ein
  contenteditable-Notbehelf**, kein Entwurfsmuster. Sie darf **nicht**
  nach Flutter übernommen werden — dort übernimmt `super_editor` das
  Dokumentmodell. Steht auch so in `spec.md`.

## 5. Wo was steht

| Datei | Inhalt |
|---|---|
| `CLAUDE.md` | Arbeitsweise, Konventionen, Einstiegspunkt |
| `docs/status.md` | dieses Dokument — Stand und nächste Schritte |
| `docs/concept.md` | Produktvision, Inspiration, Feature-Liste |
| `docs/spec.md` | Umsetzungsvorlage: Datenmodell, Verhalten, Tokens |
| `docs/decisions.md` | vollständiges Entscheidungsprotokoll mit Begründungen |
| `docs/milestones.md` | Meilensteine mit Commit-Hash, inkl. Rückkehrpunkt |
| `docs/research-superlist.md` | Recherche zu Superlists Open-Source-Fundament |
| `design/mockups/v1-desktop.html` | das Mockup |
| `design/mockups/tests/` | Prüfskripte samt eigener README |
| `design/assets/logo.svg` | das Logo |

**Rückkehrpunkt vor der Flutter-Entscheidung:** Commit `3891fed`
(siehe `docs/milestones.md`).
