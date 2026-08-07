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
| `heading` | `text: String` — eine Ebene, bewusst nicht mehr |
| `divider` | — |
| `task` | `id: String` — verweist auf eine Aufgabe in `subtasks`/`tasks` |
| `image` | `id: String`, `caption: String` |

Bewusst **nicht** vorgesehen: Aufzählungslisten (Aufgaben *sind* bei uns
die Aufzählungspunkte — zwei gleich aussehende Dinge wären verwirrend),
Zitate, Tabellen, Code und Textfarben. Das ist Notion-Gebiet und
widerspricht dem Konzept.

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
- `/` löst das Blockmenü **nur auf einer sonst leeren Zeile** aus, damit es
  beim normalen Schreiben nicht in die Quere kommt.

**Abstände:** Aufeinanderfolgende Blöcke stehen genauso dicht wie zwei
Textzeilen — **0px** zusätzlicher Abstand. Eine Aufgabenliste soll nicht
lockerer wirken als der Fließtext darüber.

> ⚠️ Umsetzungshinweis: Im Mockup baut das Speichern den Editor-Inhalt neu
> zusammen und verwirft dabei die Auswahl — der Cursor muss danach von Hand
> wiederhergestellt werden. In Flutter erledigt das der `DocumentComposer`,
> der Auswahl und Inhalt getrennt hält (siehe `research-superlist.md`).

> ⚠️ **Die ganze Konstruktion mit der eingeschobenen Leerzeile ist ein
> Notbehelf von `contenteditable` und gehört NICHT ins Flutter-Modell.** Im
> Browser gibt es neben einem nicht editierbaren Element schlicht keine
> Cursor-Position, deshalb muss dort eine unsichtbare Zeile stehen — mit
> allen Folgeproblemen (0px hohe Zeile ist nicht anklickbar, Cursor wird in
> der eingeklappten Höhe gezeichnet, Backspace löscht den Block daneben).
> `super_editor` hat dieses Problem nicht: Der Cursor sitzt dort auf einer
> **Knotenposition** im Dokumentmodell, unabhängig davon, ob der Knoten
> Text enthält, und wird selbst gezeichnet. Beim Umstieg entfallen also
> ersatzlos: die Leerzeilen zwischen Blöcken, das Auf-/Zuklappen, die
> eigene Trefferprüfung und der Backspace-Schutz.
>
> Übertragbar ist nur die **Regel**: Zwischen zwei Blöcken muss man Text
> schreiben können, und die Blöcke stehen dabei so dicht wie Textzeilen.

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
- Zeigt listenübergreifend alle Aufgaben mit Fälligkeitsdatum **heute oder
  früher** (überfällig), sofern nicht erledigt.
- Nur Aufgaben mit **eigenem** Datum. Eine übergeordnete Aufgabe erscheint
  nur, wenn sie selbst ein Datum hat.
- Aufbau: zuerst der Abschnitt **„Überfällig"** (ältestes zuerst, jede
  Zeile mit Punkt der Herkunftsliste), darunter **„Heute fällig"**,
  gruppiert nach Herkunftsliste.
- Der Zähler in der Sidebar umfasst beides.
- Details und Begründung siehe 4.2.

---

## 3. Design-Tokens

Direkt nach Flutter übertragbar — aus jeder Tabelle werden dort Konstanten.

> **Warum Skalen:** Eine Messung des Mockups ergab 12 Schriftgrößen (darunter
> 13, 13,3, 13,33 und 13,5 — vier, die niemand unterscheidet), 8 Radien und
> 13 Übergangsdauern, jede für sich gewachsen. Genau das lässt eine
> Oberfläche unruhig wirken, ohne dass man ein einzelnes falsches Element
> benennen könnte. **Keine neuen Werte einführen, immer eine Stufe wählen.**

