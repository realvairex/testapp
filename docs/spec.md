# Spezifikation: Unfold

Stand: 2026-08-06 · **Status: in Arbeit**

Dieses Dokument ist die **Vorlage für die Umsetzung in Flutter**. Es hält
fest, was übertragbar ist: Datenmodell, Verhaltensregeln und
Design-Tokens. Das HTML-Mockup ist nur die *Erprobung* dieser Regeln, nicht
ihre Quelle — wer die App baut, soll hier nachlesen und nicht HTML
rückübersetzen müssen.

Was hier nicht steht, steht in `concept.md` (Produktvision) oder
`decisions.md` (warum etwas so entschieden wurde).

---

## 1. Datenmodell

Sprachneutral notiert. In Dart werden daraus Klassen.

### Liste (`List`)
| Feld | Typ | Bemerkung |
|---|---|---|
| `id` | String | eindeutig, stabil; sharing-freundlich (siehe `decisions.md`) |
| `name` | String | |
| `color` | Farbe | zur visuellen Unterscheidung |
| `groupId` | String? | `null` = nicht gruppiert |
| `tasks` | Aufgabe[] | die direkten Kind-Aufgaben |
| `blocks` | Block[] | der Seiteninhalt, siehe unten |

### Gruppe (`Group`)
| Feld | Typ |
|---|---|
| `id` | String |
| `name` | String |

Gruppen sind eine reine Sortier-/Faltebene der Sidebar. Eine Liste gehört
zu höchstens einer Gruppe.

### Aufgabe (`Task`)
| Feld | Typ | Bemerkung |
|---|---|---|
| `id` | String | eindeutig, stabil |
| `title` | String | |
| `done` | bool | |
| `due` | Datum? | optionales Fälligkeitsdatum |
| `subtasks` | Aufgabe[] | **unbegrenzt tief verschachtelbar** |
| `blocks` | Block[] | der Seiteninhalt dieser Aufgabe |

**Kernidee:** Liste und Aufgabe sind strukturell dasselbe — beide haben
Kinder und beide haben eine eigene Seite. Der einzige Unterschied ist, dass
eine Liste keinen Erledigt-Zustand und kein Datum hat.

### Block (Seiteninhalt)

Eine Seite ist eine **geordnete Liste von Blöcken**. Ein Absatz ist ein
Blocktyp, kein Text zwischen Blöcken. (Übernommen von Superlists
`super_editor`, siehe `research-superlist.md`.)

| Typ | Felder |
|---|---|
| `text` | `text: String` — genau eine Absatzzeile, darf leer sein |
| `task` | `id: String` — verweist auf eine Aufgabe in `subtasks`/`tasks` |
| `image` | `id: String`, `caption: String` |

Geplant, noch nicht spezifiziert: `heading`, `divider` (siehe offene
Punkte).

**Wichtig:** Ein `task`-Block ist eine *Referenz*. Die Aufgabe selbst lebt
in `subtasks` bzw. `tasks` des Besitzers. Die Blockliste bestimmt nur
Reihenfolge und Position auf der Seite.

### Ansichtszustand (nicht persistent)
| Feld | Bedeutung |
|---|---|
| `view` | `today` oder `list` |
| `currentListId` | welche Liste in Spalte 0 steht |
| `panelStack` | Aufgaben-IDs der geöffneten Spalten 1..n |
| `collapsedGroups` | welche Gruppen eingeklappt sind |

---

## 2. Verhaltensregeln

### 2.1 Spalten (Miller-Columns)
- Spalte 0 zeigt die aktive Liste bzw. die Heute-Seite.
- Klick auf eine Aufgabe öffnet ihre Seite als Spalte rechts daneben und
  **ersetzt** alle tieferen Spalten.
- **Maximal 3 Spalten gleichzeitig sichtbar**, unabhängig von der
  Fenstergröße. Spaltenbreite = verfügbare Breite ÷ min(Anzahl, 3),
  mindestens 240px.
- Ab 3 sichtbaren Spalten klappt die Sidebar weg und erscheint beim Hovern
  am linken Rand wieder.
- Ab der 4. Spalte wird horizontal gescrollt; darunter erscheint **keine**
  Scrollleiste.
- Escape schließt alle Panels.

### 2.2 Erledigt-Kaskade
- Eine Aufgabe abhaken hakt **alle** ihre Unteraufgaben mit ab (nach unten).
- Nach jeder Änderung wird nach **oben** neu berechnet: Eine Aufgabe gilt
  genau dann als erledigt, wenn sie mindestens eine Unteraufgabe hat und
  **alle** erledigt sind.
