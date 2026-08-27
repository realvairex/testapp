# Spezifikation: Unfold

Stand: 2026-08-13 · **Status: in Arbeit**

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

### 2.0 Der Eingang — ✅ ENTSCHIEDEN (2026-08-07)

Ein **Ort**, keine Liste des Nutzers. Hier landet alles, was erfasst, aber
noch nicht einsortiert wurde.

- Steht in der **Übersicht über „Heute"**, trägt ein Symbol statt eines
  Farbpunkts (er hat kein Thema) und ist die **Startansicht**.
- Lässt sich **nicht** umbenennen, löschen, umsortieren oder in eine
  Gruppe ziehen. Feste ID `inbox`.
- **Keine Bild-Leiste**: Hier wird erfasst, nicht gestaltet. Das
  Erfassungsfeld steht unten wie überall, mit dem Platzhalter
  „Was ist zu tun?".
- **Einsortiert wird durch Ziehen** einer Aufgabe auf eine Liste in der
  Sidebar — in **beide** Richtungen, auch zurück in den Eingang.

> **Der Gedanke dahinter:** Erfassen und Einsortieren sind getrennte
> Vorgänge. Beim Notieren muss man nicht wissen, wohin es gehört — nur so
> gelingt die „unter einer Sekunde" aus `concept.md` §3. Deshalb hat der
> Eingang **keine Eigenschaften**: kein Thema, kein Datum, keine Liste.
> Jede Eigenschaft wäre eine Entscheidung, die er gerade aufschieben soll.

**Bewusst nicht enthalten:** ein Stern für „wichtig" (zweite, parallele
Ordnung neben Datum und Liste — wird bedeutungslos, weil mit der Zeit
alles wichtig wird; Dringlichkeit trägt die Heute-Seite) und
Tastenkürzel für die Triage (vom Nutzer abgelehnt).

**Unteraufgaben im Eingang sind erlaubt** (2026-08-11). Ich hatte das
Gegenteil erwogen — der Eingang soll ja keine Eigenschaften tragen, und
eine Unteraufgabe ist eine. Der Nutzer hat widersprochen, und zu Recht:
Wer „Umzug" notiert und im selben Atemzug „Kartons besorgen" darunter
schreibt, hat nichts einsortiert, sondern **einen Gedanken zu Ende
gedacht**. Das ist genau der Vorgang, den der Eingang schützen soll.
Ein Verbot würde ihn unterbrechen, um eine Regel zu retten, die für den
*anderen* Fall gedacht war. Der Aufräum-Modus verschiebt eine Aufgabe
ohnehin **samt ihrem Unterbau**, siehe 2.8.

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
- **Das Fenster hört bei 490 px auf zu schrumpfen** (Sidebar 248 px + eine
  Spalte in Mindestbreite 240 px). Reicht der Platz nicht, scrollt die
  **Seite** waagerecht statt des Fensterinnenraums, und ihr Außenabstand
  von 24 px bleibt erhalten. Ein Fenster unter die Summe seiner
  unteilbaren Bestandteile zu quetschen zeigt nur noch Bruchstücke.

### 2.2 Erledigt-Kaskade
- Eine Aufgabe abhaken hakt **alle** ihre Unteraufgaben mit ab (nach unten).
- Nach jeder Änderung wird nach **oben** neu berechnet: Eine Aufgabe gilt
  genau dann als erledigt, wenn sie mindestens eine Unteraufgabe hat und
  **alle** erledigt sind.
- Eine Aufgabe **ohne** Unteraufgaben behält ihren Zustand unverändert.
- Sobald eine Aufgabe Unteraufgaben hat, zeigt sie einen Fortschrittsbalken
  (erledigte ÷ gesamte direkte Kinder).
- **Der Balken läuft**, vorwärts wie rückwärts, mit derselben Bewegung wie
  der im Aufräum-Modus: über `transform: scaleX`, Kurve `ease-lauf`, Dauer
  `dur-slow + dur-base`. Es ist dieselbe Aussage — „es ist mehr geworden" —,
  also muss sie sich gleich anfühlen. Derselbe Fallstrick wie dort: Die
  Zeile wird bei jeder Änderung neu aufgebaut, deshalb muss der Balken mit
  dem **alten** Wert entstehen und erst im nächsten Bild auf den neuen
  gesetzt werden.

> ⚠️ **Ein Neuaufbau darf nicht kosten, was der Nutzer eingestellt hat.**
> Scrollstand und Cursorposition gehören ihm, nicht der Ansicht. Im Mockup
> sprang eine lange Liste beim Abhaken einer Aufgabe nach ganz oben, und
> der Cursor aus einem Eingabefeld verschwand — beides, weil der
> Inhaltsbereich in einem Stück ersetzt wird. Das ist der zweite Teil
> desselben Gefühls: nicht die Animation, sondern der **Verlust**. In
> Flutter tragen `ScrollController` und `FocusNode` diesen Zustand über
> einen Rebuild hinweg — aber nur, wenn sie außerhalb des neu gebauten
> Teilbaums leben. Wer sie im Widget selbst anlegt, hat denselben Fehler.
>
> ⚠️ **Einblenden ist für Neues.** Eine Aufgabenzeile blendet **nur** ein,
> wenn sie wirklich neu dazugekommen ist — nie, weil die Ansicht neu
> gezeichnet wurde. Im Mockup hing die Animation unbedingt an jeder Zeile
> und lief damit bei jedem Klick; für das Auge war das ein ständiges
> Aufblitzen der Liste. In Flutter ist die Falle dieselbe: Eine
> Einblend-Animation an einem Listeneintrag, der bei jedem Zustandswechsel
> neu gebaut wird, läuft jedes Mal. Sie gehört an den **Eintritt in die
> Liste**, nicht an den Aufbau des Widgets.
>
> ⚠️ **Eine Änderung darf nur ihre Zeile betreffen.** Im Mockup baut jede
> Änderung — ein Kästchen abhaken, eine Seite öffnen — **alle sichtbaren
> Spalten samt Editoren** neu auf; das blitzt sichtbar auf und war dem
> Nutzer beim Ausprobieren sofort unangenehm aufgefallen (2026-08-11).
> Das ist ein Notbehelf der HTML-Erprobung, **kein Entwurfsmuster**. In
> Flutter wird nur neu gebaut, was sich geändert hat: Der Fortschritt einer
> übergeordneten Aufgabe, ihr Erledigt-Zustand und der Zähler in der
> Sidebar sind **abgeleitete Werte**, die ihre eigenen Widgets neu zeichnen
> — nicht die Spalte, in der sie stehen. Wer beim Bau eine
> „alles neu zeichnen"-Abkürzung nimmt, holt sich genau dieses Flackern
> zurück.
>
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
- Verschiebbar sind: Listen und Gruppen in der Sidebar, Blöcke innerhalb
  einer Seite, sowie **Aufgaben von einer Seite auf eine Liste in der
  Sidebar** (= Einsortieren, siehe §2.0). Bilder nicht — ein Bild gehört
  zu seiner Seite.