### Schrift
| Stufe | Wert | Verwendung |
|---|---|---|
| `fs-xs` | 11px | Rubriken, Tastenkürzel, Zähler |
| `fs-sm` | 12px | Metatext, Fälligkeits-Pillen |
| `fs-md` | 13,5px | Fließtext, Standard |
| `fs-lg` | 15,5px | Überschrift auf einer Seite |
| `fs-xl` | 22px | Spaltentitel (Laufweite −0,02em) |

Stärken: `400` normal · `500` medium · `600` betont · `700` fett.

### Radien
| Stufe | Wert | Verwendung |
|---|---|---|
| `r-sm` | 6px | kleine Schaltflächen, Zeilen |
| `r-md` | 10px | Karten, Eingabefelder |
| `r-lg` | 16px | Menüs, Overlays |
| `r-pill` | 100px | Pillen |
| — | 18px | nur das App-Fenster |

### Abstände
`2 · 4 · 6 · 8 · 12 · 16 · 24` px.

### Bewegung
| Stufe | Wert | Verwendung |
|---|---|---|
| `dur-fast` | 120ms | Hover, Fokus |
| `dur-base` | 200ms | Zustandswechsel |
| `dur-slow` | 400ms | Panels, Sidebar |
| Kurve | `cubic-bezier(0.32, 0.72, 0, 1)` → Flutter `Cubic(0.32, 0.72, 0.0, 1.0)` | überall dieselbe |

Alle Bewegungen animieren ausschließlich `transform`, nie Layout-Eigenschaften.