- Eine Aufgabe **ohne** Unteraufgaben behält ihren Zustand unverändert.
- Sobald eine Aufgabe Unteraufgaben hat, zeigt sie einen Fortschrittsbalken
  (erledigte ÷ gesamte direkte Kinder).

> ⚠️ Umsetzungshinweis: Diese Neuberechnung ist eine **abgeleitete
> Reaktion**, keine Handarbeit. Im Mockup wird sie an mehreren Stellen von
> Hand aufgerufen; eine vergessene Stelle ist dort eine Fehlerquelle. In
> Flutter gehört sie zentral in den Bearbeitungs-Pfad (`super_editor`
> nennt das "Reactions").

### 2.3 Seiten-Editor
- Jedes direkte Kind des Editors ist entweder ein Block (Aufgabe/Bild) oder
  ein Absatz. Nichts dazwischen.
- Es muss **immer** eine Schreibposition geben: vor einem führenden Block,
  zwischen zwei aufeinanderfolgenden Blöcken und nach einem abschließenden
  Block.
- Leere Absätze, die nur dieser Schreibposition dienen und an einen Block
  grenzen, werden **auf eine schmale Zeile zusammengeklappt** und öffnen
  sich erst, wenn der Cursor darin steht. Sonst stünde zwischen jeder
  Aufgabe eine sichtbare Leerzeile.
- Enter erzeugt einen neuen Absatz und verschiebt den Text rechts vom
  Cursor dorthin.
- Eine neue Aufgabe wird **an der Cursorposition** eingefügt; ist der
  Cursor nicht auf der Seite, ganz oben.
- Ein Klick in die leere Fläche unter dem Inhalt setzt den Cursor ans Ende.

### 2.4 Verschieben (Drag & Drop)
- Verschiebbar sind: Listen und Gruppen in der Sidebar, sowie Blöcke
  innerhalb einer Seite.
- **Blöcke** werden an einem eigenen Griff gezogen (die Zeile selbst ist
  klickbar und liegt in editierbarem Text).
- **Sidebar-Zeilen** werden direkt gezogen; eine Berührung unterhalb von
  4px Bewegung bleibt ein normaler Klick.
- Ablageziel ist **jeder** Block, nicht nur andere Blöcke desselben Typs —
  eine Aufgabe muss auch zwischen zwei Textzeilen landen können.
- Eine Liste kann auf eine Gruppe gezogen werden (= in die Gruppe
  aufnehmen) oder zwischen zwei Listen (= umsortieren).

### 2.5 Heute-Seite
- Zeigt listenübergreifend alle Aufgaben mit Fälligkeitsdatum = heute.
- Nur Aufgaben mit **eigenem** Datum. Eine übergeordnete Aufgabe erscheint
  nur, wenn sie selbst ein Datum für heute hat.
- Gruppiert nach Herkunftsliste.

---

## 3. Design-Tokens

Direkt nach Flutter übertragbar.

### Farben — Hell
| Token | Wert | Verwendung |
|---|---|---|
| `paper` | `#faf7f1` | Hintergrund außerhalb des Fensters |
| `surface` | `#ffffff` | Spaltenflächen |
| `surface-sunken` | `#eae0cc` | Sidebar, Eingabefelder |
| `line` | `#ddd0af` | Rahmen |
| `line-soft` | `#ece3cc` | leichte Trenner |
| `ink` | `#293241` | Haupttext |
| `ink-soft` | `#464d5b` | Sekundärtext |
| `ink-faint` | `#5c626b` | Zähler, Meta, Platzhalter |
| `accent` | `#ee6c4d` | Flächen, Icons, Dekoration |
| `accent-strong` | `#b32f10` | **Akzentfarbe für Text** |
| `accent-soft` | `#fce7e0` | Hintergrund aktiver Zustände |
| `urgent` | `#b83c36` | überfällig/heute |
| `green` | `#3f8f62` | erledigt |

### Farben — Dunkel
| Token | Wert |
|---|---|
| `paper` | `#1f242e` |
| `surface` | `#293241` |
| `surface-sunken` | `#191d25` |
| `ink` | `#f2ede0` |
| `ink-soft` | `#b6aea0` |
| `ink-faint` | `#aca492` |
| `accent` / `accent-strong` | `#f38a6e` |
| `accent-soft` | `#3a281f` |