- **Blöcke** werden an einem eigenen Griff gezogen (die Zeile selbst ist
  klickbar und liegt in editierbarem Text).
- **Sidebar-Zeilen** werden direkt gezogen; eine Berührung unterhalb von
  4px Bewegung bleibt ein normaler Klick.
- Ablageziel ist **jeder** Block, nicht nur andere Blöcke desselben Typs —
  eine Aufgabe muss auch zwischen zwei Textzeilen landen können.
- Eine Liste kann auf eine Gruppe gezogen werden (= in die Gruppe
  aufnehmen) oder zwischen zwei Listen (= umsortieren).

#### Aufgabe auf Aufgabe = Unteraufgabe — ✅ ENTSCHIEDEN (2026-08-13)

Eine Aufgabe lässt sich auf eine **andere Aufgabe** ziehen und wird deren
Unteraufgabe. Vorher ging nur der Weg auf eine Liste in der Sidebar; das
Datenmodell (§1) kennt beliebig tiefe Verschachtelung, das Ziehen kam
nicht hinterher.

Wohin genau, entscheidet die **Höhe des Zeigers in der Zielzeile**:

| Zone | Wirkung |
|---|---|
| oberes Drittel | daneben, davor |
| **Mitte** | **hinein** (wird Unteraufgabe, hinten angehängt) |
| unteres Drittel | daneben, dahinter |

**„Hinein" gilt für jede sichtbare Aufgabenzeile, auch in einer anderen
Spalte** — sonst wäre eine Aufgabe, die auf der eigenen Seite gar nicht
steht, unerreichbar. **„Daneben" gibt es dagegen nur auf der Seite, auf
der gerade sortiert wird.** In einer fremden Spalte zählt deshalb die
**ganze Zeile** als „hinein": Ein Drittel, das nichts tut, sähe aus wie
ein Fehler.

> ⚠️ **Noch nicht gebaut:** „daneben" über Spaltengrenzen hinweg — eine
> Aufgabe also als *Geschwister* in eine fremde Seite einzusortieren. Wer
> das nachrüstet, braucht ein Einhängen an einer **Position** statt am
> Ende; die Bausteine dafür (`knotenAushaengen`/`knotenEinhaengen` im
> Mockup) tragen den Index bereits.

