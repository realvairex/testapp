# Aktueller Stand & nächste Schritte

**Dieses Dokument ist das Erste, was in einer neuen Session gelesen
wird.** Es beantwortet drei Fragen: Wo stehen wir, was ist als Nächstes
dran, und was darf nicht noch einmal vorgeschlagen werden.

> **Auslöser für den Sitzungswechsel:** Der Nutzer schreibt
> **`start unfold`** bzw. **`ende unfold`** als normale Nachricht — das
> sind **keine Slash-Befehle**. Eingecheckte Slash-Befehle kennt nur das
> Claude-Code-Terminal; die Web- und App-Oberfläche antwortet darauf mit
> „kein bekannter Befehl". Erkenne die Auslöser in beliebiger
> Schreibweise, lies die zugehörige Datei unter `.claude/commands/` und
> führe ihre Anweisung ohne Rückfrage aus.

Stand: 2026-08-07

---

## 0. Wo das Projekt liegt und wie gearbeitet wird

Seit 2026-08-06 gilt:

- **Hauptstand ist `main`** im Repo `github.com/realvairex/testapp`.
  Vorher lag alles nur im Branch `claude/todo-app-brainstorm-fmv1sd`,
  während `main` bloß ein leeres README enthielt. Der Branch bleibt als
  zweite Kopie bestehen und wird nicht gelöscht.
- **Gearbeitet wird an einem lokalen Klon** (zuletzt
  `~/Documents/Claude/testapp`), nicht im Browser auf GitHub. GitHub ist
  Sicherungsort, keine Arbeitsfläche.
- **Die Doku- und Push-Pflicht aus `CLAUDE.md` gilt unverändert.** Sie
  schützt jetzt gegen „Rechner weg" statt gegen „Container weg" — der
  Grund ist ein anderer, die Regel dieselbe.
- **GitHub-Zugang** läuft über `gh`, angemeldet als `realvairex`. Die
  Commit-Identität ist **repo-lokal** gesetzt; die globale Git-Konfiguration
  zeigt auf einen älteren Account des Nutzers und bleibt unangetastet.
  Bei Push-Fehlern zuerst `gh auth status` prüfen.

Begründung und Hergang: `docs/decisions.md`, Einträge vom 2026-08-06.

### Auf einem anderen Rechner weiterarbeiten

Das gesamte Projekt ist portabel: Doku, Mockup, Prüfskripte, die Hooks in
`.claude/settings.json` und die Auslöser in `.claude/commands/` sind alle
eingecheckt, und die Hooks arbeiten über `$CLAUDE_PROJECT_DIR` — es gibt in
keiner eingecheckten Datei einen absoluten Pfad. Klonen, `start unfold`
sagen, weiterarbeiten.

**Eine Sache kommt beim Klonen aber nicht mit: die Commit-Identität.** Sie
ist bewusst repo-lokal gesetzt, und repo-lokale Konfiguration lebt in
`.git/config` — die wird nicht mitgeklont. Auf einem frischen Rechner greift
dessen globale Einstellung, und die zeigt beim Nutzer auf einen älteren
Account. Ohne diesen Schritt gehen Commits unter falschem Namen raus, was
erst in der GitHub-Historie auffällt. Deshalb nach jedem Klon:

```bash
gh auth login
gh repo clone realvairex/testapp
cd testapp
git config user.name  realvairex
git config user.email vvairexx@gmail.com
```

**Auf fremden Geräten:** `gh auth login` hinterlässt ein dauerhaftes Token
mit Schreibzugriff. Gehört der Rechner nicht dem Nutzer, danach
`gh auth logout` und den Klon löschen.

**Ohne lokalen Klon** geht es über Claude Code im Web (`claude.ai/code`),
das direkt gegen GitHub arbeitet. Dann gilt allerdings wieder: Die Umgebung
ist temporär, Ungepushtes ist verloren, und die Weboberfläche kennt keine
eingecheckten Slash-Befehle — `start unfold` / `ende unfold` als Text
schreiben.

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