> **Regel:** `accent` ist als *Textfarbe* zu hell (2,3–3,0:1). Für Text
> immer `accent-strong` verwenden. Alle Textfarben erfüllen WCAG AA
> (4,5:1) in beiden Modi — nachgemessen an den real gerenderten Elementen.

### Maße
| Token | Wert |
|---|---|
| Sidebar-Breite | 248px |
| Spalte, Mindestbreite | 240px |
| Sichtbare Spalten, max. | 3 |
| Fenster-Radius | 18px |
| Icon-Buttons (Löschen, Schließen) | 22×22px, Icon 14px |

### Bewegung
| Token | Wert | Verwendung |
|---|---|---|
| Kurve | `cubic-bezier(0.32, 0.72, 0, 1)` → in Flutter `Cubic(0.32, 0.72, 0.0, 1.0)` | alle Panel-/Sidebar-Bewegungen |
| Panel öffnen/schließen | 420ms | |
| Sidebar ein-/ausklappen | 400ms | läuft **gleichzeitig** mit der Spaltenbewegung |
| Kleine Zustandswechsel | 120–150ms | Hover, Fokus |

> Alle Bewegungen animieren ausschließlich `transform` (in Flutter:
> `Transform`/`AnimatedPositioned`), nie Layout-Eigenschaften.

---

## 4. Offene Festlegungen

Diese Punkte müssen **vor** dem Flutter-Bau entschieden werden.

### 4.1 Globales Tastenkürzel für Quick Capture
Quick Capture ist Kernprinzip („unter einer Sekunde"). Eingelöst wird es
erst durch ein **systemweites Kürzel**, das ein kleines Eingabefeld
öffnet, ohne die App zu wechseln. Das braucht eine systemnahe Komponente
(Hintergrundprozess, Autostart, Kürzel-Registrierung) und lässt sich
schlecht nachrüsten.
**Zu klären:** Welches Kürzel? Was passiert mit der erfassten Aufgabe —
feste Eingangsliste, oder Listenauswahl im Eingabefeld?

### 4.2 Datum und Zeitzonen
**Zu klären:**
- Wann beginnt „heute" — Mitternacht lokale Zeit?
- Was passiert um Mitternacht bei geöffneter App (aktualisiert sich die
  Heute-Seite von selbst)?
- Was passiert mit **überfälligen** Aufgaben von gestern — verschwinden
  sie oder erscheinen sie weiter in „Heute"?
- Verhalten bei Zeitzonenwechsel auf Reisen.

Datumslogik ist eine der zuverlässigsten Fehlerquellen überhaupt, und die
Heute-Seite ist eine der vier Kernfunktionen.

### 4.3 Regeln fürs Löschen (referentielle Integrität)
**Zu klären:**
- Was passiert mit den Unteraufgaben einer gelöschten Aufgabe?
- Was mit den Aufgaben einer gelöschten Liste?
- Was mit einer offenen Spalte, die auf etwas Gelöschtes zeigt? (Im
  Mockup wird der `panelStack` abgeschnitten — das ist die Reparatur eines
  Einzelfalls, kein Regelwerk.)
- Zusammenspiel mit dem beschlossenen **Papierkorb**: Ist Gelöschtes
  wiederherstellbar, und wie lange?

### 4.4 Formatierung und weitere Blocktypen
Vorgeschlagen, noch nicht entschieden (siehe Chatverlauf):
- **Textauswahl → schwebende Leiste**: Fett, Kursiv, Durchgestrichen, Link.
  Auf Mobile bringt `super_editor` das bereits mit (Lupe + Popover).
- **`/` am Zeilenanfang → Blockmenü**: Aufgabe, Überschrift, Trenner, Bild.
- **Markdown-Kürzel**: `# ` Überschrift, `- ` Aufgabe, `---` Trenner.
- Zusätzliche Blocktypen: **Überschrift** (nur eine Ebene) und **Trenner**
  ja; Aufzählung, Zitat, Tabellen, Code, Farben bewusst nein.

### 4.5 Schicksal des Mockups
Sobald diese Spezifikation vollständig ist, wird
`design/mockups/v1-desktop.html` **eingefroren** und als historische
Referenz gekennzeichnet. Ab dann ist dieses Dokument die Wahrheit — sonst
driften zwei Implementierungen auseinander und niemand weiß, welche gilt.
