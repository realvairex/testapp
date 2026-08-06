# Entscheidungsprotokoll

Laufendes Log aller wesentlichen Entscheidungen zu diesem Projekt. Neueste
Einträge unten angehängt. Jeder Eintrag: Kontext, abgewogene Optionen,
Entscheidung, Begründung.

---

## 2026-08-05 — Dokumentationsstandard für das Projekt

**Kontext:** Nutzer hat wenig Programmiererfahrung, das Projekt läuft über
mehrere Chat-Sessions, die keinen automatischen Zugriff aufeinander haben.
Es soll jederzeit nachvollziehbar sein, welche Entscheidungen wie und warum
getroffen wurden — auch ohne Zugriff auf den ursprünglichen Chatverlauf.

**Entscheidung:** Einführung von `CLAUDE.md` (Projektüberblick, wird bei
jeder Session automatisch gelesen), `docs/concept.md` (Produktvision) und
`docs/decisions.md` (dieses Dokument). Jede wesentliche Entscheidung wird
hier protokolliert, jede Änderung im Code über aussagekräftige Commits
nachvollziehbar gemacht.

**Begründung:** Chat-Konversationen sind nicht persistent zwischen
Sessions; die Session-Umgebung selbst ist temporär (Container wird nach
Inaktivität verworfen). Nur was im Git-Repo landet, bleibt erhalten. Ein
laufendes Entscheidungsprotokoll ist einfacher zu pflegen als z.B. einzelne
ADR-Dateien pro Entscheidung, bietet bei einem Projekt dieser Größe aber
die gleiche Nachvollziehbarkeit.

---

## 2026-08-05 — Sharing/Kollaboration: nicht in v1, aber Datenmodell vorbereiten

**Kontext:** Langfristig soll es möglich sein, Listen mit anderen Personen
zu teilen und gemeinsam zu bearbeiten (inspiriert von Superlist). Frage:
von Anfang an mit einbauen, oder später nachrüsten?

**Abgewogene Optionen:**
1. Multi-User-Sync von Anfang an einbauen (Auth, Backend, Konfliktauflösung).
2. Rein lokale Solo-App ohne jede Rücksicht auf späteres Sharing.
3. Solo-App, aber Datenmodell so strukturieren, dass Sharing später ohne
   grundlegenden Umbau nachrüstbar ist (z.B. eindeutige IDs, sauber
   getrennte Besitzer-/Owner-Felder pro Liste/Task).

**Entscheidung:** Option 3. v1 bleibt eine lokale Solo-App (kein Backend,
kein Auth-Zwang), aber das Datenmodell wird von Anfang an so angelegt,
dass Sharing später ergänzt werden kann, ohne die Grundstruktur
umzubauen.

**Begründung:** Volles Multi-User-Sync von Tag 1 an wäre angesichts der
geringen Programmiererfahrung und des Projektumfangs Overkill und würde
den Einstieg unnötig verkomplizieren. Eine sharing-freundliche
Datenstruktur kostet dagegen jetzt praktisch nichts.

---

## 2026-08-05 — Tech-Stack-Richtung (vorläufig, noch nicht final bestätigt)

**Kontext:** Zielplattformen in Prioritätsreihenfolge: Desktop → Mobile →
Web. Nutzer hat wenig Programmiererfahrung, aber Vorerfahrung mit
Lovable, Replit und punktuellen Code-Anpassungen bei einem Shopify-Shop
(alles web-technologie-nah).

**Abgewogene Optionen:**
1. Für jede Plattform eine eigene native Codebasis (z.B. Swift für
   Desktop/iOS, Kotlin für Android).
2. Eine Web-Technologie-Basis (React/TypeScript), die als Desktop-App
   verpackt wird (Electron/Tauri), später im Browser läuft und für Mobile
   als PWA oder React Native wiederverwendet wird.

**Entscheidung (vorläufig):** Tendenz zu Option 2 — eine gemeinsame
React/TypeScript-Codebasis für alle drei Plattformen. Noch nicht final
bestätigt, offen z.B. ob Electron oder Tauri für die Desktop-Verpackung.

**Begründung:** Passt zur vorhandenen Erfahrung (Lovable/Replit/Web-nahe
Anpassungen), vermeidet das Pflegen von drei komplett getrennten
Codebasen bei geringer Programmiererfahrung.

> ⚠️ **ÜBERHOLT (2026-08-06).** Diese Richtung wurde nicht weiterverfolgt.
> Der Stack ist inzwischen auf **Flutter** festgelegt — siehe den Eintrag
> "Tech-Stack festgelegt: Flutter, mit super_editor als Editor-Fundament"
> am Ende dieses Dokuments. Ausschlaggebend war die Mobile-Perspektive.

---

## 2026-08-05 — Feature-Scope v1

**Kontext:** Definition der Kernfunktionen für die erste Version, basierend
auf Superlist- und Xdo-Inspiration.

**Entscheidung:** v1 umfasst: unendlich verschachtelte Aufgaben (jede
Aufgabe = eigene Mini-Seite mit Notizen/Anhängen/Unteraufgaben,
automatischer Fortschrittsbalken), Slide-in-Detailpanel, Quick Capture als
Kernprinzip, optionale Fälligkeitsdaten pro Aufgabe plus eine
listenübergreifende "Heute"-Seite. Kein Multi-User-Sharing in v1 (siehe
separater Eintrag oben). Details siehe `concept.md`.

**Begründung:** Diese Elemente wurden vom Nutzer explizit als die
prägendsten/wichtigsten Merkmale von Superlist benannt bzw. als
Kernprinzip von Xdo (Quick Capture) übernommen.

---

## 2026-08-05 — Entwicklungs-Konventionen (Backup, CI, Tests, Secrets, Reviews)

**Kontext:** Nutzer wünscht durchgängig professionelle, saubere
Arbeitsweise, die typische Praktiken erfahrener/intensiver Nutzer
übernimmt — automatisch, ohne dass jede einzelne Maßnahme extra
eingefordert werden muss.

**Entscheidung:** Folgende Konventionen gelten ab sofort verbindlich für
das Projekt (Details in `CLAUDE.md` unter "Entwicklungs-Konventionen"):
- Häufige, kleine Commits + Push statt seltener Mega-Commits (Backup-Zweck,
  da die Session-Umgebung temporär ist, GitHub aber persistent).
- GitHub-Actions-CI (Lint, Type-Check, Tests) sobald Code existiert.
- Tests parallel zu Features, nicht nachträglich.
- Striktes `.gitignore`, keine Secrets im Repo, zukünftige Keys nur über
  Umgebungsvariablen.
- Eigenständige, regelmäßige Code-Reviews vor Feature-Abschluss.
- Session-Start-Hook einrichten, sobald das Projekt bau-/testbar ist.
- `CLAUDE.md` bewusst schlank halten, Details in `docs/`.

**Begründung:** Diese Punkte sind Standardpraxis professioneller/erfahrener
Nutzer und senken bei geringer Programmiererfahrung des Nutzers das Risiko,
Arbeit zu verlieren oder unbemerkt Fehler einzubauen — ohne den Einstieg
durch Overengineering zu verkomplizieren (z.B. kein Multi-User-Backend nur
für Backup-Zwecke, siehe Sharing-Entscheidung oben).

---

## 2026-08-05 — Versionierung: Git-Tags statt Alpha/Beta-System

**Kontext:** Nutzer fragte, ob eine Aufteilung in Alpha-/Beta-/Versions-
Stände sinnvoll wäre, um später zu einem bestimmten Stand zurückspringen
zu können.

**Abgewogene Optionen:**
1. Volles Versionsschema (Semantic Versioning, Changelog, Release-Prozess)
   von Anfang an.
2. Kein explizites Versionskonzept, nur normale Commits.
3. Git-Tags an bedeutsamen Meilensteinen (z.B. `mockup-v1`), volles
   Semantic-Versioning-Schema erst ab echtem App-Code/Release.

**Entscheidung:** Option 3. Meilensteine werden per Git-Tag markiert,
sobald sie erreicht sind (z.B. abgeschlossenes Mockup, erste lauffähige
Version). Ein formales Versionsschema (v0.1.0 etc.) mit Changelog kommt,
sobald echter App-Code existiert und erste Releases sinnvoll werden.

**Begründung:** In der Konzept-/Mockup-Phase ist ein volles Release-
Schema Overhead ohne Gegenwert. Git-Tags liefern denselben Kernnutzen
(jederzeit zu einem markanten Stand zurückspringen können) praktisch ohne
Zusatzaufwand und passen zur bestehenden Backup-Konvention (häufige,
kleine Commits).