### Höhen (Schatten)
| Stufe | Verwendung |
|---|---|
| `el-1` | leicht abgehobene Fläche |
| `el-2` | schwebendes Menü (Fälligkeit, „/", Auswahl-Leiste) |
| `el-3` | Overlay, App-Fenster |

### Farben — Hell
| Token | Wert | Verwendung |
|---|---|---|
| `paper` | `#faf7f1` | Hintergrund außerhalb des Fensters |
| `surface` | `#ffffff` | Spaltenflächen |
| `surface-sunken` | `#eae0cc` | Sidebar |
| `nav-hover` | `#f2ecdf` | Zeile beim Überfahren — **hellt auf**, in beiden Modi |
| `chip-bg` / `chip-hover` | `#f2ecdf` / `#fbf8f1` | kleine Schaltflächen |
| `tree-line` | `#c4b189` | Verbindungslinien der Gruppen |
| `line` | `#ddd0af` | Rahmen |
| `line-soft` | `#ece3cc` | leichte Trenner |
| `ink` | `#293241` | Haupttext |
| `ink-soft` | `#464d5b` | Sekundärtext |
| `ink-faint` | `#5c626b` | Zähler, Meta, Platzhalter |
| `accent` | `#ee6c4d` | Flächen, Icons, Logo, Dekoration |
| `accent-strong` | `#b32f10` | **Akzentfarbe für Text** |
| `accent-soft` | `#fce7e0` | Hintergrund aktiver Zustände |
| `urgent` | `#b83c36` | überfällig / heute |
| `done` / `done-ink` | `#6f757e` / `#ffffff` | Erledigt-Marke |

### Farben — Dunkel
| Token | Wert |
|---|---|
| `paper` | `#1f242e` |
| `surface` | `#293241` |
| `surface-sunken` | `#191d25` |
| `nav-hover` | `#333a48` |
| `chip-bg` / `chip-hover` | `#293241` / `#3a4457` |
| `tree-line` | `#4a5468` |
| `ink` / `ink-soft` / `ink-faint` | `#f2ede0` / `#b6aea0` / `#aca492` |
| `accent` / `accent-strong` | `#f38a6e` |
| `accent-soft` | `#3a281f` |
| `done` / `done-ink` | `#8d97ab` / `#1f242e` |

### Listenfarben
Eine **kurierte Reihe aus derselben warmen Familie** — vorher waren Petrol
und Blauviolett dabei, die neben Orange/Sand/Navy als Fremdkörper wirkten.

| Hell | Dunkel | |
|---|---|---|
| `#9c7f6b` | `#bb9c86` | Lehm |
| `#6f8265` | `#8fa383` | Salbei |
| `#c25a3a` | `#e07d5c` | Terrakotta |
| `#5b7183` | `#7d95aa` | Taubenblau |
| `#b8873a` | `#d4a457` | Ocker |

### Icons
Alle Icons werden mit **derselben effektiven Strichstärke von 1,25px**
gezeichnet. Entscheidend ist nicht die Zahl im `stroke-width`, sondern
`stroke-width × (Anzeigegröße ÷ viewBox)` — bei unterschiedlichen viewBoxen
ergibt dieselbe Zahl unterschiedliche Strichstärken. Im Mockup lagen sie
vorher zwischen 1,03px und 1,62px, was aussah wie Icons aus mehreren Sätzen.

| Größe | Verwendung |
|---|---|
| 14px | Standard: Menüs, Schaltflächen, Zeilen |
| 10px | Chevron einer Gruppe |
| 9px | Häkchen **innerhalb** der Checkbox |

Ecken und Enden durchgängig gerundet (`stroke-linecap`/`-linejoin: round`).

### Regeln
- **`accent` ist als Textfarbe zu hell** (2,3–3,0:1). Für Text immer
  `accent-strong`. Alle Textfarben erfüllen WCAG AA (4,5:1) in beiden Modi —
  an den real gerenderten Elementen nachgemessen, nicht nur gerechnet.
- **Hover hellt immer auf**, in beiden Modi. Nie abdunkeln.
- **Farbe ist nie der einzige Träger einer Information.** Die
  Überfällig-Markierung trägt zusätzlich einen Rahmen.
- **Erledigtes tritt zurück.** Die Marke ist gedämpft, nicht kräftig — sie
  liegt auf demselben Gewicht wie der durchgestrichene Text daneben.
- **Textmarkierung und Fokusringe** kommen aus der Palette, nicht vom
  Browser. Fokusringe nur bei Tastaturbedienung (`:focus-visible`).

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

### 4.2 Datum und Zeitzonen — ✅ ENTSCHIEDEN (2026-08-06)

- **Speicherung: reines Kalenderdatum**, kein Zeitstempel und keine
  Zeitzone (`"2026-08-14"`). Eine Aufgabe, die am 14. fällig ist, ist
  überall auf der Welt am 14. fällig. Damit entfällt die gesamte
  Zeitzonen-Fehlerklasse, inklusive Reisen — es gibt schlicht nichts
  umzurechnen. Verglichen wird per Zeichenkette.
- **„Heute" beginnt um Mitternacht lokaler Zeit.**
- **Überfälliges bleibt sichtbar.** Aufgaben mit Datum in der
  Vergangenheit, die nicht erledigt sind, verschwinden nicht, sondern
  erscheinen weiter auf der Heute-Seite — in einem **eigenen Abschnitt
  ganz oben**, ältestes zuerst. Begründung: Eine Aufgabe stillschweigend
  fallenzulassen ist bei einer Todo-App der schwerere Fehler als eine
  volle Liste. Der Nutzer soll sehen, was liegengeblieben ist.
- **Erledigtes zählt nie als überfällig**, unabhängig vom Datum.
- **Kennzeichnung nicht allein über Farbe:** Die Überfällig-Markierung
  trägt zusätzlich einen Rahmen, damit sie auch bei Farbfehlsichtigkeit
  erkennbar bleibt.
- **Bei geöffneter App um Mitternacht** muss sich die Heute-Seite
  selbstständig aktualisieren (Zeitgeber auf den nächsten Tageswechsel).
  ⚠️ Im Mockup nicht umgesetzt — das Datum ist dort fest verdrahtet,
  damit die Demo reproduzierbar bleibt. **In Flutter zu implementieren.**

**Datum setzen:** Im Kopf der Aufgabenseite. Ohne Datum eine Einladung
(„Fällig am …"), mit Datum die Fälligkeits-Pille; beides öffnet dasselbe
Menü: Heute · Morgen · Nächste Woche · Datum wählen · Entfernen. Die drei
Schnellwahlen decken den Alltag ab, ohne den Kalender zu öffnen — das ist
der Quick-Capture-Gedanke, angewandt auf Datumsvergabe.

### 4.3 Regeln fürs Löschen (referentielle Integrität)
**Zu klären:**
- Was passiert mit den Unteraufgaben einer gelöschten Aufgabe?
- Was mit den Aufgaben einer gelöschten Liste?
- Was mit einer offenen Spalte, die auf etwas Gelöschtes zeigt? (Im
  Mockup wird der `panelStack` abgeschnitten — das ist die Reparatur eines
  Einzelfalls, kein Regelwerk.)
- Zusammenspiel mit dem beschlossenen **Papierkorb**: Ist Gelöschtes
  wiederherstellbar, und wie lange?

### 4.4 Formatierung und weitere Blocktypen — ✅ ENTSCHIEDEN (2026-08-06)

**Leitgedanke: keine dauerhafte Werkzeugleiste.** Eine Leiste kostet
Platz und Ruhe, auch wenn man sie nie benutzt. Alle drei Zugänge sind
unsichtbar, bis man sie braucht:

1. **Textauswahl → schwebende Leiste** mit Fett, Kursiv,
   Durchgestrichen, Link. Erscheint über der Auswahl, verschwindet beim
   Abwählen. Auf Mobile bringt `super_editor` eine gleichwertige
   Popover-Leiste inklusive Lupe bereits mit.
2. **`/` auf einer sonst leeren Zeile → Blockmenü**: Aufgabe,
   Überschrift, Trenner, Bild.
3. **Markdown-Kürzel, ganz ohne Oberfläche**: `# ` Überschrift,
   `- ` Aufgabe, `---` Trenner.

**Bewusst nicht enthalten:** Schriftgrößen, Schriftarten und Textfarben.
Mehr als eine Überschriftenebene ist für unsere Seitengrößen Overhead.

**Untere Leiste:** Der Knopf „+ Aufgabe" wurde entfernt — das
Schnellerfassungsfeld direkt darunter deckt das ab, und das `/`-Menü den
Rest. Übrig bleibt „+ Bild" als sichtbarer Einstieg.

### 4.5 Schicksal des Mockups
Sobald diese Spezifikation vollständig ist, wird
`design/mockups/v1-desktop.html` **eingefroren** und als historische
Referenz gekennzeichnet. Ab dann ist dieses Dokument die Wahrheit — sonst
driften zwei Implementierungen auseinander und niemand weiß, welche gilt.

### 4.6 Suche / Befehlspalette (⌘K) — 📋 MERKLISTE

**Noch nicht gebaut, aber beschlossen als Lücke.** Es gibt derzeit keine
Suche. Bei unbegrenzt verschachtelten Aufgaben ist eine Aufgabe drei
Ebenen tief nur durch Durchklicken auffindbar — das ist eine echte
Funktionslücke, keine Verfeinerung.

Vorgesehene Form (angeregt durch eine vom Nutzer gezeigte Referenz-App):
- **⌘K** öffnet ein zentriertes Fenster, Esc schließt es.
- Tippen sucht live über alle Listen und Aufgaben, mit Pfadangabe
  (z.B. „Persönlich › Urlaub planen").
- Enter springt hin: Liste öffnen und die Spalten bis zur Aufgabe
  aufklappen.
- **Findet die Suche nichts, bietet dasselbe Feld an, eine Aufgabe mit dem
  eingegebenen Text anzulegen.** Damit sind Suche und Quick Capture ein
  einziges Fenster — der Xdo-Gedanke in Reinform.

Hängt eng mit 4.1 zusammen: Dasselbe Fenster sollte das globale
Tastenkürzel bedienen, damit Erfassen von überall aus funktioniert.