1. **Löschregeln und Papierkorb** (`spec.md` §4.3) — offen. **Die vier
   Fragen wurden dem Nutzer am 2026-08-07 gestellt, aber nicht mehr
   beantwortet** — die Sitzung endete vorher. Sie können unverändert
   wieder aufgemacht werden:
   1. Gelöschte Gruppe — löscht sie die Listen darin mit, oder rutschen
      die eine Ebene hoch (ungruppiert)?
   2. Gelöschte Aufgabe — nehmen die Unteraufgaben den Weg mit, oder
      rücken sie an die Stelle der Elternaufgabe?
   3. Papierkorb mit Wiederherstellung (und wie lange?) oder nur eine
      Rückgängig-Meldung direkt nach der Aktion?
   4. Offene Spalte zeigt auf Gelöschtes — welche Regel gilt? (Im Mockup
      wird der `panelStack` abgeschnitten, das ist die Reparatur eines
      Einzelfalls.)
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

**Kleiner offener Faden:** In `spec.md` steht §4.6 vor §4.5. Umsortieren
wurde am 2026-08-07 angeboten, blieb ohne Rückmeldung, und wurde bewusst
**nicht** eigenmächtig gemacht — Abschnittsnummern könnten anderswo
referenziert sein. Beim nächsten Mal einfach mitfragen.

**Erledigt — der Session-Start-Hook funktioniert nachweislich.** Am
2026-08-06 startete eine Sitzung direkt in `~/Documents/Claude/testapp`,
und die Zeile „=== Projekt Unfold ===" erschien mitsamt dem vollständigen
Hook-Text (Projektregeln, Auslöser-Hinweis, letzte Commits). Der frühere
Fehlschlag lag allein am falschen Startverzeichnis (`~/Documents/Claude`,
eine Ebene **über** dem Repo) — Claude Code liest `.claude/settings.json`
aus dem Projektverzeichnis.

Am 2026-08-07 zusätzlich **in einer Web-Sitzung** (Claude Code im Web,
frischer Container ohne lokalen Klon) bestätigt: Der Hook löst dort
genauso aus. Die eingecheckte Arbeitsweise trägt also auf beiden Wegen.

> **Merke:** Bleibt die Zeile künftig aus, ist zuerst das
> Arbeitsverzeichnis zu prüfen, nicht der Hook. Er ist in Ordnung.

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
| Historische Einträge in `docs/decisions.md` | Werden **nicht überschrieben**. Korrekturen kommen als **Nachtrag darunter**, damit nachvollziehbar bleibt, was damals galt. Vom Nutzer bestätigt (2026-08-07). |
| Git-Tags für Meilensteine | Technisch möglich (nachgewiesen 2026-08-07), aber **vorerst nicht genutzt**. `milestones.md` bleibt die Wahrheit. Tags erst ab echtem App-Code, **zusätzlich** zur Tabelle. |
| Repo-lokale Commit-Identität | **Bleibt so**, obwohl sie einen Klon nicht überlebt. Nach jedem Klon einmal setzen — Schrittfolge in §0. |

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

## 6. Das veröffentlichte Mockup

Das Mockup ist als Artifact veröffentlicht — das ist die Ansicht, in der
der Nutzer es anschaut und beurteilt:

```
https://claude.ai/code/artifact/84d0d4a2-c9dc-4127-aa49-5f8f5f7e9cbc
```

**Wichtig für jede neue Sitzung:** Wer das Mockup ändert und neu
veröffentlicht, muss **diese URL mitgeben** (Parameter `url` beim
Artifact-Werkzeug). Sonst entsteht eine zweite, leere Adresse, und der
Nutzer schaut weiter auf den alten Stand, während er glaubt, den neuen
zu sehen — ein Fehler, der lange unbemerkt bleiben kann. Nur innerhalb
derselben Sitzung, in der veröffentlicht wurde, genügt der Dateipfad.