**Korrektur (selber Tag):** Der Push des ersten Tags schlug fehl (HTTP 403)
— die Session-Umgebung erlaubt nur Pushes auf den freigegebenen
Arbeits-Branch, keine zusätzlichen Git-Referenzen wie Tags. Ein rein
lokaler Tag würde beim Verwerfen des Session-Containers verloren gehen und
wäre damit kein echtes Backup. Stattdessen: `docs/milestones.md` — eine
normale, mitcommittete Datei, die Meilensteine mit Commit-Hash auflistet.
Funktional gleichwertig (`git checkout <hash>` statt `git checkout <tag>`),
aber zuverlässig persistent über den normalen Push-Weg.

---

## 2026-08-05 — Name: Unfold

**Kontext:** Erster Arbeitstitel "Branch" (Baum-Metapher für Verschachtelung)
wurde vom Nutzer abgelehnt. Nutzer schlug stattdessen "Unfold" vor.

**Entscheidung:** Arbeitstitel ist ab sofort **Unfold**.

**Begründung:** Passt inhaltlich sehr gut zur überarbeiteten Panel-Mechanik
(Aufgaben-Seiten "klappen sich auf"/"unfold" nebeneinander auf, siehe
Eintrag zur Panel-Architektur unten) — Name und Kernmechanik verstärken
sich gegenseitig.

---

## 2026-08-05 — Panel-Architektur überarbeitet: Seiten statt Baumliste, Mehrspalten-Drilldown

**Kontext:** Erste Mockup-Iteration zeigte Unteraufgaben inline (auf-
klappbar per Pfeil) direkt in der Hauptliste, plus ein einzelnes Detail-
panel mit fest positioniertem Notizfeld über den Unteraufgaben. Nutzer-
Feedback: Das trifft die Superlist-Mechanik noch nicht genau genug.

**Anforderungen aus dem Feedback:**
- Die Hauptliste zeigt **keine** verschachtelten Unteraufgaben inline an.
  Legt man in einer geöffneten Aufgabe eine Unteraufgabe an, taucht diese
  *nicht* in der übergeordneten Liste auf — sie existiert nur auf der
  eigenen Seite der Aufgabe.
- Jede Liste und jede Aufgabe ist wie eine "Word-Seite": Text, Bilder,
  Links und Aufgaben/Unteraufgaben lassen sich frei und in beliebiger
  Reihenfolge einfügen — kein starres, immer gleich angeordnetes
  Notiz-Feld über einer starren Unteraufgaben-Sektion.
- Klickt man eine Aufgabe an, öffnet sich ihre Seite als Panel. Klickt man
  darin eine Unteraufgabe an, öffnet sich deren Seite als weiteres Panel
  daneben — bis zu drei Seiten gleichzeitig sichtbar (Mehrspalten-
  Drilldown, ähnlich der macOS-Finder-Spaltenansicht). Kommt eine vierte
  hinzu, rücken die älteren Spalten nach links aus dem sichtbaren Bereich.

**Entscheidung:** Datenmodell und Mockup wurden umgebaut: Jede Liste/
Aufgabe hat neben der reinen Eltern-Kind-Hierarchie (für Fortschritts-
berechnung, Fälligkeits-Aggregation) eine eigene `blocks`-Sequenz
(Text-, Bild- und Aufgaben-Blöcke in frei gewählter Reihenfolge), die ihre
"Seite" darstellt. Die Hauptliste rendert nur Top-Level-Blöcke, nie
rekursiv. Ein horizontal scrollender Spalten-Stack (Miller-Columns) ersetzt
das einzelne rechte Slide-in-Panel; Klick auf eine Aufgabe innerhalb einer
Spalte kappt tiefere Spalten und öffnet die neue Seite direkt daneben.

**Begründung:** Trifft das vom Nutzer explizit gewünschte Bild einer
Aufgabe als eigenständige, frei gestaltbare Seite (nicht nur ein
Formular mit festen Feldern) und macht die unendliche Verschachtelung
räumlich nachvollziehbar, statt sie in einer wachsenden Baumliste zu
verstecken.

---

## 2026-08-05 — Akzentfarbe: warmes Orange statt Violett-Blau

**Kontext:** Erste Mockup-Version nutzte einen gedämpften Violett-Blau-Ton
als Akzentfarbe. Nutzer-Feedback: soll wärmer sein.

**Entscheidung:** Akzentfarbe umgestellt auf ein warmes, gedämpftes Orange
(`#D9662E` hell / `#F2925C` dunkel). Die "Fällig heute"-Kennzeichnung nutzt
bewusst eine eigene, unterscheidbare Rot-Beere-Farbe (`#C1443E`/`#E1746B`),
damit Dringlichkeits-Signal und Marken-Akzent nicht verschmelzen.

**Begründung:** Direktes Nutzer-Feedback. Semantische Farbe (dringend) und
Marken-Akzent bewusst getrennt gehalten, um Verwirrung zu vermeiden.

---

## 2026-08-05 — Durchgängige, ruhige Animationen (Apple-artiges Gefühl)

**Kontext:** Nutzer wünscht sich für alle Interaktionen (Öffnen, Schließen,
Löschen, Panel-Wechsel) ein "smoothes, cleanes Apple-Gefühl", nicht nur an
einzelnen Stellen.

**Entscheidung:** Einheitliche Bewegungssprache im Mockup etabliert:
gefederte Easing-Kurven (`cubic-bezier(0.32,0.72,0,1)` für Ein-/Ausblenden
von Spalten, leichte Overshoot-Kurve für Checkbox-Feedback), animiertes
Schließen von Panels statt hartem Verschwinden, Höhen-/Opacity-Animation
beim Löschen von Aufgaben/Blöcken, sanfte Farbübergänge beim Theme-
Wechsel. Durchgängig mit `prefers-reduced-motion`-Rücksicht.

**Begründung:** Direkter Nutzerwunsch; konsistente, dezente Bewegung statt
einzelner Spezialeffekte ist außerdem näher am tatsächlichen Apple-Gefühl,
das als Design-Referenz genannt wurde.

---

## 2026-08-05 — "Word-Seite"-Konzept überarbeitet: echtes Freitext-Dokument statt fester Block-Liste

