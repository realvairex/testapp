# Recherche: Was wir von Superlist übernehmen können

Stand: 2026-08-06

Superlist ist unsere Haupt-Inspirationsquelle (siehe `concept.md`). Sie
haben einen erheblichen Teil ihres technischen Fundaments als Open Source
veröffentlicht: <https://github.com/superlistapp>. Dieses Dokument hält
fest, was dort liegt, was davon für uns nutzbar ist und was wir daraus
lernen können.

## Die Repos im Überblick

| Repo | Sprache | ⭐ | Was es ist |
|---|---|---|---|
| `super_native_extensions` | Rust | 570 | Natives Drag&Drop, Clipboard, Kontextmenüs |
| `super_sliver_list` | Dart | 423 | Sehr lange Listen mit variablen Höhen, zuverlässiges Springen/Animieren |
| `super_editor` | Dart | — | Block-Editor-Toolkit (MIT) |
| `super_embed` | Dart | 19 | Einbetten von Web-Inhalten |
| `routemaster` | Dart | 5 | Navigation/Routing |
| `ferryman_ex` | Elixir | 2 | JSON-RPC2 Client & Server über Redis |
| `phoenix-socket-dart` | Dart | — | Phoenix-Sockets (WebSockets) für Dart |
| `ex_speechly`, `speechly_protox` | Elixir | — | Anbindung an Speechly (Spracherkennung) |
| `superlist-mcp` | — | — | Offizieller MCP-Server für Superlist |
| `superlist-assist` | Shell | — | KI-Layer auf Basis des MCP-Servers |

**Die wichtigste Erkenntnis daraus:** Superlist ist eine **Flutter-App**
mit einem **Elixir/Phoenix-Backend**. Das lässt sich aus der Repo-Landschaft
zweifelsfrei ablesen (Flutter-Forks, routemaster, super_editor,
super_sliver_list — dazu phoenix-socket-dart und ferryman_ex auf der
Serverseite).

## 1. `super_editor` — der Block-Editor

- **Lizenz: MIT** ("Copyright (c) 2021 Superlist, SuperDeclarative! and the
  contributors"). Wir dürfen ihn verwenden, verändern und in einem eigenen
  Produkt ausliefern.
- **Sprache: Dart/Flutter.** Nicht in React/TypeScript nutzbar.
- **Reifegrad:** letzte stabile Version 0.2.7 (rund zwei Jahre alt),
  aktive Entwicklung läuft auf Vorabversionen (0.3.0-dev.x). 781 Likes,
  ~8.000 Downloads/Woche. Gepflegt von Flutter Bounty Hunters gemeinsam
  mit Superlist. **Undo/Redo ist dort noch in Arbeit** — das ist der
  wesentliche Vorbehalt.

### Architektur (auch unabhängig von der Sprache lehrreich)

- **`Document` / `MutableDocument`** — eine geordnete Liste diskreter
  `DocumentNode`s (Absatz, Überschrift, Liste, Bild, Trenner), jeder mit
  eigener ID. Absatz ist ein *Blocktyp*, nicht Text zwischen Blöcken.
  → Genau dieses Modell haben wir im Mockup übernommen, nachdem unser
  ursprüngliches Modell vier Fehler auf einmal produziert hat (siehe
  `decisions.md`).
- **`DocumentComposer`** — hält **Auswahl und aktive Stile getrennt vom
  Inhalt**. Lehre: Cursor-/Auswahlzustand gehört nicht in den
  Dokumentzustand. Unser Mockup vermischt beides und muss deshalb beim
  Verlassen des Feldes synchronisieren.
- **`Editor` mit `EditRequest`/`EditCommand`** — *alle* Änderungen laufen
  über Kommandos statt über direkte Mutation. Das ist die Voraussetzung
  für Undo/Redo, für Kollaboration und für Reaktionen. Unser Mockup
  mutiert das Modell an vielen Stellen direkt (Checkbox, Quick-Add,
  Drag-Commit …) — für die echte App ist das die entscheidende Änderung.
- **Reactions** — abgeleitete Folgeänderungen, die durch eine Bearbeitung
  ausgelöst werden. Unsere Erledigt-Kaskade (nach unten und nach oben) ist
  genau so eine Reaktion; aktuell rufen wir `recomputeAncestors()` von
  Hand an mehreren Stellen auf, und eine vergessene Stelle ist eine
  Fehlerquelle.

> Bemerkenswert: Selbst Superlist hat Undo/Redo und eine stabile
> Editor-Pipeline als offene Baustelle markiert. Das ist der beste Beleg
> dafür, dass ein Block-Editor nichts ist, was man nebenbei selbst
> schreibt.

## 2. `super_sliver_list` — lange Listen

Löst zuverlässiges Scrollen/Springen in sehr langen Listen mit variabler
Elementhöhe. Für uns relevant, sobald eine Liste oder eine Seite lang
wird. In React wäre das Gegenstück TanStack Virtual oder react-virtuoso.

## 3. `super_native_extensions` — Drag&Drop

Eigene Rust-Schicht für natives Drag&Drop, Clipboard und Kontextmenüs
über alle Plattformen. **Direkt relevant:** In dieser Session hat uns
Drag&Drop zweimal die App eingefroren, bis wir die native Browser-API
komplett aufgegeben haben. Dass Superlist dafür eine eigene
plattformübergreifende Bibliothek gebaut hat, bestätigt: Das ist ein
echtes, hartes Problem und kein Randthema.

## 4. Backend: Elixir/Phoenix

`phoenix-socket-dart` und `ferryman_ex` zeigen ein Phoenix-Backend mit
WebSocket-Kanälen für Echtzeit. Für unser (zurückgestelltes) Teilen von
Listen ist das eine erprobte Vorlage.

## 5. Sprache als Eingabe (Speechly)

Die Speechly-Anbindung deutet auf Spracheingabe zur Aufgabenerfassung.
Passt unmittelbar zu unserem Kernprinzip Quick Capture — als Feature-Idee
vorgemerkt, nicht für v1.

## 6. `superlist-mcp` + `superlist-assist` — KI-Layer

Ein offizieller MCP-Server plus eine Plugin-Schicht für Claude Code:
Aufgaben aus einem Gespräch erfassen, Morgen-Briefing, Rückblicke,
Aufräumen liegengebliebener Aufgaben. Übernehmenswerte Details:

- Versteckte `[sb:<id>]`-Marker an den Aufgaben, damit ein erneuter Lauf
  nichts doppelt anlegt (Idempotenz).
- Tages-Snapshots, um "N von M gestern erledigt" berichten zu können.
- Konfigurierbare Schwellen: "überladen" ab 5 Aufgaben, "hängt fest" nach
  3-maligem Verschieben.
- Zustand bleibt lokal auf dem Gerät.

Besonders die Heuristik "hängt fest nach 3-maligem Verschieben" passt gut
zu Unfolds Anspruch, Rauschen zu reduzieren statt Druck zu erzeugen.

## Fazit für unsere Stack-Entscheidung

Siehe `decisions.md`. Kurz: Der Editor ist übernehmbar (MIT), aber nur
zusammen mit Flutter als Plattform. Da der Editor das Herzstück der App
ist und bei React/TypeScript für Mobile komplett neu gebaut werden müsste
(React Native teilt keine UI-Komponenten mit React im Web), spricht die
Mobile-Perspektive für Flutter.