**Keine Tiefenbegrenzung.** Eine Grenze müsste erklärt werden („warum geht
hier nichts mehr rein?") und löst das eigentliche Problem nicht: Das ist
nicht die Tiefe, sondern das **Wiederfinden**. Dafür ist die Suche
zuständig (§4.6), nicht ein Limit.

**Der Kreisfall wird gar nicht erst angeboten.** Zieht man eine Aufgabe
über ihren eigenen Unterbau — beliebig tief —, erscheint **keine
Ablagemarkierung**; Loslassen bewirkt nichts und die Zeile springt zurück.
Dasselbe gilt, wo die Ablage folgenlos wäre: über der Aufgabe selbst und
über einem Ziel, dessen direktes Kind sie schon ist.

> **Warum nicht erlauben und hinterher melden:** Der Nutzer soll beim
> Ziehen *sehen*, dass dort nichts hingeht, statt es nach dem Loslassen zu
> erfahren. Das ist derselbe Grundsatz wie beim Kopf der Listenspalte
> (§2.5): Der Zustand ist ablesbar, ohne dass man etwas ausprobieren muss.
>
> **Und warum es nicht bloß Kosmetik ist:** Ein Baum, der sich selbst
> enthält, lässt das Hochrechnen der Erledigt-Kaskade (§2.2) im Kreis
> laufen. Im Mockup steht dort bereits eine Notbremse gegen genau diese
> Lage — besser, sie entsteht gar nicht erst. In Flutter gehört die
> Prüfung deshalb in den Bearbeitungs-Pfad, nicht in die Zieh-Oberfläche:
> Die Oberfläche entscheidet, was sie **anbietet**, das Modell entscheidet,
> was es **zulässt**. Beides ist nötig.

**Beim Verschieben werden die abgeleiteten Werte in beide Richtungen
nachgezogen:** Das Ziel bekommt ein Kind mehr und kann dadurch unfertig
werden, der bisherige Besitzer eines weniger und dadurch fertig. Die
beiden müssen **getrennt** nachgerechnet werden — zieht man aus einer
Spalte rechts in eine Aufgabe links, liegen sie in verschiedenen Zweigen
und einer ist kein Vorfahr des anderen.

#### Die Ablagemarke sieht überall gleich aus

Ob eine Liste in eine Gruppe wandert oder eine Aufgabe unter eine andere —
es ist dieselbe Aussage („hier landet es"), also hat sie **dieselbe Form**:
Die Marke sitzt auf einer Zeile mit `r-md`, und ihre Linie **folgt der
Rundung**, biegt an den Enden also weich ab. Kein hart auslaufender
Strich.

> Am 2026-08-13 vom Nutzer bemerkt: In der Sidebar war sie gerundet, an
> der Aufgabenzeile lief sie eckig aus. Es war kein Entwurf, sondern ein
> Versehen — die Aufgabenzeile trug schlicht keinen Radius, und der
> `inset`-Schatten hat nichts, dem er folgen könnte. Der Radius gilt
> **nur im Ablagezustand**; dauerhaft gesetzt würde er zusammen mit dem
> Zuschnitt der Zeile den Ziehgriff an den Ecken beschneiden.

Geprüft von `test_unteraufgabe.js` (23 Zusicherungen) — die Rundung wird
dabei **gegen die Sidebar** gemessen, nicht gegen eine Zahl: Die beiden
sollen gleich aussehen, nicht zufällig beide gerundet sein.

### 2.5 Kopf einer Listenspalte — ✅ ENTSCHIEDEN (2026-08-07)

Farbpunkt, dann Titel. Kein Menü.

- **Umbenennen:** Der Titel **ist** ein Eingabefeld. Hineinklicken, tippen,
  fertig — die Sidebar zieht bei jedem Anschlag mit. Kein Bestätigen, kein
  Menüpunkt, keine zusätzliche Klickstufe.
- **Farbe ändern:** Der Punkt links vom Titel zeigt die Farbe **und** ist
  der Weg, sie zu ändern. Ein Klick klappt die fünf kuratierten Farben als
  Reihe **unter** dem Titel auf — im Fluss, nicht als schwebendes Fenster,
  damit nichts verdeckt wird und der Titel nicht zur Seite springt. Die
  gewählte Farbe trägt einen Ring (nicht nur eine andere Größe).
- **In Gruppe verschieben** und **Löschen** bekommen hier **keinen**
  Zugang. Beides gibt es bereits in der Sidebar — Ziehen auf eine Gruppe
  bzw. der Papierkorb beim Überfahren. Ein zweiter Weg zum selben Ziel
  kostet Platz und stiftet Zweifel, welcher der richtige ist.

> **Grundsatz, der hier zum ersten Mal ausformuliert ist:** Eine Aktion
> bekommt **einen** Ort. Wo eine Eigenschaft angezeigt wird, wird sie auch
> geändert. Overlays sind die letzte Wahl, nicht die erste — sie verdecken
> den Gegenstand der Entscheidung und kosten zwei Klicks für einen Wert.
> Angewandt auch auf die Fälligkeit (§4.2) und den Darstellungs-Schalter.
>
> **Die Grundhaltung steht in `concept.md`, Design-Richtung:** Overlays
> werden so weit wie möglich vermieden. Was mehr Platz braucht, klappt im
> Fluss auf oder die Seite übernimmt.
>
> **Und wenn doch eines nötig ist** — wie beim Kalender, den man schlecht
> dauerhaft aufgeklappt lässt —, dann verankert am **nächstgelegenen
> begrenzten Behälter** (der Spalte), nicht am Fenster. Nur so schiebt es
> keinen Inhalt weg *und* wird nicht am Rand abgeschnitten.

### 2.6 Aufgabenzeile

Aufbau von links: Kästchen · [Herkunftspunkt] · Titel · [Fortschritt] ·
[Fälligkeits-Pille]. Alles **linksbündig aneinander**, nicht auf die
Zeilenbreite verteilt.

- Der **Titel nimmt nur die Breite seines Textes** und schrumpft erst,
  wenn es eng wird; dann kürzt er mit „…". Fortschritt und Pille
  schrumpfen **nie** — sonst würde die Information gekürzt statt des
  Titels.
- **Das Kästchen springt beim Umschalten kurz an** (2026-08-13): von 0,6
  auf 1,2 mit 15° Drehung und zurück, **400 ms** auf `--ease`. Es bleibt
  dabei **eckig** (`--r-sm`) — die Bewegung stammt aus einer fremden
  Vorlage, die Form nicht.
  - **In beide Richtungen**, auch beim Zurücknehmen (Festlegung des
    Nutzers). Abweichend von der sonstigen Regel, dass Federndes nur dort
    steht, wo etwas *ankommt*: Hier ist es die Quittung auf einen Druck,
    und ein Druck fühlt sich in beide Richtungen gleich an.
  - Der Überschwinger steckt in den **Bildern**, nicht in der Kurve.
    Deshalb `--ease` und nicht `--ease-spring` — sonst schwingt es zweimal
    über.
  - **Ausgelöst wird sie von der Handlung, nie vom Zustand.** Hinge sie an
    „ist erledigt", liefe sie bei jedem Neuaufbau für jede erledigte
    Aufgabe erneut — genau das „Refreshen" aus §2.2. Nur das *angeklickte*
    Kästchen springt, nicht die per Kaskade miterledigten Unteraufgaben.
  - Geprüft von `test_kaestchen.js`.
- **Keine rechtsbündige Datumsspalte.** Sie wäre die übliche Lösung,
  entsteht hier aber gar nicht: Nur ein Teil der Aufgaben hat ein Datum,
  der rechte Rand bliebe löchrig. Und in einem Dokument gehört eine
  Auszeichnung neben ihren Gegenstand, nicht ans Zeilenende.
- **Das Datum steht nicht unter dem Titel** (Superlist-Muster). Das
  verdoppelt die Zeilenhöhe und macht aus einer überfliegbaren Liste eine
  Reihe zweizeiliger Karten.

- Der **Löschknopf** erscheint beim Überfahren **im Fluss hinter dem
  Inhalt**, nicht am rechten Zeilenrand — dort klaffte sonst eine Lücke
  von mehreren hundert Pixeln. Er belegt seinen Platz auch unsichtbar,
  damit die Zeile beim Überfahren nicht springt.

### 2.7 Heute-Seite
- Zeigt listenübergreifend alle Aufgaben mit Fälligkeitsdatum **heute oder
  früher** (überfällig), sofern nicht erledigt.
- Nur Aufgaben mit **eigenem** Datum. Eine übergeordnete Aufgabe erscheint
  nur, wenn sie selbst ein Datum hat.
- Aufbau: zuerst der Abschnitt **„Überfällig"** (ältestes zuerst, jede
  Zeile mit Punkt der Herkunftsliste), darunter **„Heute fällig"**,
  gruppiert nach Herkunftsliste.
- Der Zähler in der Sidebar umfasst beides.
- Details und Begründung siehe 4.2.

### 2.8 Aufräum-Modus — ✅ ENTSCHIEDEN (2026-08-11)

Ein **geführter Durchgang** durch den Eingang: Er zeigt die offenen
Aufgaben **eine nach der anderen** und stellt zu jeder die drei
Entscheidungen groß und direkt zur Wahl. Er endet, wenn keine mehr
übrig ist.

> **Der Gedanke:** Xdo lässt einen selbst durch die Liste wischen. Ein
> geführter Durchgang macht aus einer Pflicht eine Abfolge von Sekunden.
> Das ist die eigentliche Weiterentwicklung gegenüber dem Vorbild — und
> der Grund, warum der Modus sich **gut anfühlen muss**: Ein
> Aufräum-Werkzeug, das niemand freiwillig öffnet, ist wertlos, egal wie
> richtig es funktioniert.

#### Wo er lebt

**Die Spalte übernimmt** — kein Overlay, kein Vollbild, kein Dialog.
Sidebar, Fenster und Spaltenrahmen bleiben stehen; nur der Inhalt der
Eingang-Spalte wird ausgetauscht. Das folgt der Design-Richtung aus
`concept.md` („Overlays so gut es geht vermeiden") und hat einen
praktischen Grund dazu: Die Zielliste, in die gerade einsortiert wird,
muss **sichtbar bleiben** — sie ist das Ziel der Wegflug-Bewegung.

Gestartet wird über einen Knopf im Kopf der Eingang-Spalte. Er ist **nur
benutzbar, wenn dort etwas Offenes liegt** — ein Knopf, der auf einen
leeren Eingang zeigt, wäre eine Aufforderung ins Leere.

> **Sein Platz bleibt aber reserviert** (2026-08-13, nach einem Fund aus
> der echten Nutzung). Die Kopfzeile ist so hoch wie ihr größtes Element;
> Titel (`fs-xl` × 1,2 = 26,4 px) und Knopf (~26 px) liegen nur **0,4 px**
> auseinander, und die Knopfhöhe hängt an der **Systemschrift**. Wo der
> Knopf minimal höher rendert, bestimmt er die Höhe — und beim Abhaken der
> letzten Aufgabe rutschte die ganze Spalte sichtbar auf und ab. Beim
> Entwickler (Linux/DejaVu) trat es **nicht** auf, beim Nutzer
> (Windows/Segoe UI) schon.
>
> Der Knopf wird deshalb immer angelegt und bei leerem Eingang nur
> unsichtbar geschaltet (`visibility: hidden`) — weder klickbar noch im
> Tab-Verlauf noch für Screenreader. **Ein Layout, dessen Stabilität auf
> 0,4 px Vorsprung beruht, ist nicht robust, sondern hatte Glück.**
> Geprüft von `test_kopf_stabil.js`, und zwar bei **vier** Schriftgrößen —
> bei unserer eigenen allein wäre die Prüfung grün gewesen.

#### Aufbau der Seite

1. **Kopfzeile** — „AUFRÄUMEN" als leise Rubrik (`fs-xs`, Großbuchstaben)
   + Knopf „Fertig" rechts
2. **Fortschritt** — `n von m` und ein 3 px hoher Balken in `--accent`,
   **mit einer Kerbe je Aufgabe** (bis zwölf; darüber wären die Stücke zu
   schmal). Der Balken läuft damit sichtbar auf den *nächsten Punkt* zu,
   statt nur länger zu werden.
3. **Die Aufgabe** — Titel in `fs-xl`, darunter der erste Textblock
   ihrer Seite als leise Zeile (`ink-faint`), falls vorhanden, sowie
   **was sie schon mitbringt**: ein gesetztes Datum als Pille (überfällig
   entsprechend markiert) und der Hinweis, wie viele Unteraufgaben
   mitwandern. Ein vorhandenes Datum hinter den Knöpfen zu verstecken
   wäre eine verschwiegene Entscheidungsgrundlage — es ist genau die
   Angabe, die „Wann?" beeinflusst.

> **Rangfolge der Schrift:** In der ganzen App trägt `fs-xl` das, was man
> gerade ansieht — eine Spalte zeigt so ihren Titel. Der Gegenstand
> dieses Bildschirms ist **die Aufgabe**, nicht der Name des Modus.
> Deshalb steht sie auf `fs-xl` und „Aufräumen" auf der Rubrikenschrift.
> Andersherum (Stand 2026-08-11 vormittags) stellte es die Rangfolge der
> App auf den Kopf und fiel sofort als Unstimmigkeit auf.
>
> Aus demselben Grund sitzt die Aufgabe **oben**, direkt unter dem
> Balken, und nicht senkrecht mittig: Der Zusammenhang zwischen
> Fortschritt und Aufgabe ist wichtiger als eine optische Mitte.
4. **Drei Rubriken** (`fs-xs`, Großbuchstaben, `ink-faint`):
   - **IN WELCHE LISTE?** — je eine Pille pro Liste, mit Farbpunkt,
     zuletzt `+ Neue Liste`: klappt ein Namensfeld **an Ort und Stelle**
     auf, legt die Liste an und sortiert die Aufgabe gleich hinein
   - **WANN?** — `Heute` · `Morgen` · `Datum wählen`
   (kein dritter Rubrikblock — „Erledigt" steht separat, siehe 5.)
5. **„Erledigt"** — **mittig am unteren Rand** des Inhaltsbereichs,
   24 px über der Fußzeile, mit großem Abstand zu den Rubriken. In der
   **Akzentfarbe als Kontur**, beim Überfahren gefüllt.

   > Er stand zuerst unter einer Rubrik „ODER". Das war doppelt falsch:
   > Eine Rubrik mit genau **einem** Knopf liest sich wie ein Rest —
   > Rubriken bündeln mehrere Dinge. Und „Erledigt" **ordnet nicht ein,
   > es beendet**; in der Reihe der Einordnungen hatte es nichts zu
   > suchen. Der Abstand sagt das, ohne ein Wort dafür zu brauchen.
   >
   > **Kontur statt gefüllter Fläche:** Wäre er die einzige gefüllte
   > Akzentfläche auf dem Bildschirm, wäre er der optische Schwerpunkt —
   > die Seite lüde zum Abhaken ein, obwohl sie zum **Einsortieren**
   > einladen soll.
   >
   > Er liegt **außerhalb der Karte** und fliegt deshalb nicht mit: Er
   > löst die Bewegung aus, er ist nicht Teil von ihr.

6. **Fußzeile** — `‹ Zurück` links, `Später ›` rechts

#### Erledigt und Löschen sind hier dasselbe — also gibt es einen Knopf

Innerhalb einer **Liste** ist der Unterschied echt: Erledigtes bleibt
durchgestrichen stehen, zählt in „3 von 7 erledigt" und füllt den
Fortschritt der übergeordneten Aufgabe. Es ist ein **Beleg**.

Im **Eingang** bricht das zusammen. Eine abgehakte Eingangs-Aufgabe hat
keinen Ort — sie bliebe als durchgestrichene Zeile liegen, obwohl der
Eingang für *Unsortiertes* da ist und etwas Erledigtes per Definition
nicht mehr unsortiert ist. Der Unterschied wäre benannt, aber nicht
gebaut.

Deshalb hat der Aufräum-Modus **einen** Knopf: **„Erledigt" hakt ab und
räumt aus dem Eingang.** Wiederherstellbar über „Zurück", danach über den
Papierkorb (§4.3). „Löschen" bleibt in den Listen erhalten und fällt nur
hier weg. Entschieden vom Nutzer am 2026-08-11, nachdem er die Frage
gestellt hatte: *„in meinem Kopf sollten Erledigt und Löschen das gleiche
sein."*

#### Verhalten

- **Eine Entscheidung genügt.** Jeder Knopf führt die Aktion aus **und**
  rückt weiter. Wer Liste *und* Datum setzen will, setzt zuerst das
  Datum (bleibt stehen, siehe unten) und dann die Liste.
- **WANN? rückt nicht weiter**, wenn die Aufgabe noch im Eingang liegt —
  ein Datum ohne Liste lässt sie dort. Der gewählte Wert wird an der
  Pille markiert. Erst die Listenwahl schließt die Aufgabe ab.
- **Später** überspringt, ohne etwas zu ändern. Die Aufgabe bleibt im
  Eingang und kommt **im selben Durchgang nicht wieder** — sonst dreht
  sich der Modus im Kreis. Es entsteht **kein dauerhafter Zustand**
  („zurückgestellt" als Eigenschaft gibt es nicht).
- **Zurück** nimmt den letzten Schritt zurück — Verschieben, Datum,
  Erledigt, Löschen und Überspringen gleichermaßen — und zeigt die
  Aufgabe erneut. Der Durchgang ist damit vollständig umkehrbar,
  solange er läuft.
- **Verlassen** über „Fertig" oder `Escape`. Was entschieden wurde,
  bleibt entschieden; der Rest bleibt im Eingang.
- Die **Warteschlange steht beim Start fest**. Was währenddessen neu in
  den Eingang kommt (Quick Capture), taucht erst im nächsten Durchgang
  auf.
- **Erledigt** zeigt **keine** Rückgängig-Zeile wie sonst das Löschen
  (§4.3) — es gibt keine Zeile, an der sie stehen könnte. „Zurück" ist
  hier das Rückgängig; danach übernimmt der Papierkorb.

#### Das Belohnungsgefühl — verbindlich, nicht Zierrat

Das ist der Teil, den man weglassen könnte und der genau deshalb
festgeschrieben wird. **Jede Entscheidung bekommt eine eigene
Bewegung**, damit sich die Entscheidungen körperlich unterscheiden und
nicht nur inhaltlich:

| Entscheidung | Bewegung |
|---|---|
| In eine Liste | Karte fliegt **nach links zur Sidebar**, die Zielzeile blitzt kurz auf |
| Später | **Dieselbe Bewegung wie „in eine Liste"** |
| Erledigt | Ein **Strich zieht sich über den Titel**, *danach* sinkt die Karte in sich zusammen |
| Zurück | Die vorherige Karte kommt **aus derselben Richtung zurück**, in die sie gegangen ist |

> **„Später" bewegt sich absichtlich wie das Einsortieren** (Entscheidung
> des Nutzers, 2026-08-11). Es hatte vorher eine eigene Richtung — nach
> rechts, in Richtung seines Knopfes — und war damit *„ähnlich, aber
> nicht gleich"*, was als Unsauberkeit auffiel. Der Preis ist benannt:
> Die Bewegung sagt nicht mehr, **was** geschehen ist. Das trägt jetzt
> allein der Zähler, der beim Überspringen nicht weiterzählt.

Dazu:

- **Der Balken läuft an, statt loszuschießen.** Kurve `ease-lauf` (§3):
  langsam anfangen, immer schneller werden, am Ende einrasten — und
  **kein Überschwingen**, denn er zeigt eine Menge an. Er ist das
  Einzige, dem man beim Laufen **zusehen** soll: Dauer
  `dur-slow + dur-base` (600 ms, zwei vorhandene Stufen addiert, kein
  neuer Skalenwert). Bei 400 ms war er am Ziel, bevor der Blick von der
  weggeflogenen Karte zurück war.
- **Er läuft in beide Richtungen.** „Zurück" lässt ihn genauso gefedert
  zurücklaufen; er springt nie.

  > **Fallstrick, der das lange still kaputt gemacht hat:** Die Seite wird
  > bei jedem Schritt neu aufgebaut. Ein frisch eingesetztes Element hat
  > keinen Vorzustand, von dem aus eine Übergangsanimation laufen könnte —
  > es steht sofort auf dem Endwert, und der Balken sprang. Er wird
  > deshalb mit dem **alten** Wert aufgebaut und erst im nächsten Bild auf
  > den neuen gesetzt. In Flutter stellt sich das nicht: Dort behält ein
  > `AnimatedContainer`/`TweenAnimationBuilder` seinen Zustand über den
  > Neuaufbau hinweg. **Die Regel bleibt trotzdem:** Fortschritt läuft,
  > vorwärts wie rückwärts.
- **Zähler rollen**, statt umzuspringen — und zwar in die Richtung, in
  die sich der Wert bewegt: Wird weniger, kommt die neue Zahl von oben
  herein. Das gilt **in der ganzen Sidebar**, nicht nur hier: Es ist
  dieselbe Aussage („eins weniger"), egal wo abgehakt wurde.
- **Jeder Knopf gibt beim Drücken nach** (`scale(0.96)` auf
  `:active`, `dur-fast`). Auf dem Zeigegerät ist das der Ersatz für das,
  was auf dem Telefon die Haptik macht.
- **Haptische Rückmeldung, wo es sie gibt.** Auf Mobilgeräten:
  ein leichter Tick pro Entscheidung
  (Flutter `HapticFeedback.selectionClick()`), ein spürbarerer beim
  Abschluss (`mediumImpact()`), keiner bei „Später". Im Mockup
  stellvertretend `navigator.vibrate()`, das auf dem Desktop folgenlos
  bleibt. **Nie ohne die sichtbare Bewegung** — die Haptik verstärkt,
  sie ersetzt nicht.
- **Der Abschluss ist ein eigenes Bild**, kein Verschwinden: das
  Eingangs-Symbol, „Eingang leer", darunter die Bilanz des Durchgangs
  („7 Aufgaben einsortiert"), aufgeschlüsselt nach Zielliste. Wer etwas
  liegen gelassen hat, sieht das dort ebenfalls — ohne Tadel, als Zahl.

> **Warum das in die Spec gehört und nicht ins Mockup allein:** Diese
> Bewegungen sind die Funktion, nicht ihre Verpackung. Ein Durchgang
> ohne sie ist ein Formular; mit ihnen ist er eine Abfolge von
> Quittungen. Beim Flutter-Bau darf das nicht als „Feinschliff später"
> herausfallen — dann fehlt der Grund, den Modus überhaupt zu öffnen.

**Bewusst nicht enthalten:** Tastenkürzel für die Triage (vom Nutzer
abgelehnt, §2.0), Konfetti oder Klänge (passen nicht zur ruhigen
Palette; die Belohnung liegt in der Bewegung, nicht im Feuerwerk),
ein Zeitmesser („in 1:12 geschafft" — macht aus Aufräumen einen
Wettkampf gegen sich selbst).

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
| `ease-spring` | `cubic-bezier(0.34, 1.28, 0.52, 1)` → Flutter `Cubic(0.34, 1.28, 0.52, 1.0)` | etwas, das **ankommt**: Karteneinflug, Knopf-Quittung, **das einrastende Häkchen**, Abschlussbild (2.8) |
| `ease-lauf` | `cubic-bezier(0.85, 0, 0.35, 1)` → Flutter `Cubic(0.85, 0.0, 0.35, 1.0)` | etwas, das eine **Menge oder eine feste Stelle** anzeigt: Fortschrittsbalken, Zähler, der gleitende Knopf des Darstellungs-Schalters |

Alle Bewegungen animieren ausschließlich `transform`, nie Layout-Eigenschaften.

**Drei Kurven, jede mit einer klaren Zuständigkeit — und keine vierte:**

- `ease` trägt alles Gewöhnliche.
- `ease-spring` schwingt über das Ziel hinaus. Das sagt „geschafft" und ist
  richtig, wo etwas **ankommt**. Überall sonst — Spalten, Menüs, Zeilen —
  wäre es Unruhe.
- `ease-lauf` fängt langsam an, wird immer schneller und rastet ein. Sie
  schwingt bewusst **nicht** über, denn sie bewegt Dinge, die eine Menge
  oder eine feste Stelle anzeigen: **Ein Fortschrittsbalken, der über seine
  Kerbe hinausschießt, zeigt für einen Moment einen Fortschritt an, den es
  nicht gibt.** Das ist nicht nur unruhig, es ist falsch.

  > **Am 2026-08-13 auf den Darstellungs-Schalter ausgeweitet** (Wunsch des
  > Nutzers). Er trug vorher `ease`. Die Regel wird dadurch nicht weicher,
  > sondern schärfer formuliert: Nicht „Menge" ist das Kriterium, sondern
  > **ob etwas auf einem bestimmten Wert landen muss**. Der Knopf steht auf
  > einem von zwei Feldern; ein Überschwinger ließe ihn kurz über das Feld
  > hinausrutschen, auf dem er stehen bleiben soll. Dieselbe Begründung wie
  > beim Balken, nur ohne Zahl.

Hier stand bis zum 2026-08-11 „zweite Kurve, keine dritte". Die dritte kam
dazu, weil der Überschwinger am Fortschrittsbalken auffiel — die Regel
dahinter ist aber schärfer geworden, nicht weicher: **Überschwingen dort,
wo etwas ankommt; nie dort, wo etwas gemessen wird.**

### Höhen (Schatten)
| Stufe | Verwendung |
|---|---|
| `el-1` | leicht abgehobene Fläche |
| `el-2` | schwebendes Menü (Fälligkeit, „/", Auswahl-Leiste) |
| `el-3` | Overlay, App-Fenster |

### Die Palette „Koernig" — ✅ ÜBERNOMMEN (2026-08-13)

**Vier Farben kommen vom Nutzer**, alles Übrige ist daraus abgeleitet und
in dieser Spalte als **abgl.** gekennzeichnet. Der Unterschied ist
wichtig: Eine vorgegebene Farbe wird nicht angetastet, eine abgeleitete
darf nachgezogen werden, wenn eine Messung es verlangt.

| | |
|---|---|
| Sustainable Linen | `#faf3e1` |
| Recycled Cotton | `#f5e7c6` |
| Electric Tangerine | `#ff6d1f` |
| Black Hole | `#222222` |

> **Der Warnton ist keine der vier.** Der Nutzer hatte zunächst `#b43852`
> geliefert und ihn nach dem Ansehen als **zu knallig** verworfen —
> nachgemessen hatte er Buntheit 53, mehr als jede Listenfarbe. Der
> abgeleitete Ersatz liegt bei 37: erkennbar dasselbe Rot, ohne
> Signalcharakter. Gehalten wurde der Rosenrot-Bereich, damit er nicht in
> Richtung Akzent rutscht.

### Farben — Hell
| Token | Wert | | Verwendung |
|---|---|---|---|
| `paper` | `#f5e7c6` | | Hintergrund außerhalb des Fensters |
| `surface` | `#faf3e1` | | Spaltenflächen |
| `surface-sunken` | `#f5e7c6` | | Sidebar |
| `nav-hover` | `#faf3e1` | | Zeile beim Überfahren — **hellt auf**, in beiden Modi |
| `chip-bg` / `chip-hover` | `#efe0be` / `#faf3e1` | abgl. | kleine Schaltflächen |
| `tree-line` | `#cbb78a` | abgl. | Verbindungslinien der Gruppen |
| `line` | `#e0ce9f` | abgl. | Rahmen |
| `line-soft` | `#efe0be` | abgl. | leichte Trenner |
| `ink` | `#222222` | | Haupttext |
| `ink-soft` | `#4a4a4a` | abgl. | Sekundärtext |
| `ink-faint` | `#656565` | abgl. | Zähler, Meta, Platzhalter |
| `accent` | `#ff6d1f` | | Flächen, Icons, Logo, Dekoration |
| `accent-strong` | `#a64714` | abgl. | **Akzentfarbe für Text** |
| `accent-soft` | `#ffe3d2` | abgl. | Hintergrund aktiver Zustände |
| `urgent` | `#96444e` | abgl. | überfällig / heute |
| `done` / `done-ink` | `#656565` / `#faf3e1` | abgl. | Erledigt-Marke |

### Farben — Dunkel
| Token | Wert | |
|---|---|---|
| `paper` | `#1a1a1a` | abgl. |
| `surface` | `#222222` | |
| `surface-sunken` | `#141414` | abgl. |
| `nav-hover` | `#2e2e2e` | abgl. |
| `chip-bg` / `chip-hover` | `#222222` / `#333333` | abgl. |
| `tree-line` | `#4a4a4a` | abgl. |
| `ink` / `ink-soft` / `ink-faint` | `#faf3e1` / `#b8b0a0` / `#a09a8c` | abgl. |
| `accent` / `accent-strong` | `#ff6d1f` | |
| `accent-soft` | `#3a2113` | abgl. |
| `urgent` | `#c97b84` | abgl. |
| `done` / `done-ink` | `#8a8a8a` / `#1a1a1a` | abgl. |

**Standard ist der dunkle Modus** (Festlegung des Nutzers, 2026-08-13).
Bewusst fest gesetzt und nicht der Systemeinstellung überlassen: Sonst
beurteilen zwei Leute verschiedene Bilder. Die Rückfallebene für „System
dunkel" bleibt trotzdem gepflegt — sie greift, sobald kein `data-theme`
gesetzt ist. Geprüft von `test_theme_switch.js`.

> **Der zweite Akzentton ist nur im Hellen nötig, der zweite Warnton nur
> im Dunklen.** Electric Tangerine trägt als Text auf Linen 2,54:1 und
> braucht deshalb `accent-strong`; auf Black Hole trägt es mit 5,65:1
> selbst. Beim Rot ist es genau umgekehrt. Das ist keine Unregelmäßigkeit,
> sondern dieselbe Regel zweimal angewandt: **Ein Ton, der als Fläche
> richtig ist, ist als Text noch lange nicht geprüft.**

### Listenfarben
Die Palette selbst kennt keine — sie sind **abgeleitet**. Erdtöne mit
genau **einem** kühlen Anker (Taubenblau), in der Helligkeit angeglichen,
damit kein Punkt lauter ruft als die anderen.

Zwei Zonen bleiben frei, weil sie belegt sind: **Orange** trägt der
Akzent, **Rosenrot** das Überfällige. Eine Listenfarbe dort wäre eine
zweite Bedeutung in derselben Farbe.

**Petrol und Blauviolett bleiben ausgeschlossen** — sie standen schon
einmal in dieser Reihe und wirkten als Fremdkörper.

| Hell | Dunkel | |
|---|---|---|
| `#9b7355` | `#bc9271` | Lehm |
| `#7d8a4e` | `#9ba968` | Olive |
| `#c1902f` | `#ddae50` | Ocker |
| `#5c7590` | `#7e97b4` | Taubenblau |
| `#4a7a5e` | `#6d9e82` | Tanne |

Unterscheidbarkeit ist **gerechnet, nicht behauptet**: CIELAB-Abstand
(CIE76) aller Paare, auch gegen Akzent und Warnton. Engstes Paar **23,2**
(Olive/Tanne) — deutlich über den ~10, ab denen es auf kleiner Fläche
unsicher wird. Nachzurechnen mit `design/mockups/tests/shot_palette.js`.

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
- **`accent` ist im hellen Modus als Textfarbe zu hell** (2,54:1 auf
  `surface`). Für Text dort immer `accent-strong`; im dunklen Modus trägt
  `accent` selbst. Alle Textfarben erfüllen WCAG AA (4,5:1) in beiden Modi
  — an den real gerenderten Elementen nachgemessen, nicht nur gerechnet
  (`test_contrast.js`, zuletzt 2026-08-13 nach dem Palettenwechsel: 0
  Durchgefallene in beiden Modi).
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
**Teilweise beantwortet (2026-08-07):** Die erfasste Aufgabe landet im
**Eingang** (§2.0) — ohne Listenauswahl. Eine Auswahl beim Erfassen
widerspricht dem ganzen Gedanken: Sie erzwingt genau die Entscheidung,
die der Eingang aufschieben soll.

**Weiterhin zu klären:** Welches Kürzel?

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

**Datum setzen — ✅ überarbeitet 2026-08-07, ersetzt die frühere Fassung:**

Im Kopf der Aufgabenseite steht eine **dauerhaft sichtbare Zeile**, kein
Aufklappmenü:

```
[ Heute | Morgen ]   ( 📅 6. Aug ✕ )
```

- **Zwei Schnellwahl-Felder**, segmentiert: Heute und Morgen. Das jeweils
  zutreffende ist markiert — der Zustand ist **ohne einen Klick** ablesbar.
- **Ein Chip** daneben für jedes andere Datum. Ohne Datum trägt er die
  Einladung „Datum wählen", mit Datum das Datum selbst und ein ✕ zum
  Entfernen.
- **Der Chip öffnet einen eigenen Kalender** — ausdrücklich **nicht** das
  native Datumsfeld des Browsers. Er **schwebt über dem Inhalt, aber
  innerhalb der Spalte**: an der Spalte verankert, nicht am Fenster.
  Dadurch schiebt er nichts nach unten *und* kann nicht am Fensterrand
  abgeschnitten werden — beides zugleich geht nur so. Sieben Spalten,
  Woche beginnt am Montag, 199 px breit (passt in die schmalste Spalte
  von 240 px).
  *Heute* trägt einen Ring, das *gewählte* Datum eine Fläche — zwei
  verschiedene Träger, damit beide gleichzeitig lesbar bleiben. Tage der
  Nachbarmonate bleiben anklickbar, treten aber zurück. Die sechste
  Zeile erscheint nur, wenn sie Tage des Monats enthält, sonst springt
  die Höhe grundlos.
- **Der Chip wiederholt die Schnellwahl nicht.** Ist „Heute" aktiv, zeigt
  er `5. Aug`, nicht noch einmal „Heute" — er ergänzt um die konkrete
  Angabe.
- **Überfällig:** Der Chip trägt `Überfällig · 1. Aug`, Warnfarbe **und
  einen Rahmen** (siehe Regel oben).

**„Nächste Woche" ist bewusst nicht dabei.** Für einen Termin in einer
Woche greift man ohnehin zum Kalender, statt eine Schnellwahl zu nehmen,
deren genauen Tag man nicht sieht. Der gewonnene Platz ist nicht
kosmetisch: Mit drei Feldern passt die Zeile **nicht** in die schmalste
Spalte (drei offene Spalten) — der Chip wird abgeschnitten. Nachgemessen
am 2026-08-07, siehe `docs/decisions.md`.

**Warum keine Menüs:** Ein Aufklappmenü verdeckt den Inhalt, den man
gerade beurteilt, kostet einen Klick zum Öffnen und einen zum Schließen,
und verbirgt den aktuellen Zustand, bis man es öffnet. Bei zwei bis drei
Werten ist das reiner Verlust.

### 4.3 Regeln fürs Löschen — ✅ ENTSCHIEDEN (2026-08-08)

Der Leitgedanke: **Löschen kaskadiert nach unten, und der Papierkorb macht
das gefahrlos.** Ohne Papierkorb wäre eine Kaskade fahrlässig — die beiden
Festlegungen hängen zusammen und dürfen nicht getrennt umgesetzt werden.

#### Gelöschte Gruppe

Eine gelöschte Gruppe **nimmt die Listen darin mit**. Gruppe und Listen
landen gemeinsam im Papierkorb und werden gemeinsam wiederhergestellt.

> ⚠️ **Diese Regel ist nur zulässig, solange der Papierkorb existiert.**
> Bis dahin — im Mockup und in einer frühen Flutter-Version — **fragt**
> „Gruppe löschen" nach: „Gruppe und 2 Listen löschen?". So bleibt die
> Regel von Anfang an dieselbe und nur die Absicherung wechselt; würde man
> stattdessen erst eine andere Regel gelten lassen, verließe sich bis zur
> Umstellung schon jemand darauf.

#### Gelöschte Aufgabe

Eine gelöschte Aufgabe **nimmt ihre Unteraufgaben mit, beliebig tief**.

Der Teilbaum wandert als **eine Einheit** in den Papierkorb und wird als
eine Einheit wiederhergestellt: Dort steht **ein** Eintrag
„Urlaub planen (+3 Unteraufgaben)", nicht vier einzelne. Sonst ließe sich
eine Unteraufgabe zurückholen, deren Elternaufgabe es nicht mehr gibt.

**Warum hier kaskadiert wird, bei der Gruppe aber begründet werden musste:**
Eine Gruppe *ordnet* nur (siehe §1: reine Sortier-/Faltebene), eine
Elternaufgabe *bedeutet* etwas. „Flüge vergleichen" ohne „Urlaub planen"
ist sinnlos. Dasselbe Gefälle zeichnet schon die Erledigt-Kaskade in §2.2
vor: nach unten wirkt alles mit.

#### Papierkorb

- Gelöschtes wird **30 Tage** aufbewahrt, danach endgültig entfernt.
- Die Frist zählt **ab dem Löschen**, nicht ab der letzten Benutzung —
  sonst löscht ein langer Urlaub gar nichts und ein vielbenutzter Tag
  alles.
- **Aufgeräumt wird beim App-Start und beim Öffnen des Papierkorbs.**
  Kein Hintergrundprozess, kein Zeitgeber. Läuft die App wochenlang durch,
  liegt ein Eintrag dadurch ein paar Tage länger als nötig — harmlos.
  Schädlich wäre nur das Umgekehrte, dass etwas zu früh verschwindet; und
  ein Eintrag, der einem beim Hinsehen unter dem Zeiger verschwindet, wäre
  irritierend.
- **Der Papierkorb erscheint in der Sidebar nur, wenn etwas drin ist.**
  Ein dauerhaft leerer Eintrag ist Rauschen.
- Zusätzlich erscheint unmittelbar nach dem Löschen eine
  **Rückgängig-Meldung** für den sofortigen Fehlklick.

> **Gestaffelte Umsetzung:** „Rückgängig" wird zuerst gebaut. Der
> Papierkorb ist beschlossen und kommt **mit der Datenschicht** — er
> braucht ein Feld „gelöscht am" im Speicherformat und eine Bereinigung,
> beides gehört dorthin und nicht ins Mockup.

#### Offene Spalten, die auf Gelöschtes zeigen

> **Regel:** Verschwindet ein Knoten aus dem Baum — durch Löschen,
> Verschieben oder endgültiges Entfernen —, werden **alle geöffneten
> Spalten ab diesem Knoten geschlossen**. Wird er wiederhergestellt,
> öffnen sie sich **nicht** von selbst wieder.

Beispiel: Bei `[ Persönlich ] [ Urlaub planen ] [ Flüge vergleichen ]` und
gelöschtem „Urlaub planen" bleibt `[ Persönlich ]` übrig.

Die Alternative — Spalten stehen lassen und „Diese Aufgabe wurde gelöscht"
anzeigen — wurde verworfen: Sie erzeugt einen Zustand, in dem man auf einer
Seite steht, die es nicht gibt, und jede weitere Aktion braucht dafür einen
Sonderfall.

**Das ist ausdrücklich eine Regel und keine Einzelfall-Reparatur.** Sie
gilt an drei Stellen: beim Löschen, beim Verschieben in eine andere Liste
(im Mockup seit 2026-08-07 gebaut) und beim endgültigen Leeren des
Papierkorbs. Im Mockup ist das Verhalten korrekt, aber an einer Stelle im
Code festgeschrieben — in Flutter gehört es zentral in den
Bearbeitungs-Pfad, wie die Erledigt-Kaskade (§2.2).

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