**Kontext:** Die erste Umsetzung der "jede Liste/Aufgabe ist eine Seite"-Idee
war eine feste, nur am Ende erweiterbare Abfolge von Blöcken (Text/Bild/
Aufgabe) mit zwei Buttons zum Anhängen. Nutzer-Feedback: das trifft die
Vorstellung nicht — gewünscht ist, dass man überall in die Seite
reinklicken und wie in einer Textverarbeitung direkt lostippen kann,
mit der zusätzlichen Möglichkeit, an der Cursor-Position eine Aufgabe
einzufügen (Vorbild: "Cursor mitten im Text setzen, Bild reinziehen,
wild alles mischen").

**Recherche:** Kurz nachgeschaut, wie Superlist das löst
([superlist.com/feature-lists](https://www.superlist.com/feature-lists)):
dort ist es block-basiert (nicht ein einziges großes Freitext-Feld),
Inhalte werden per "/"-Befehl eingefügt (Aufgabe, Überschrift, Absatz,
Datei) und lassen sich frei per Drag an eine beliebige Stelle im Dokument
verschieben.

**Entscheidung:** Jede Liste/Aufgabe rendert jetzt als ein echtes
`contenteditable`-Dokument (ein Element pro Seite), in das direkt getippt
werden kann; Aufgaben und Bilder werden als eingebettete, in sich
geschlossene Elemente an der aktuellen Cursor-Position eingefügt (Toolbar-
Buttons "+ Aufgabe" / "+ Bild", zusätzlich Bild-Drop per Drag&Drop an die
Cursor-Position). Der Dateninhalt (`owner.blocks`) bleibt die
Wahrheitsquelle, wird aber nur beim Verlassen des Feldes (Blur) aus dem
live bearbeiteten DOM neu eingelesen — nicht bei jedem Tastendruck, damit
Tippen nicht durch Neu-Rendern unterbrochen wird. Freies Verschieben
einzelner Blöcke per Drag (wie bei Superlist) ist bewusst zurückgestellt,
da der Kern ("überall klicken und schreiben können") zuerst sitzen sollte.

**Begründung:** Trifft die vom Nutzer explizit gewünschte
Textverarbeitungs-Anmutung und ist durch die Superlist-Recherche als
plausibler, etablierter Ansatz bestätigt. Die Umsetzung wurde per
Headless-Browser-Tests gegen Tippen-an-Cursorposition, Checkbox-Kaskade,
Löschen (inkl. Kaskaden-Effekt auf Panel/Heute-Ansicht) und Drag&Drop-
Bild-Einfügen verifiziert.

---

## 2026-08-05 — Push-Animation: Ursache für "Standbild"/"spawnt nur" gefunden und App-Shell auf Flex umgebaut

**Kontext:** Die Spalten-Push-Animation (Miller-Columns, Vorbild
[tympanus.net/Development/SidebarTransitions](https://tympanus.net/Development/SidebarTransitions/),
"Push"-Effekt) wurde mehrfach neu geschrieben (Keyframes → FLIP auf
`flex-basis` → reines FLIP auf `transform`/`scaleX`, GPU-only) und in jeder
Version per Headless-Browser (Playwright, Frame-Timing-Messung) als
60fps/korrekt verifiziert — trotzdem meldete der Nutzer in der echten
Umgebung weiterhin Probleme, zuletzt präzise eingegrenzt auf: "erst ab der
3. Spalte ist es nicht mehr smooth", weitere Spalten "spawnen nur" statt
sichtbar reinzuschieben, und beim Schließen der 3. Spalte (zurück auf 2)
gibt es dazwischen ein "Standbild", bis alles fertig ist.

**Root Cause:** Die Sidebar wurde bisher über CSS Grid ausgeblendet
(`grid-template-columns: 248px 1fr` → `0 1fr`, kombiniert mit einem
Wechsel von `position: static` auf `position: absolute` bei der Sidebar
selbst). Beides sind Eigenschaften, die sich grundsätzlich nicht animieren
lassen — der Wechsel passiert als harter, sofortiger Sprung im selben
Frame. Dieser Sprung war zudem zeitlich falsch einsortiert: Beim Öffnen
wurde die Sidebar-Collapse-Klasse zwar vor der Spalten-Messung
umgeschaltet, aber weil der Sprung sofort (nicht über 300+ ms) passiert,
hatte die Spalten-FLIP-Animation keine sichtbare Bewegung mehr zu zeigen —
die Fläche war ja schon da ("spawnt nur"). Beim Schließen war es noch
schlimmer: Die Sidebar-Klasse wurde erst NACH Abschluss der
Schließ-Animation umgeschaltet (in `afterClose()`), wodurch die
Spalten-Breiten während der Animation auf Basis der FALSCHEN
(noch-sidebar-ausgeblendet) Content-Breite berechnet wurden — die
Animation lief smooth zu einem falschen Ziel, gefolgt von einem
unanimierten Sprung zur echten Endbreite, sobald die Sidebar zurückkam.
Das ist exakt das gemeldete "Standbild".

**Entscheidung:** App-Shell von CSS Grid auf Flexbox umgebaut:
- Die Sidebar selbst ist jetzt IMMER `position: absolute` (kein
  Positions-Wechsel mehr) und animiert ausschließlich `transform:
  translateX(...)` — eine reine Compositor-Eigenschaft, jederzeit
  animierbar, unabhängig vom Rest.
- Ein neues unsichtbares `.sidebar-track`-Element reserviert als
  Flex-Item die 248px Platz für die Sidebar und animiert nur
  `flex-basis` per normalem CSS `transition` (keine Grid-Spalten mehr,
  kein JS nötig) — das lässt die Content-Area nativ und flüssig breiter/
  schmaler werden.
- Eine neue Hilfsfunktion `contentAreaWidth()` berechnet die
  Ziel-Breite der Content-Area analytisch aus der (stabilen)
  Gesamtbreite des App-Fensters minus 248px, statt `element.clientWidth`
  auszulesen — letzteres ist während einer laufenden CSS-Transition
  mehrdeutig und lieferte teils den alten, teils einen Zwischenwert.
  `sizeColumns()`, `animatePanelsClosing()` und der finale
  `scrollLeft`-Abgleich in `renderColumns()` nutzen jetzt diese Funktion.
- Beim Schließen eines Panels (Klick auf Schließen-Button sowie Escape)
  wird `sidebar-collapsed` jetzt VOR dem Start der Schließ-Animation auf
  den korrekten Zielzustand gesetzt (berechnet aus der zukünftigen
  Panel-Stack-Länge), nicht erst danach in `renderAll()`.

Damit laufen drei unabhängige, aber zeitgleich gestartete Animationen
parallel: die Sidebar-Verschiebung (CSS `transform`-Transition), die
Content-Area-Verbreiterung (CSS `flex-basis`-Transition) und die
Spalten-Verschiebung/-Skalierung (JS-FLIP auf `transform`) — alle ~0,4s,
gleiche Easing-Kurve, kein Schritt wartet mehr auf den Abschluss eines
anderen.

**Verifikation:** Per Playwright Frame-für-Frame die Breite der
Content-Area beim Öffnen der 3. und beim Schließen zurück auf 2 Spalten
gemessen: Die Breite ändert sich jetzt über ca. 25 aufeinanderfolgende
Frames kontinuierlich (z.B. 790→1038px beim Öffnen, 1038→790px beim
Schließen) statt in einem Sprung mit anschließendem Sprung — kein
"Standbild"-Plateau mehr messbar. Da automatisierte Messungen in dieser
Session bereits mehrfach nicht mit dem tatsächlichen Nutzererlebnis
übereinstimmten, steht die reale Bestätigung durch den Nutzer noch aus.

---

## 2026-08-05 — Spurious Scrollbar bei genau 3 Spalten behoben (wirkte wie "Höhen-Skalierung")

**Kontext:** Nutzer bestätigte, dass die Push-Animation jetzt funktioniert
("geht ab"), meldete aber ein neues Problem: die Panels würden beim
Öffnen/Schließen in der **Höhe** zu skalieren scheinen (nicht Breite).
Zusätzlich der gezielte Hinweis, dass die horizontale Scrollbar unterhalb
der Spalten schon bei genau 3 offenen Panels verschwinden sollte (nicht
erst bei 4) — Scrollen soll nur nötig sein, wenn tatsächlich mehr als die
maximal 3 gleichzeitig sichtbaren Spalten offen sind.

**Root Cause:** `contentAreaWidth()` (siehe Eintrag oben) hat die
verfügbare Breite über `appWindow.getBoundingClientRect().width`
berechnet — das schließt die 1px-Border des App-Fensters auf beiden
Seiten mit ein (1040px statt echter 1038px Innenbreite). Bei genau 3
Spalten führte das dazu, dass die Summe der drei Spaltenbreiten die
tatsächlich verfügbare Content-Area-Breite um ca. 2px überstieg → die
Content-Area war horizontal minimal überlaufen → Browser zeigte eine
Scrollbar an, obwohl nichts zu scrollen war. Da eine klassische (nicht
overlay) Scrollbar Platz beansprucht, reduzierte ihr Erscheinen/
Verschwinden nebenbei die verfügbare Höhe der Spalten um ihre eigene
Dicke — das erklärt, warum es sich für den Nutzer wie ein Höhen-
Skalierungs-Problem der Panels angefühlt hat, obwohl die eigentliche
Ursache eine 2px-Breitenabweichung war.

**Entscheidung:** `contentAreaWidth()` nutzt jetzt `appWindow.clientWidth`
(schließt Border korrekt aus) statt `getBoundingClientRect().width`.

**Verifikation:** Per Playwright geprüft: bei genau 3 offenen Spalten ist
`contentArea.scrollWidth === contentArea.clientWidth` (kein Overflow,
keine Scrollbar). Bei 4 offenen Spalten (Verschachtelungstiefe 3)
überläuft die Content-Area korrekt (`scrollWidth` 1384px vs. `clientWidth`
1038px) und die Scrollbar erscheint wie gewünscht erst dann.

---

## 2026-08-05 — Scrollbar flackerte bei jeder Panel-Animation (auch beim allerersten Panel)

**Kontext:** Der 2px-Border-Fix (Eintrag oben) hat den Ruhezustand
korrigiert, aber der Nutzer meldete: die Scrollbar erscheint weiterhin
kurz, sobald man das erste Sidepanel öffnet, und verschwindet danach
wieder — nicht nur ab 3 Spalten.

**Root Cause:** Die Push-Animation nutzt reine CSS-`transform`s
(`translateX`/`scaleX`) für die FLIP-Technik. Chromium/Firefox zählen den
transformierten Grenzrahmen eines Elements zum "scrollable overflow"
seines scrollenden Vorfahren dazu — obwohl `transform` den echten
Layout-Kasten (und damit `flex-basis`/normale Breite) gar nicht
verändert. Eine neu geöffnete Spalte startet ihre Animation mit
`translateX(...)`, das sie visuell weit rechts außerhalb des sichtbaren
Bereichs positioniert; dieser transformierte Zustand lässt
`contentArea.scrollWidth` kurzzeitig (für die Dauer der ~450ms-Animation)
weit über die tatsächliche Breite hinausschießen, obwohl am Ende (und am
Anfang) kein echter Überlauf existiert. Das erzeugte das gemeldete
Aufblitzen der Scrollbar bei jeder Öffnen/Schließen-Aktion.

**Entscheidung:** Neue CSS-Klasse `.content-area.anim-lock { overflow-x:
hidden; }`, die in `runFlip()` genau für die Dauer der Transform-Animation
gesetzt und danach wieder entfernt wird. Da die echte Scroll-Position
(`scrollLeft`) bereits synchron vor Animationsstart auf ihr korrektes
Endziel gesetzt wird, ist das rein kosmetische Ausblenden der
Scrollbar-Leiste während der kurzen Animation unbedenklich — nichts, was
der Nutzer in diesem Sekundenbruchteil tatsächlich bedienen könnte, geht
verloren.

**Verifikation:** Per Playwright über alle Animations-Frames geprüft:
`overflow-x` bleibt durchgängig `hidden` solange `.anim-lock` gesetzt ist,
`clientHeight` der Content-Area bleibt während der gesamten Animation
konstant (keine Höhenänderung durch erscheinende/verschwindende
Scrollbar mehr). Screenshot zur Kontrolle mitten in der Animation zeigt
keine sichtbare Scrollbar.

---

## 2026-08-05 — "Refresh"-Flackern von Aufgaben/Text beim Schließen eines Panels behoben

**Kontext:** Nutzer meldete: manchmal sieht es beim Schließen eines
Sidepanels so aus, als würden die Aufgaben und der Text kurz neu laden
("refreshen").

**Root Cause:** `renderColumns()` baut bei jedem Aufruf das komplette
`innerHTML` aller sichtbaren Spalten neu aus dem Datenmodell auf
(inklusive erneutem `mountEditors()` für die Freitext-Editoren) — auch
für Spalten, die von der Aktion gar nicht betroffen sind. Der bisherige
Schließen-Ablauf rief nach Ende der Animation `renderAll()` auf, was
diesen kompletten Rebuild auslöste — auch für die überlebenden Spalten,
deren Inhalt sich beim reinen Schließen eines Panels nie ändert (Schließen
ist eine reine Ansichts-Aktion, keine Datenänderung). Das Zerstören und
Neuerzeugen der DOM-Knoten (inkl. `contenteditable`-Inhalt) direkt im
Moment, in dem die Schließ-Animation zur Ruhe kommt, erzeugte das
gemeldete kurze Flackern/"Refresh".

**Entscheidung:** Neue Funktion `closeColumnsFrom(fromColIndex)` ersetzt
den `renderAll()`-Aufruf nach einer Schließ-Animation (Schließen-Button
und Escape-Taste). Sie entfernt ausschließlich die DOM-Knoten der
tatsächlich geschlossenen Spalte(n) und lässt die DOM der überlebenden
Spalten (inkl. Editor-Zustand/Cursor) komplett unangetastet.

**Verifikation:** Per Playwright mit einem Marker-Attribut auf einem
Element in den überlebenden Spalten geprüft, dass exakt dieselben
DOM-Knoten nach dem Schließen weiterhin existieren (kein Rebuild). Danach
erneutes Öffnen eines anderen Panels aus einer überlebenden Spalte
funktioniert weiterhin korrekt (Push-Animation, `prevPanelStack`-Buchhaltung
sauber).

---

## 2026-08-05 — Aufgaben-Verschieben: Umstieg von nativem HTML5-Drag&Drop auf Pointer-Events

**Kontext:** Nutzer meldete, dass das Verschieben von Aufgaben per
Drag&Drop "noch nicht so gut" funktioniert und dass sich die **ganze App
aufhängt**, wenn man versucht, eine Aufgabe zu bewegen (anfangs auf
Long-Press eingegrenzt, später präzisiert: passiert generell beim
Verschieben).

**Root Cause:** Die eingebetteten Aufgaben-/Bild-Blöcke liegen innerhalb
eines `contenteditable`-Elements (der Freitext-Seite). Dort hat der Browser
eine **eigene, eingebaute Drag&Drop-Logik für editierbare Inhalte**, die
mit jedem selbst geschriebenen Handler konkurriert: Der Browser verschiebt/
kopiert den Knoten selbst, serialisiert ihn ggf. zu HTML und fügt ihn neu
ein. Zusätzlich startet ein Gedrückthalten im `contenteditable` eine native
**Text-Auswahl-Drag**, die exakt dieselbe Geste kapert — ein anderer
Code-Pfad, den die eigenen Handler gar nicht abdecken. Native HTML5-DnD
und `contenteditable` sind eine bekannt schlechte Kombination.

Zwei konkrete Folgefehler waren messbar reproduzierbar:
1. Ein Drop, der nicht **exakt** auf einem anderen Embed landete (also auf
   Text oder Leerraum), rief nie `e.preventDefault()` auf → es passierte
   entweder gar nichts, oder der Browser führte seinen nativen Drop aus.
2. `recomputeAncestors()` enthielt die einzige unbegrenzte Schleife der
   Datei (`while (true)`), die den Elternbaum hochläuft. Ein durch die
   nativen Eingriffe inkonsistent gewordener Baum (eine Aufgabe als
   eigener Vorfahre erreichbar) lässt diese Schleife ewig laufen und
   friert den kompletten Browser-Tab ein — genau das gemeldete Aufhängen.

**Entscheidung:**
- Das Verschieben von Embeds läuft jetzt vollständig über **Pointer-Events**
  (`pointerdown`/`pointermove`/`pointerup`/`pointercancel` mit
  `setPointerCapture`) statt über die native HTML5-Drag-API. Damit gehört
  die Geste komplett uns, es gibt keinen nativen Pfad mehr, der dagegen
  arbeitet.
- Neuer **expliziter Griff** (Grip-Icon links am Block, erscheint bei
  Hover). Das trennt "Verschieben" sauber von "Aufgabe anklicken zum
  Öffnen" und von Textauswahl — dieselbe Lösung, die Notion/Superlist
  verwenden.
- Zusätzlich wird ein nativer `dragstart` innerhalb einer `.page-editor`
  jetzt grundsätzlich unterbunden (`preventDefault`), egal von welchem
  Element die Geste ausgeht.
- **Drop-Ziel großzügiger:** Es wird die nächstgelegene Einfügeposition
  aller Geschwister-Embeds bestimmt (inkl. oberhalb des ersten und
  unterhalb des letzten), statt nur exakt über einem anderen Embed zu
  reagieren.
- `recomputeAncestors()` bekommt einen **Zyklus-Schutz** (`seen`-Set) und
  bricht ab, statt endlos zu laufen — unabhängig davon, ob der Baum je
  wieder inkonsistent wird.

**Verifikation:** Per Playwright: Verschieben nach ganz oben, nach ganz
unten und in die Mitte funktioniert; Long-Press (1,5s) mit anschließendem
Ziehen hängt die App nicht mehr auf und verschiebt korrekt; ein reiner
Klick auf den Griff verschiebt nichts und öffnet die Aufgabe nicht; ein
Klick auf die Aufgabenzeile öffnet weiterhin das Panel; keine
zurückgebliebenen Drag-Zustände. Zusätzliche Regressionsprüfung über
Checkbox-Kaskade, Tippen, Aufgabe-an-Cursor-einfügen, Quick-Add, Löschen,
Escape und Heute-Ansicht — alles grün, keine Konsolenfehler.

---

## 2026-08-05 — Bewertung des Sidebar-Drag&Drop: funktioniert, ist aber mittelfristig eine Sackgasse

**Kontext:** Nutzer bat darum zu prüfen, ob das Drag&Drop der Sidebar
(Listen/Gruppen sortieren, Liste in Gruppe ziehen) gut ist und man es für
die Aufgaben übernehmen könnte — oder ob es ebenfalls überarbeitet werden
muss.

**Befund:** Funktional ist es in Ordnung — per Playwright verifiziert:
Listen umsortieren, Liste in eine Gruppe ziehen und Gruppen umsortieren
funktionieren alle korrekt, Navigation per Klick bleibt intakt, es bleiben
keine Drag-Zustände zurück. Die Ursache des Aufgaben-Bugs (Konflikt mit
`contenteditable`) trifft hier **nicht** zu, weil die Sidebar kein
editierbares Feld ist. Es gibt also keinen akuten Fehler.

Trotzdem drei substantielle Schwächen:
1. **Kein Touch-Support — und das ist prinzipbedingt.** Die native
   HTML5-Drag-API wird auf Touchgeräten (iOS Safari, Android Chrome)
   grundsätzlich nicht ausgelöst; es gibt kein `dragstart` aus einer
   Berührung. Da laut `concept.md` ausdrücklich Desktop → **Mobile** → Web
   geplant ist, müsste das für Mobile ohnehin komplett neu geschrieben
   werden.
2. **Zwei unterschiedliche Bedienmodelle in einer App.** Aufgaben werden
   jetzt über einen expliziten Griff verschoben, Listen dagegen durch
   Ziehen an beliebiger Stelle der Zeile.
3. **Der Drag-Ghost gehört dem Browser** und lässt sich nicht gestalten —
   passt nicht zum angestrebten Apple-Qualitätsanspruch.

Ein konkreter Fehler wurde dabei gefunden und sofort behoben: Der
Drop-Indikator blieb hängen, wenn man von einem gültigen Ziel auf leeren
Sidebar-Bereich zog, weil `clearDropIndicator()` nur beim Betreten eines
neuen gültigen Ziels lief.

**Entscheidung / Empfehlung:** Die Richtung ist **umgekehrt** zur
ursprünglichen Frage — nicht das Sidebar-System auf die Aufgaben
übertragen, sondern das neue Pointer-Event-System der Aufgaben auf die
Sidebar. Die Umstellung ist bewusst **noch nicht** durchgeführt, da die
Sidebar aktuell fehlerfrei funktioniert und der Umbau bestehende,
funktionierende Logik anfasst; er wird vor der Mobile-Ansicht ohnehin
fällig und sollte dann in einem Zug für beide Bereiche gemacht werden
(gemeinsamer, wiederverwendbarer Sortier-Mechanismus statt zweier
paralleler Implementierungen).

> **Nachtrag (gleicher Tag):** Überholt — der Nutzer meldete unmittelbar
> danach denselben Freeze beim Verschieben in der Sidebar. Die
> Umstellung wurde daraufhin sofort durchgeführt, siehe nächster
> Eintrag.

---

## 2026-08-05 — Vereinheitlichung: ein gemeinsamer Pointer-Sortierer für Sidebar und Aufgaben

**Kontext:** Direkt nach der obigen Bewertung meldete der Nutzer, dass
sich die App **auch beim Verschieben in der Sidebar** komplett aufhängt —
dasselbe Symptom wie zuvor bei den Aufgaben.

**Analyse:** Ein Fuzz-Test über 220 Sidebar-Drag-Kombinationen (alle
Kombinationen aus Listen, Gruppen, Leerraum, Navigationselementen und
Bereichen außerhalb der Sidebar) lief headless **ohne einen einzigen
Hang** durch — genau wie zuvor beim Aufgaben-Bug. Damit ist zum zweiten
Mal belegt: Der Fehler tritt nur im echten Browser auf, nicht in der
Headless-Automatisierung, und der einzige gemeinsame Nenner beider
Freeze-Meldungen ist die **native HTML5-Drag-API**. Weiteres Nachjagen
eines nicht reproduzierbaren Fehlers wäre unwirtschaftlich gewesen,
zumal bereits im vorigen Eintrag festgehalten war, dass diese API für
Mobile ohnehin ersetzt werden muss.

**Entscheidung:** Die native Drag-API wird als **Drag-Quelle im gesamten
Projekt aufgegeben**. Sidebar-Zeilen und Seiten-Embeds laufen jetzt über
**einen einzigen gemeinsamen Pointer-Sortierer**; jeder Bereich liefert
nur noch eine kleine Konfiguration (wie finde ich das gezogene Element,
wo ist sein Container, wie bestimme ich die Drop-Position, was passiert
beim Loslassen). Damit gibt es statt zweier paralleler Implementierungen
nur noch eine — der im vorigen Eintrag empfohlene Zielzustand.

Bedienung je Bereich bewusst unterschiedlich, weil der Kontext es
verlangt:
- **Sidebar:** Die Zeile selbst ist der Griff. Eine Berührung, die die
  Bewegungsschwelle (4px) nie überschreitet, bleibt ein normaler Klick —
  Navigation per Klick auf eine Liste funktioniert unverändert.
  Gruppen lassen sich jetzt auch am Namensfeld anfassen; ein Druck auf
  ein bereits fokussiertes Feld bearbeitet weiterhin nur den Text.
- **Seiten-Embeds:** Expliziter Griff, weil die Zeile klickbar ist
  (öffnet die Seite) und in editierbarem Text liegt.

**Zwei zusätzliche Fehler, beim Testen der Umstellung gefunden und
behoben:**
1. Der Klick-Unterdrücker (verhindert, dass ein Drop zusätzlich als Klick
   gewertet wird) konnte **scharf gestellt hängenbleiben**: Wenn der
   Commit das DOM neu aufbaute, folgte gar kein Klick mehr — und der
   Unterdrücker verschluckte dann später einen völlig unbeteiligten
   Klick. Das ist exakt ein "App reagiert nicht mehr"-Symptom. Er wird
   jetzt pro Drop registriert und im nächsten Event-Loop-Durchlauf wieder
   abgebaut, kann also nicht mehr überdauern.
2. Das Ziehen einer Gruppe am Namensfeld zog eine Textmarkierung über das
   Feld; Fokus und Auswahl werden jetzt verworfen, sobald aus dem Druck
   ein Ziehen wird.

**Verifikation:** Fuzz-Test über **760 Drag-Kombinationen** quer über
Sidebar *und* Seiteneditor (inkl. Griffen, Checkboxen, Eingabefeldern,
Aufgabenzeilen, Bereichen außerhalb): kein Hang, keine zurückgebliebenen
Drag-Zustände, App danach voll bedienbar, keine Konsolenfehler.
Zusätzlich gezielt geprüft: Listen sortieren, Liste in Gruppe ziehen,
Gruppen sortieren, Long-Press (1,5s) mit anschließendem Ziehen, Klick
navigiert weiterhin, Ziehen navigiert *nicht*, Gruppe umbenennen,
Gruppe ein-/ausklappen, Embed verschieben, Klick auf Aufgabenzeile
öffnet weiterhin das Panel. Dazu der volle Regressionslauf
(Checkbox-Kaskade, Tippen, Einfügen an Cursor, Quick-Add, Löschen,
Escape, Heute-Ansicht) und die Panel-Animationsprüfung — alles grün.

**Nebeneffekt:** Damit ist das Sortieren jetzt schon
touch-tauglich aufgebaut, was für die geplante Mobile-Ansicht Voraussetzung
war. Der externe Bild-Drop (Datei vom Betriebssystem in die Seite ziehen)
nutzt weiterhin die native API — dort ist die Seite nur *Drop-Ziel*, nicht
Drag-Quelle, und das ist unproblematisch.

---

## 2026-08-06 — Editor-Datenmodell: Seite ist eine geordnete Block-Liste (Absatz ist ein Block)

**Kontext:** Der Nutzer meldete vier Fehler auf einmal:
1. Mehrzeiliger Text wird beim Verschieben einer Aufgabe in eine einzige
   Zeile zusammengezogen.
2. Aufgaben lassen sich nicht zwischen einzelne Textzeilen schieben.
3. Man kann zwischen Aufgaben nachträglich weder Text noch Leerzeilen
   einfügen.
4. Über der ersten Aufgabe lässt sich per Enter keine Leerzeile zum
   Schreiben öffnen.

**Analyse:** Alle vier haben dieselbe Wurzel. Absätze waren bisher **lose
Textknoten zwischen** den Blöcken, kein eigener Blocktyp, und die Seite
wurde per `innerText` plus Trennzeichen-Split zurückgelesen. Diese
Darstellung kann strukturell nicht abbilden:
- eine Cursor-Position neben einem `contenteditable="false"`-Block
  (daher 3 und 4 — zwischen zwei Aufgaben gibt es schlicht keine
  Textposition),
- eine leere Zeile (wird beim Serialisieren weggetrimmt),
- einen Zeilenumbruch, der ein Neu-Rendern übersteht (daher 1).

Dazu kommt: Chromes Standardverhalten bei Enter packt **alles nach dem
Cursor** in das neu erzeugte `<div>` — im Test wurden dadurch die
nachfolgenden Aufgaben-Blöcke in einen Absatz hineingezogen
(`DIV("Zeile3Urlaub planenLaufschuhe")`), was die Blockstruktur zerstört.
Bug 2 war zusätzlich eine Einschränkung der Drop-Logik: als Ablageziel
galten nur andere Embeds, nie eine Textzeile.

**Recherche (auf Nutzerhinweis "schau wie es Superlist gelöst hat"):**
Superlist hat seinen Editor als Open Source veröffentlicht
([superlistapp/super_editor](https://github.com/superlistapp/super_editor)).
Er verwendet ein **Node-basiertes Dokumentmodell**: eine geordnete Liste
diskreter Blöcke mit je eigener ID, wobei Absatz, Aufgabe und Bild
gleichrangige Blocktypen sind. Ein Absatz ist dort also ein *eigener
Block*, nicht Text zwischen Blöcken. Laut Superlist-Hilfe gibt es
entsprechend die Blocktypen Aufgabe, Unterliste, Absatz, Überschrift,
Trenner und Bild.

**Entscheidung:** Übernahme genau dieses Modells. Jedes direkte Kind des
Editors ist jetzt entweder ein `.inline-embed` (Aufgabe/Bild) oder eine
`.pe-line` (Absatz). Konkret:
- `serializeEditor()` liest die Blöcke **strukturell** aus dem DOM statt
  über `innerText` — Zeilenumbrüche und Leerzeilen bleiben erhalten.
- Enter wird selbst behandelt, damit der Browser die Blockstruktur nicht
  mehr umbauen kann.
- `normalizeEditor()` stellt das Modell nach Browser-Eingriffen wieder her
  (hebt verschachtelte Embeds auf die oberste Ebene, macht aus
  Block-Elementen echte Absätze) und garantiert einen Absatz vor einem
  führenden Embed, zwischen zwei benachbarten Embeds und nach einem
  abschließenden Embed — sonst gibt es dort keine Cursor-Position.
- Als Drop-Ziel gilt jetzt **jeder** Block, nicht nur andere Embeds.

**Verifikation:** Alle vier gemeldeten Fehler mit gezielten Tests zuerst
reproduziert, dann als behoben nachgewiesen (mehrzeiliger Text überlebt
das Verschieben; Aufgabe landet zwischen zwei Textzeilen; Text zwischen
zwei Aufgaben übersteht das Neu-Rendern; Enter ganz oben erzeugt eine
Zeile). Zusätzlich geprüft, dass sich die strukturell eingefügten
Leerzeilen nicht ansammeln: über mehrere Quick-Adds, Toolbar-Einfügungen
und sechs Neu-Render-Zyklen bleibt es bei genau einer Endzeile. Voller
Regressions- und Drag-Test grün.

---

## 2026-08-06 — Superlists Editor nicht direkt übernehmbar; Kandidaten für die echte App

**Kontext:** Nutzerfrage, ob wir Superlists Editor übernehmen und selbst
verwenden können.

**Befund:** Nein, nicht direkt. `super_editor` ist in **Dart/Flutter**
geschrieben ("A Flutter toolkit for building document editors and
readers"). Für die angedachte Richtung React/TypeScript (siehe
Tech-Stack-Eintrag) ist er damit nicht nutzbar; ihn zu übernehmen hieße,
die gesamte App auf Flutter festzulegen. Übernommen wurde daher nicht der
Code, sondern das **Konzept** — das Node-basierte Blockmodell, siehe
vorheriger Eintrag.

**Für die echte App** gibt es im React/TS-Ökosystem ausgereifte
Block-Editoren mit demselben Modell, die den Eigenbau ersetzen sollten:
- **BlockNote** — block-first wie Notion, Drag&Drop-Sortierung und
  Tastaturlogik bereits eingebaut, eigene Blocktypen (z.B. Aufgabe) mit
  vollem TypeScript-Support definierbar. Aktuell der naheliegendste
  Kandidat, weil er unserem Konzept am nächsten kommt.
- **TipTap** (auf ProseMirror) — headless und sehr flexibel, größere
  Erweiterungs-Bibliothek, mehr Eigenbau nötig.
- **Lexical** (von Meta) — maximale Kontrolle, entsprechend mehr Aufwand.

**Entscheidung:** Für das Mockup bleibt der Eigenbau (kein Build-Schritt,
eine Datei). Die Wahl der Editor-Bibliothek wird bewusst erst mit dem
echten App-Code getroffen, dann aber **nicht** als Eigenbau — ein
Block-Editor mit Cursor-Handling, Undo, Copy&Paste und Kollaboration ist
nichts, was man sinnvoll selbst schreibt. Diese Session hat genau das
gezeigt: vier Fehler auf einmal, alle aus dem selbstgebauten
Dokumentmodell.

---

## 2026-08-06 — Tech-Stack festgelegt: Flutter, mit super_editor als Editor-Fundament

**Kontext:** Der Nutzer fragte mehrfach, ob wir Superlists Editor
übernehmen können. Ausschlaggebende Nachfrage: "was wäre langfristig
besser, denk auch an die Mobile-Version". Damit löst dieser Eintrag den
bisher offenen Tech-Stack-Eintrag ab (dort stand React/TypeScript +
Electron/Tauri als unverbindlicher Vorschlag).

**Abgewogene Optionen:**

1. **Flutter + `super_editor`** — Superlists eigenes Editor-Fundament
   (MIT-Lizenz, siehe `research-superlist.md`), dazu ihre Bibliotheken
   für lange Listen und natives Drag&Drop.
2. **React/TypeScript + BlockNote** — der bisher angedachte Stack mit
   einem ausgereiften, stabilen Block-Editor.
3. Beide Varianten erst als Prototyp bauen und vergleichen.

**Entscheidung: Flutter (Option 1).**

**Begründung — der Ausschlag kommt von Mobile:** Bei React/TypeScript
ist die Mobile-Version faktisch ein **zweites Projekt**. Eine PWA ist auf
iOS spürbar eingeschränkt, und React Native teilt sich mit React im Web
*keine* UI-Komponenten. Der Editor — das Herzstück dieser App — müsste
für Mobile also komplett neu gebaut werden; BlockNote ist ein reiner
Web-Editor und läuft auf React Native gar nicht. Bei Flutter läuft
derselbe Editor auf macOS, Windows, iOS, Android und im Web aus einer
Codebasis. Das entspricht exakt der Prioritätenreihenfolge des Nutzers
(Desktop → Mobile → Web).

Dazu kommt: Superlist selbst ist eine Flutter-App. Die App, deren
Qualität und Feeling das erklärte Ziel ist, wird auf genau diesem Stack
ausgeliefert — das ist der stärkste verfügbare Beleg, dass der Anspruch
damit erreichbar ist. Und mit `super_native_extensions` und
`super_sliver_list` liegen Lösungen für zwei Probleme bereit, die uns in
dieser Session bereits Zeit gekostet haben (Drag&Drop, lange Listen).

**Bekanntes Risiko:** `super_editor` ist vor 1.0. Die letzte stabile
Version (0.2.7) ist rund zwei Jahre alt, aktiv entwickelt wird an
Vorabversionen, und **Undo/Redo ist dort noch nicht fertig**.

**Ausstiegsweg, bewusst mitentschieden:** Plattform- und
Editor-Entscheidung sind **trennbar**. Sollte sich `super_editor` als zu
unfertig erweisen, bleiben wir bei Flutter und wechseln den Editor (oder
bauen auf Flutters eigener Texteingabe auf) — wir verlieren dann den
Editor, nicht die Plattform. Für den Fall, dass sich *Flutter selbst* als
Fehlentscheidung erweist, wurde auf ausdrücklichen Wunsch des Nutzers ein
verifizierter Rückkehrpunkt angelegt: Commit `3891fed`, dokumentiert in
`milestones.md`. Dieser Stand enthält das vollständige Mockup und die
gesamte Konzeptarbeit, aber noch keine Festlegung auf eine Plattform —
von dort aus ist Option 2 jederzeit ohne Verlust erreichbar. Der
Rückkehrpunkt wurde testweise ausgecheckt und das Mockup dort
gegengeprüft, ist also nachweislich funktionsfähig und nicht nur notiert.

---

## 2026-08-06 — Umgang mit Abhängigkeiten und Schutz der Nutzerdaten

**Kontext:** Mit der Festlegung auf Flutter hängen wir an Fremdcode, unter
anderem an `super_editor` in einer **Vorabversion** (0.3.0-dev.x). Zugleich
ist die App local-first — die Nutzerdaten liegen ausschließlich auf dem
Gerät des Nutzers. Beides sind Risiken, die man am billigsten vor der
ersten Zeile App-Code adressiert.

**Entscheidung 1 — Abhängigkeiten:** Jede Fremdbibliothek wird auf eine
**exakte Version** festgenagelt, keine Versionsbereiche; das Lockfile wird
mitcommittet. Ein Update ist nie ein Nebenbei-Schritt, sondern ein eigener
Vorgang: in einer abgesicherten Umgebung (eigener Branch bzw. Worktree)
einspielen, Funktionsfähigkeit prüfen, und **erst nach bestandener
Prüfung** in den Hauptstand übernehmen.

**Begründung:** Vorabversionen geben keinerlei Stabilitätsgarantie. Mit
einem Versionsbereich könnte ein neuer Dev-Release den Build von einem Tag
auf den anderen brechen, ohne dass wir selbst etwas geändert haben — und
die Ursache wäre dann schwer zu finden, weil unser eigener Stand
unverändert ist. Ein gepinntes Lockfile macht Builds reproduzierbar und
verlegt jede Änderung an Fremdcode in einen bewussten, prüfbaren Schritt.
Nebeneffekt: schützt auch gegen kompromittierte Paketversionen, da nichts
unbemerkt nachgezogen wird.

**Entscheidung 2 — Nutzerdaten:** Ab der ersten lauffähigen Version gilt:
- **Offenes, dokumentiertes Speicherformat** (JSON oder SQLite), kein
  undurchsichtiges Binärformat.
- **Export-Funktion** von Anfang an, nicht "später".
- **Schema-Version** in den gespeicherten Daten, dazu Migrationen bei
  Modelländerungen.
- **Atomares Schreiben**: erst in eine temporäre Datei schreiben, dann
  umbenennen.

**Begründung:** Bei einer local-first-App gibt es keinen Server, der die
Daten im Zweifel noch hat — ein Defekt oder ein Fehler beim Speichern
bedeutet Totalverlust. Ein offenes Format hält die Daten notfalls von Hand
lesbar und verhindert Herstellerbindung; der Export macht Sicherungen
überhaupt erst möglich. Die Schema-Version lässt sich später kaum
nachrüsten, weil bereits gespeicherte Daten dann nicht mehr zuzuordnen
sind. Atomares Schreiben verhindert, dass ein Absturz mitten im
Speichervorgang eine halb geschriebene, unbrauchbare Datei hinterlässt —
ein klassischer und billig vermeidbarer Datenverlust.

---

## 2026-08-06 — Weitere Schutzmaßnahmen für die echte App

**Kontext:** Vor dem Umstieg auf Flutter durchgegangene Liste zusätzlicher
Risiken. Vom Nutzer bestätigt bis auf einen bewusst zurückgestellten Punkt.

**Entscheidungen:**

1. **Papierkorb / Rückgängig für zerstörerische Aktionen, auf App-Ebene.**
   Das Löschen einer Liste, Gruppe oder Aufgabe muss zurückholbar sein.
   Bewusst **unabhängig** vom Undo des Editors gelöst, denn dessen
   Undo/Redo ist noch nicht fertig (siehe Stack-Entscheidung) — wir dürfen
   uns für Datenverlust-Schutz nicht auf eine unfertige Fremdfunktion
   verlassen.

2. **Flutter-Version selbst pinnen** (z.B. über `fvm`), nicht nur die
   Pakete. Ein Flutter-Update bricht einen Build genauso zuverlässig wie
   ein Paket-Update; die Konvention zu Abhängigkeiten gilt deshalb auch
   für die Toolchain.

3. **Keine Telemetrie ohne ausdrückliche Zustimmung.** Die App ist
   local-first; die Daten verlassen das Gerät nicht. Das ist ein echter
   Datenschutzvorteil gegenüber praktisch allen Alternativen und wird
   nicht für Nutzungsstatistiken aufgegeben. Falls je Telemetrie
   sinnvoll wird: ausschließlich als Opt-in, nie voreingestellt.

4. **Lizenzen aller Abhängigkeiten im Blick behalten.** Alles, was
   eingebunden wird, muss permissiv lizenziert sein (MIT/BSD/Apache), damit
   die App später ohne rechtliche Altlasten auch kommerziell vertrieben
   werden könnte. `super_editor` erfüllt das (MIT).

**Bewusst zurückgestellt — offener Punkt mit Auslöser:**

**`prefers-reduced-motion` wieder respektieren.** In der Mockup-Phase ist
die Unterstützung für diese Systemeinstellung absichtlich **abgeschaltet**,
weil sie beim Nutzer aktiv ist und dadurch sämtliche Animationen unsichtbar
waren — das Mockup dient aber gerade der Bewertung eben dieser Animationen.
**Auslöser: Sobald echter App-Code entsteht, muss dies wieder aktiviert
werden.** Ohne Respekt vor dieser Einstellung ist die App für
bewegungsempfindliche Nutzer (Migräne, Schwindel, vestibuläre Störungen)
unbenutzbar. Dieser Punkt darf nicht verloren gehen, deshalb steht er
zusätzlich in `concept.md` unter den offenen Punkten.

---

## 2026-08-06 — Unterer Sidebar-Bereich: vier Entwürfe, alle verworfen

**Kontext:** Der Nutzer fragte, wie man den Bereich unten in der Sidebar
(„Optionen", Knopf für neue Liste, Knopf für neue Gruppe) besser
anordnen könnte, und wollte die Vorschläge als Bild sehen.

**Abgewogene Optionen** (alle als gerenderte Screenshots vorgelegt):

1. **Jetzt** — zwei unterschiedlich große runde Knöpfe. Ehrlich zur
   Hierarchie, aber der große Knopf steht ohne Bezugskante im Raum.
2. **A** — zwei gleichwertige Pillen mit Beschriftung („Liste",
   „Gruppe"). Am klarsten benannt, macht aber „Gruppe" optisch genauso
   wichtig wie „Liste", was der tatsächlichen Nutzungshäufigkeit
   widerspricht.
3. **B** — eine breite Haupt-Aktion („Neue Liste") plus quadratischer
   Zweitknopf. Behält die Hierarchie, gibt der Haupt-Aktion eine Kante.
   **Das war die Empfehlung.**
4. **C** — „Optionen" als Zeile, beide Knöpfe rechts angedockt. Spart am
   meisten Platz, versteckt die Aktionen aber neben einer Einstellung.

**Entscheidung des Nutzers:** *„es überzeugt mich nichts"* — alle vier
verworfen. Der Bereich bleibt unverändert.

**Einzige übernommene Änderung:** Der kleinere Gruppen-Knopf stand auf
`align-items: center` und schwebte damit neben der Mitte des großen
Listen-Knopfes. Umgestellt auf `flex-end`, sodass beide auf derselben
Grundlinie stehen (Unterkanten nachgemessen identisch). Die
**unterschiedliche Größe der beiden Knöpfe bleibt bewusst bestehen** —
das war bereits früher eine ausdrückliche Festlegung des Nutzers.

**Begründung, warum das hier steht:** Ein späterer Durchgang durch die
Gestaltung würde sonst mit hoher Wahrscheinlichkeit dieselben Vorschläge
noch einmal machen. Der Eintrag steht zusätzlich verkürzt in
`status.md`, damit er ohne Lektüre des gesamten Protokolls sichtbar ist.

---

## 2026-08-06 — Prüfskripte gehören ins Repo, nicht ins Scratchpad

**Kontext:** Beim Vorbereiten eines Sitzungswechsels fiel auf, dass rund
40 Playwright-Skripte ausschließlich im temporären Scratchpad-Verzeichnis
lagen. Sie sind über mehrere Sitzungen entstanden, jedes gehört zu einem
konkret gemeldeten Fehler oder einer Design-Festlegung, und sie sind der
einzige Weg, eine Änderung am Mockup nachzumessen statt sie
durchzuklicken. Mit dem Ende der Session wären sie ersatzlos weg gewesen.

**Optionen:**

1. Liegenlassen — sie hätten ihren Zweck ja erfüllt.
2. Eine kuratierte Auswahl retten.
3. Alle retten, lauffähig machen, dokumentieren.

**Entscheidung: 3.** Alle 40 Skripte liegen jetzt unter
`design/mockups/tests/` mit eigener README. Die Bildschirmfoto-Pfade
zeigten auf das Scratchpad und wurden auf ein lokales, nicht
versioniertes `out/` umgestellt. Zwei Skripte waren inhaltlich veraltet
und wurden repariert:

- `test_typing3.js` prüfte einen `+ Aufgabe`-Knopf, der auf Wunsch des
  Nutzers entfernt worden war, und zählte abschließende Leerzeilen noch
  als Textknoten statt als `.pe-line` — beides Überbleibsel aus der Zeit
  vor dem Umbau auf das Blockmodell.
- `test_fuzz_all.js` war nicht defekt, sondern nur langsam (760
  Drag-Kombinationen). Läuft durch, 0 Hänger.

Alle 40 laufen grün. Eine kuratierte Auswahl wäre billiger gewesen,
aber die Entscheidung, welches Skript später einmal gebraucht wird,
lässt sich heute nicht seriös treffen — und 100 KB Text kosten nichts.

**Nachtrag zur Reichweite:** Diese Skripte prüfen das *Mockup*. Sobald
der Flutter-Bau beginnt, sind sie Referenzmaterial, aber kein Teil der
Test-Pipeline mehr; deren Zusicherungen gehören dann in Dart-Tests
gegen `spec.md`.

---

## 2026-08-06 — Sitzungswechsel ohne Informationsverlust

**Kontext:** Der Nutzer wollte in einen neuen Chat wechseln (wegen des
Kontextlimits) und fragte, wie das ohne Informationsverlust gelingt.
Bisher verließ sich die Übergabe darauf, dass `CLAUDE.md` gelesen wird
und dort das Richtige steht — ein Verlass auf Sorgfalt, nicht auf
Mechanik.

**Das eigentliche Problem:** Wissen bestand in drei Zuständen — im Repo
(sicher), im Chatverlauf (verloren beim Wechsel) und im Scratchpad
(verloren beim Container-Ende). Nur der erste überlebt. Es gab keinen
Punkt, an dem die anderen beiden systematisch in den ersten überführt
wurden.

**Optionen:**

1. Ein einzelnes Übergabedokument, von Hand gepflegt. Billig, aber es
   veraltet genau dann, wenn es gebraucht wird.
2. Ein Startbefehl, der den Kontext lädt. Hilft am Anfang, sichert aber
   nichts am Ende.
3. Beides plus eine maschinelle Abschlussprüfung.

**Entscheidung: 3.** Eingerichtet wurden:

- **`docs/status.md`** — der Übergabestand. Beantwortet drei Fragen: Wo
  stehen wir, was ist als Nächstes dran, was darf nicht noch einmal
  vorgeschlagen werden. Der letzte Punkt ist der wertvollste: Er
  verhindert, dass der Nutzer dieselbe Ablehnung zweimal aussprechen
  muss.
- **`docs/session-log.md`** — was in welcher Sitzung passiert ist.
  Ergänzt die Git-Historie um das, was ein Commit nicht zeigt:
  verworfene Wege, Begründungen im Vorbeigehen, offene Fäden.
- **`start unfold`** und **`ende unfold`** als eingecheckte Anweisungen
  unter `.claude/commands/`. Sie liegen im Repo, gelten also für jede
  Sitzung, nicht nur für diese Maschine. **Nachtrag vom selben Tag:**
  Ursprünglich als Slash-Befehle gedacht — das war ein Fehler, den der
  Nutzer sofort fand. Eingecheckte Slash-Befehle stehen nur im
  Claude-Code-Terminal zur Verfügung; die Web- und App-Oberfläche kennt
  sie nicht und antwortet mit „kein bekannter Befehl". Sie werden
  deshalb als **Text-Auslöser** geschrieben. `CLAUDE.md` und der
  Session-Start-Hook verpflichten ausdrücklich darauf, sie in beliebiger
  Schreibweise zu erkennen und ohne Rückfrage auszuführen.
- **`scripts/session-check.sh`** — prüft mechanisch nach: Arbeits-
  verzeichnis sauber, Branch gepusht, `status.md` so aktuell wie das
  Repo, Eintrag im Entscheidungsprotokoll, nichts Wiederverwendbares im
  Scratchpad vergessen, Sitzungsprotokoll geschrieben. Rückgabewert 1,
  solange etwas offen ist.
- **Session-Start-Hook** in `.claude/settings.json`, der bei jedem
  Sitzungsstart auf `status.md` verweist und die letzten Commits zeigt —
  damit die Übergabe auch dann greift, wenn der Startbefehl vergessen
  wird.

**Begründung für die Prüfung per Skript statt per Checkliste:** Eine
Checkliste in Prosa wird abgehakt, ohne sie auszuführen. `git status`
lügt nicht. Das Skript fand beim ersten Lauf sofort vier reale Lücken,
darunter die 40 ungeretteten Prüfskripte.

**Bewusst nicht getan:** Den Chatverlauf selbst zu archivieren. Er ist
zu unstrukturiert, um später gelesen zu werden; das Destillat in
`status.md` und `session-log.md` ist mehr wert als das Rohmaterial.

---

## 2026-08-06 — Wie verhindert wird, dass Arbeit außerhalb des Repos versandet

**Anlass:** Beim Vorbereiten des Sitzungswechsels lagen 40 Prüfskripte
ausschließlich im temporären Scratchpad. Der Nutzer fragte daraufhin,
wie so etwas künftig verhindert wird.

**Ursachenanalyse — es war nicht Vergesslichkeit.** Das Scratchpad ist
der Weg des geringsten Widerstands: Es braucht keine Rückfrage, die
Umgebung weist aktiv darauf hin, und es gab kein Gegenstück — für ein
Prüfskript existierte schlicht kein Platz im Repo. Also landete jedes
dort, wo es am schnellsten ging. Und es gab keine Rückmeldeschleife, die
jemals nachgefragt hätte. Eine Ermahnung („besser aufpassen") hätte
daran nichts geändert, weil das Anreizgefälle unverändert geblieben wäre.

**Optionen:**

1. **Nur Konvention.** Billig, aber sie greift genau dann nicht, wenn es
   eilig ist — also immer.
2. **Nur Prüfung am Sitzungsende.** Hilft, versagt aber, wenn eine
   Sitzung abrupt endet (Kontextlimit, Container-Ende) und `ende unfold` nie
   läuft. Genau das war der Auslöser.
3. **Konvention plus Prüfung an mehreren Stellen.**

**Entscheidung: 3, in drei Ebenen.**

**Ebene 1 — Vermeidung.** Neue Konvention in `CLAUDE.md`: Ein Skript,
das mehr als einmal läuft oder eine Messung/Regel festhält, wird von
vornherein im Repo angelegt. Das Scratchpad ist nur für echten Wegwerf.
Zusätzlich existiert jetzt mit `design/mockups/tests/` ein offensicht-
licher Ablageort — vorher fehlte er, und das war Teil der Ursache.

**Ebene 2 — Erkennung an den Gefahrenpunkten.** `scripts/session-check.sh`
hängt an vier Hooks:

| Hook | Modus | Warum |
|---|---|---|
| `SessionStart` | Hinweis auf `status.md` | Kontext laden, auch ohne `start unfold` |
| `Stop` | `--drift` | nach jedem Schritt: liegt etwas Wiederverwendbares außerhalb des Repos? |
| `PreCompact` | `--kurz` | die Verdichtung ist der Moment, in dem Kontext verloren geht |
| `SessionEnd` | `--kurz` | letzter Halt, auch bei abruptem Ende |

**Ebene 3 — Ruhe bewahren.** Der `Stop`-Hook läuft bewusst im engsten
Modus (`--drift`): Er fragt **ausschließlich** nach Dateien außerhalb des
Repos, nicht nach nicht committeten Änderungen. Begründung: Während der
Arbeit ist das Arbeitsverzeichnis fast immer unsauber. Ein Wächter, der
nach jedem Schritt „nicht committet!" ruft, wird binnen zwei Tagen
ignoriert — und ein ignorierter Wächter ist schlechter als keiner, weil
er Sicherheit vortäuscht. Deshalb schweigt jeder Kurzmodus vollständig,
solange nichts zu melden ist.

Aus demselben Grund gibt es `scripts/scratchpad-ignore.txt`: Bewusst
verworfene Dateien bleiben verworfen, statt bei jedem Lauf dieselbe
längst getroffene Entscheidung erneut vorzulegen.

**Nachgewiesen:** Der Wächter wurde gegengeprüft, indem eine Datei im
Scratchpad angelegt wurde — er schlug an und schwieg nach dem Entfernen
wieder.

**Bewusst nicht getan:** Automatisch committen. Ein Hook, der ungefragt
Commits erzeugt, macht die Git-Historie wertlos, und die Historie ist
laut `CLAUDE.md` ausdrücklich ein Mittel der Nachvollziehbarkeit. Die
Hooks melden, sie handeln nicht.

**Bekannte Grenze:** Die Hooks konnten in der laufenden Sitzung nicht
scharf geprüft werden — sie feuern erst beim nächsten Sitzungsstart bzw.
Stop-Ereignis. Die aufgerufenen Kommandos wurden einzeln nachgestellt
und laufen korrekt; ob Claude Code sie tatsächlich auslöst, ist beim
nächsten Sitzungsstart zu prüfen. Steht als offener Punkt in
`status.md`.

---
