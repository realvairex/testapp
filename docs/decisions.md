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

> **Nachtrag 2026-08-06:** Die technische Sperre ist mit dem Umzug auf den
> lokalen Klon weggefallen — nachgemessen, siehe Eintrag „Umgebungsannahmen
> nachgezogen" am Ende dieses Dokuments. Die Entscheidung für
> `docs/milestones.md` bleibt trotzdem bestehen, jetzt aber aus inhaltlichen
> Gründen statt aus technischem Zwang.

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

## 2026-08-06 — Hauptstand nach `main`, Arbeit auf einem lokalen Klon

**Kontext:** Der gesamte Projektstand lag ausschließlich im Branch
`claude/todo-app-brainstorm-fmv1sd`. `main` enthielt nur den
Initial-Commit mit einem 9-Byte-README. Automatisch benannte
`claude/…`-Branches sind Wegwerf-Namen; verschwindet so einer bei einer
Aufräumaktion, ist die gesamte bisherige Arbeit weg. Gleichzeitig wechselte
die Arbeitsumgebung: Statt im temporären Claude-Container läuft die Sitzung
jetzt auf dem Rechner des Nutzers, in einem geklonten Repo unter
`~/Documents/Claude/testapp`.

**Optionen:**

1. *Alles auf dem Feature-Branch lassen.* Kein Aufwand, aber die
   Verwundbarkeit bleibt, und ein Besucher des Repos sieht ein leeres
   Projekt.
2. *Pull Request von Branch nach `main`.* Sauber im Team, hier aber
   Zeremonie ohne Gegenüber — es gibt keinen zweiten Prüfer.
3. *Fast-Forward von `main` auf den Branchstand.* Gewählt.

**Entscheidung:** `main` wurde per Fast-Forward auf `4374af9` gezogen und
ist Default-Branch. Der Feature-Branch **bleibt unverändert bestehen** und
dient als zweite Kopie; er wird nicht gelöscht.

**Begründung:** `main` war ein direkter Vorfahr des Branches, also war der
Fast-Forward verlustfrei — kein Merge, kein Konflikt, keine Möglichkeit,
dabei etwas zu überschreiben. Vor dem Eingriff wurde zusätzlich ein
`git bundle --all` außerhalb des Repos abgelegt und mit `git bundle verify`
geprüft ("records a complete history"). Damit lag der Stand während des
Umbaus dreifach vor: Feature-Branch, Bundle, lokaler Klon.

**Folge für die Arbeitsweise:** Gearbeitet wird am lokalen Klon, GitHub ist
Sicherungsort, keine Arbeitsfläche. Die Regel aus `CLAUDE.md` — alles
Dauerhafte gehört ins Repo und gepusht — bleibt vollständig gültig; nur der
Notfall, gegen den sie schützt, heißt jetzt "Rechner weg" statt
"Container weg".

**Nebenbefund GitHub-Zugang:** Git griff auf einen abgelaufenen
Schlüsselbund-Eintrag des alten Accounts `SchnapsideeAT` zurück
("Invalid username or token"). Behoben durch `gh` (per Homebrew
installiert), angemeldet als `realvairex`; `gh` ist jetzt
Credential-Helper und geht am Schlüsselbund vorbei. Der alte Eintrag wurde
bewusst **nicht** gelöscht — er könnte anderswo noch gebraucht werden.
Die Commit-Identität (`realvairex` / `vvairexx@gmail.com`) ist **repo-lokal**
gesetzt, damit die globale Konfiguration anderer Projekte unberührt bleibt.

**Offen geblieben:** Ob die Hooks feuern, ist weiterhin **ungeprüft** —
siehe nächster Eintrag.

---

## 2026-08-06 — Hook-Prüfung: weiterhin offen, mit bekannter Ursache

**Kontext:** `status.md` trug den offenen Punkt, beim nächsten
Sitzungsstart zu prüfen, ob die Hooks aus `.claude/settings.json`
tatsächlich auslösen. Erkennungszeichen: die Zeile `=== Projekt Unfold ===`
zu Sitzungsbeginn.

**Beobachtung:** Die Zeile erschien **nicht**. Daraus folgt aber *nicht*,
dass der Hook defekt ist: Die Sitzung wurde in `~/Documents/Claude`
gestartet — eine Ebene **über** dem Repo. Claude Code liest
`.claude/settings.json` aus dem Projektverzeichnis; lag dieses nie vor,
konnte der Hook gar nicht ausgelöst werden. Der Test hat also nicht
stattgefunden, statt fehlzuschlagen.

**Entscheidung:** Der offene Punkt bleibt offen und wird **nicht** als
erledigt vermerkt. Ihn jetzt abzuhaken, würde eine Prüfung behaupten, die
es nicht gab — und beim nächsten echten Verlust wäre der Grund unauffindbar.

**Nächster Prüfschritt:** Eine Sitzung direkt in
`~/Documents/Claude/testapp` starten und nachsehen, ob die Zeile kommt.

---

## 2026-08-06 — Umgebungsannahmen nachgezogen: Hook geprüft, Tags geprüft

**Kontext:** Am selben Tag zog das Projekt vom temporären Claude-Container
auf einen lokalen Klon um. Zwei Festlegungen im Repo beriefen sich noch auf
Eigenschaften der alten Umgebung, ohne dass jemand nachgesehen hätte, ob sie
überhaupt noch gelten. Solche Sätze sind gefährlicher als offene Punkte: Sie
sehen aus wie geprüftes Wissen und werden nicht mehr hinterfragt.

**Beobachtung 1 — der Session-Start-Hook funktioniert.** Diese Sitzung
startete direkt in `~/Documents/Claude/testapp`, und die Zeile
`=== Projekt Unfold ===` erschien mitsamt dem vollständigen Hook-Text. Damit
ist der Fehlschlag vom selben Tag erklärt: Er lag am Startverzeichnis eine
Ebene über dem Repo, nicht am Hook. Der offene Punkt in `status.md` ist
gestrichen; an seiner Stelle steht jetzt die Diagnoseregel — bleibt die Zeile
künftig aus, ist **zuerst das Arbeitsverzeichnis** zu prüfen.

**Beobachtung 2 — Git-Tags lassen sich pushen.** Bislang stand in
`CLAUDE.md` und `milestones.md`, das ginge nicht (HTTP 403 in der
Container-Umgebung). Geprüft statt vermutet, mit einem Wegwerf-Tag:
`test-tag-push-probe` angelegt, gepusht, per `git ls-remote --tags` auf dem
Server bestätigt, dann beidseitig gelöscht. Alle Schritte liefen fehlerfrei;
der Server ist danach wieder tag-frei.

**Entscheidungen:**

1. **Tags bleiben trotzdem vorerst ungenutzt.** Der Grund ist jetzt ein
   inhaltlicher, kein technischer: `docs/milestones.md` trägt zu jedem Stand
   eine Beschreibung, die ein Tag-Name nicht fassen kann, und ist ohne
   Git-Kenntnisse lesbar. Tags kommen mit echtem App-Code und Semantic
   Versioning dazu — **zusätzlich** zur Tabelle, nicht an ihrer Stelle.
   Wichtig ist die Unterscheidung: Eine Konvention, die aus einer
   Einschränkung entstanden ist, muss neu begründet werden, sobald die
   Einschränkung verschwindet — sonst schleppt das Projekt Regeln mit, deren
   Grund niemand mehr kennt.

2. **Die Begründungen in `CLAUDE.md` korrigiert.** An drei Stellen stützte
   sich die Doku- und Push-Pflicht darauf, dass „der Session-Container
   temporär" sei. Das trifft nicht mehr zu. Die Regeln selbst bleiben
   unverändert richtig, sie schützen nur gegen ein anderes Risiko:
   - Commit-Pflicht → weil der **Chat** flüchtig ist, nicht die Umgebung.
   - Push-Pflicht → weil GitHub die einzige Kopie **außerhalb dieses einen
     Rechners** ist; Ungepushtes überlebt keinen Plattendefekt.

**Warum das dokumentiert wird:** Eine falsche Begründung unter einer
richtigen Regel hält genau so lange, bis jemand die Regel hinterfragt — dann
wirkt sie hinfällig, und die Regel fällt mit. Deshalb ist die Begründung
nachzuziehen und nicht nur die Regel zu behalten.

## 2026-08-07 — Portabilität: was ein Klon nicht mitbringt

**Kontext:** Der Nutzer fragte, wie das Projekt funktioniert, wenn er von
einem anderen Laptop aus arbeitet, auf dem der lokale Klon nicht liegt.
Anlass, die Portabilität einmal wirklich nachzusehen statt anzunehmen.

**Befund — portabel ist alles bis auf einen Punkt:**

- Eingecheckt sind nicht nur Doku und Mockup, sondern auch
  `.claude/settings.json` (die Hooks) und `.claude/commands/` (die
  Auslöser `start unfold` / `ende unfold`) sowie
  `scripts/session-check.sh`. Ein Klon bringt die gesamte Arbeitsweise mit,
  nicht nur den Inhalt.
- Die Hooks adressieren durchgängig über `$CLAUDE_PROJECT_DIR`. Eine Suche
  nach absoluten Pfaden (`/Users/`, `/home/`, `Documents/Claude`) über alle
  eingecheckten Dateien ergab **keinen einzigen Treffer**. Es gibt also
  nichts, was an diesen einen Rechner gebunden wäre.
- **Die Ausnahme: die Commit-Identität.** Sie ist bewusst repo-lokal
  gesetzt (Eintrag vom 2026-08-06, damit andere Projekte unberührt
  bleiben). Repo-lokale Konfiguration lebt in `.git/config` — und die wird
  bei `git clone` **nicht** übertragen. Auf einem frischen Rechner greift
  dessen globale Einstellung; beim Nutzer zeigt die auf den älteren Account
  `SchnapsideeAT`. Commits gingen dann unter falschem Namen raus.

**Warum das eine echte Falle ist und kein Schönheitsfehler:** Der Fehler
ist völlig geräuschlos. Nichts bricht, keine Warnung erscheint, der Push
gelingt. Auffallen kann er nur, wenn jemand später in die GitHub-Historie
schaut — und dann sind die falschen Commits schon geschrieben und nur noch
per History-Rewrite zu korrigieren. Genau die Klasse von Problemen, die in
eine Übergabedatei gehört.

**Entscheidung:** Die repo-lokale Identität **bleibt** — ihr Vorteil (keine
Einmischung in die globale Konfiguration anderer Projekte) wiegt schwerer
als die Unbequemlichkeit, sie nach einem Klon einmal zu setzen. Stattdessen
wird der Klon-Vorgang in `docs/status.md` §0 als abhakbare Schrittfolge
dokumentiert, inklusive `git config user.name/user.email`.

**Zwei Punkte gleich mit festgehalten:**

1. **Abmelden auf fremden Geräten.** `gh auth login` hinterlässt ein
   dauerhaftes Token mit Schreibzugriff auf das GitHub-Konto. Auf einem
   Rechner, der dem Nutzer nicht gehört, gehören danach `gh auth logout`
   und das Löschen des Klons dazu — sonst erbt der nächste Nutzer den
   Zugriff.
2. **Die Web-Variante als Ausweg ohne Klon.** Claude Code im Web arbeitet
   direkt gegen GitHub, ohne Installation und ohne Anmeldung auf dem
   fremden Gerät. Dort gilt die ursprüngliche Container-Logik wieder in
   voller Schärfe: Die Umgebung ist temporär, Ungepushtes ist verloren.
   Deshalb wurde die Container-Begründung gestern zwar aus `CLAUDE.md`
   entfernt, aber **nicht ersatzlos** — sie steht jetzt dort, wo sie
   zutrifft, nämlich beim Web-Weg in `status.md`.

## 2026-08-07 — Die Abschlussprüfung fragte nie, ob der Stand ankommt

**Kontext:** Der Nutzer stellte zwei Rückfragen, die wie
Verständnisfragen klangen und beide eine Lücke aufdeckten: Müsste
`ende unfold` den Stand nicht ohnehin nach `main` bringen, und müsste
`start unfold` nicht ohnehin vorher `git pull` machen?

**Befund — beides war nicht abgedeckt:**

- `ende.md` sagte nur „Alles pushen". `session-check.sh` prüfte in
  Abschnitt 2 lediglich, ob der **aktuelle Branch** mit
  `origin/<derselbe Branch>` gleichauf ist.
- `start.md` las mit `git log --oneline -15` ausschließlich **lokale
  Refs**. Ohne `git fetch` ist ein veralteter Klon nicht von einem
  aktuellen zu unterscheiden.

**Warum das die schwerere Sorte Fehler ist:** Die Prüfung war am
2026-08-06 **grün**, während der komplette Projektstand an
`claude/todo-app-brainstorm-fmv1sd` hing und `main` ein leeres README
war. Eine Prüfung, die im Schadensfall grün leuchtet, ist schlimmer als
gar keine — sie erzeugt Sicherheit, statt sie zu geben. Der Grund war
eine zu eng gestellte Frage: „Ist gepusht?" statt „Ist angekommen?".

**Entscheidung — drei Änderungen:**

1. **`session-check.sh` Abschnitt 3 (neu): „Stand in main angekommen".**
   Prüft mit `git merge-base --is-ancestor HEAD origin/main`, ob der
   Arbeitsstand tatsächlich in der Hauptlinie liegt. Als `[OFFEN]`, nicht
   als `[pruefen]` — genau dieser Fund war einmal existenzbedrohend.
2. **`ende.md` Schritt 10 (neu).** Meldet den Zustand und **fragt** nach
   dem Weg (Fast-Forward oder PR). Merge nach `main` bleibt bewusst eine
   Entscheidung des Nutzers.
3. **`start.md` Schritt 3 erweitert:** `git fetch origin` vor der
   Beurteilung des Stands, plus Abgleich gegen `origin/main`.

**Zwei bewusste Einschränkungen:**

- **Kein automatischer `fetch` im Prüfskript.** Es soll offline laufen,
  und ein stiller Netzzugriff in einer Prüfung ist eine unangenehme
  Überraschung. Stattdessen weist der Befund auf `git fetch origin` hin.
- **Abschnitt 3 schweigt im Kurzmodus.** Ein Nebenbranch ist gepusht,
  also nicht in Verlustgefahr — er liegt nur am falschen Ort. Ein Hook,
  der das nach jedem Schritt anmahnt, wird nach zwei Tagen ignoriert, und
  dann fällt auch der echte Fund nicht mehr auf.

**Gegengeprüft:** Der Probelauf meldet die aktuelle Web-Sitzung korrekt
als „1 Commit nicht in origin/main"; der Kurzmodus schweigt dazu.

## 2026-08-07 — §4.5 vor §4.6 sortiert (Nummern unverändert)

**Kontext:** Der offene Faden aus der Vorsitzung. Umsortieren war
zurückgestellt worden, weil Abschnittsnummern anderswo referenziert sein
könnten. Der Nutzer bat um eine sorgfältige Prüfung statt einer
Vermutung.

**Prüfung:** Alle getrackten Dateien, beide Schreibweisen (`4.5`/`4,5`,
`4.6`/`4,6`). Ergebnis: **zwei echte Referenzen**, beide in
`docs/status.md` (Zeilen 117 und 125). Die übrigen Treffer sind keine
Referenzen — `4,5:1` in `spec.md` und `4.5` in `test_contrast.js` sind
der WCAG-Kontrastschwellwert, der Treffer in `logo.svg` ist eine
Pfadkoordinate.

**Entscheidung:** Nur die **Textblöcke** getauscht, die **Nummern
bleiben** `4.5` und `4.6`. Damit stimmen auch die zwei Referenzen
unverändert weiter — das Risiko war nicht klein, sondern null.
Umnummerieren wurde verworfen: Es hätte echten Bruch erzeugt, um ein
rein kosmetisches Problem zu lösen.

### Nachtrag, gleicher Tag — von „fragen" auf „ausführen" korrigiert

Der Eintrag oben legte fest: *„Merge nach `main` bleibt bewusst eine
Entscheidung des Nutzers."* **Das war zu zaghaft und wird hiermit
revidiert.** Der alte Text bleibt stehen, damit nachvollziehbar ist, was
zwischenzeitlich galt.

**Anlass:** Der Nutzer stellte klar, dass `ende unfold` die Drift
*vermeiden* soll, und begründete es mit dem entscheidenden Satz: Er ruft
diese Befehle **bewusst auf, weil sie Aktionen auslösen**. Ein Befehl,
den man eigens aufruft, um etwas zu bewirken, darf nicht bloß eine Frage
stellen.

**Warum die Rückfrage sogar schädlich war:** `ende unfold` läuft
definitionsgemäß, wenn der Nutzer die Sitzung **verlässt**. Eine Frage
zu diesem Zeitpunkt trifft mit hoher Wahrscheinlichkeit niemanden mehr
an — die Antwort kommt nie, und die Drift bleibt. Die Rückfrage war also
genau an der Stelle eingebaut, an der sie am wenigsten wirken kann. Sie
hätte das Problem vom 2026-08-06 **nicht** verhindert.

**Neue Regel, beide Befehle gleich gebaut:**

| | läuft von selbst | stoppt und fragt |
|---|---|---|
| `start unfold` | `git pull --ff-only origin main` | Arbeitsverzeichnis nicht sauber, oder Pull bricht ab |
| `ende unfold` | `git push origin HEAD:main`, wenn `main` Vorfahr von `HEAD` ist | `main` hat eigene Commits, ist also auseinandergelaufen |

**Warum ausgerechnet der Fast-Forward die richtige Grenze ist:** Er kann
per Konstruktion nichts verlieren — er hängt nur an, was ohnehin fehlt,
und existiert schlicht nicht, wenn die Stände auseinanderlaufen. Damit
fällt die Automatik genau dann aus, wenn Urteilsvermögen nötig ist, und
läuft genau dann, wenn es keines braucht. `--force` ist in beiden
Befehlen ausdrücklich verboten.

**Verworfen: immer einen Pull Request öffnen.** Sichtbar und
nachvollziehbar, aber es verlagert die Drift nur — ein ungemergter PR
ist derselbe auseinanderlaufende Stand, nur mit Weboberfläche davor. Für
ein Ein-Personen-Projekt ohne Review-Pflicht ist das Zeremonie ohne
Ertrag. Bleibt als Option, sobald jemand zweites mitarbeitet.

**Was `session-check.sh` Abschnitt 3 jetzt ist:** kein Wächter mehr,
sondern ein **Netz darunter**. Er meldet die Drift auch dann, wenn
`ende unfold` gar nicht gelaufen ist — etwa weil die Sitzung abbrach.

## 2026-08-07 — „Alle 40 laufen grün" nachgeprüft statt geerbt

**Kontext:** In `docs/status.md` stand, die 40 Prüfskripte liefen alle
grün. Diese Aussage stammte aus einer früheren Sitzung und war seither
**nie nachgeprüft** worden — sie wurde von Übergabe zu Übergabe
weitergereicht. Der Nutzer bat, das Projekt auf sauberen Stand zu
bringen. Also: nachmessen.

**Warum die Aussage nicht nachprüfbar war:** Es gab keinen Läufer. Wer
sie prüfen wollte, musste 40 Aufrufe von Hand absetzen und ihre Ausgaben
lesen. **Eine Zusicherung, die zu teuer im Nachprüfen ist, wird nicht
nachgeprüft** — sie wird geglaubt. Genau das war passiert.

**Entscheidung:** `scripts/run-mockup-tests.sh` angelegt (ins Repo, nicht
ins Scratchpad — Projektregel). Er fällt ein Urteil pro Skript, statt nur
Text auszugeben:

| Befund | Urteil |
|---|---|
| Rückgabewert ≠ 0 | FEHLER |
| eine `>>>`-Zeile endet auf `false` | ROT |
| sonst | ok |

**Befund des ersten echten Laufs (Playwright 1.56.1, 44 Skripte):**

- **41 grün, 1 rot, 1 Fehlalarm, 1 Zeitüberschreitung** — die Aussage
  „alle grün" war also **nicht falsch, aber auch nicht stabil**.
- **`test_4bugs` ist ein Wackelkandidat**, kein fester Fehler: über 10
  Läufe **5× grün, 5× rot**. Getippter Text zwischen zwei Aufgaben
  verliert die ersten Zeichen (`LINE("EN")` statt `LINE("ZWISCHEN")`).
  Ein Münzwurf, der als „grün" durchging, weil ihn niemand wiederholt
  hat.

**Zwei Fehler im Läufer selbst, sofort korrigiert** — beide von der Sorte
„Wächter, der falschen Alarm schlägt und deshalb ignoriert wird":

1. **Fehlalarm bei `test_typing3`.** Die Suche nach `false` traf das Wort
   im angehängten Messwert-JSON (`{"idx":0,"atEnd":false}`), obwohl die
   Zusicherung `true` lautete. Jetzt wird der JSON-Anhang erst
   abgeschnitten und dann auf `: false` am **Zeilenende** geprüft.
2. **Zeitgrenze zu knapp.** 120 s meldeten `test_fuzz_all` als
   „abgestürzt", obwohl es nur länger läuft — es spielt hunderte
   Drag-Kombinationen durch. Grenze auf 600 s, über
   `MOCKUP_TEST_TIMEOUT` einstellbar.

**Nebenbefund zur Aussagekraft:** Von 44 Skripten haben nur **sechs**
echte Zusicherungen (`>>>`-Zeilen). Die übrigen sind **Messskripte** —
sie drucken Zahlen, die ein Mensch beurteilt. Das betrifft auch
`test_contrast`, auf dem die Aussage „erfüllt WCAG AA in beiden Themes"
beruht: Sie ist **nicht mechanisch nachprüfbar**, sondern wurde einmal
von Hand abgelesen. Bewusst **nicht** jetzt umgebaut — siehe nächster
Eintrag.

## 2026-08-07 — Playwright auf 1.56.1 festgenagelt

**Kontext:** `CLAUDE.md` verlangt, jede Fremdbibliothek auf eine exakte
Version festzunageln und das Lockfile mitzucommitten. Die 40
Prüfskripte hingen aber an einer **global installierten** Playwright-
Installation (`NODE_PATH="$(npm root -g)"`) — ohne `package.json`, ohne
Lockfile, ohne Versionsangabe irgendwo im Repo. Die eigene Regel war
unbemerkt verletzt.

**Warum das mehr als Formalismus ist:** Diese Skripte messen gerenderte
Pixel, Geometrie und Farbkontraste. Eine andere Chromium-Version rendert
minimal anders. Läuft künftig ein Skript rot, wäre **nicht
unterscheidbar**, ob das Mockup kaputt ist oder nur der Browser sich
geändert hat. Bei einem Wackelkandidaten wie `test_4bugs` wäre man ohne
diese Angabe auf die falsche Fährte gelaufen.

**Entscheidung:** `package.json` mit `"playwright": "1.56.1"` — exakt,
kein Bereich — plus `package-lock.json` mit Integritätsprüfsummen. Der
Lockfile wurde mit `npm install --package-lock-only` erzeugt: Er nagelt
die Version fest, **ohne** `node_modules` anzulegen. Die Skripte laufen
weiterhin gegen die globale Installation; die Deklaration hält fest,
gegen welche Version zuletzt gemessen wurde.

## 2026-08-07 — CI bewusst zurückgestellt, nicht vergessen

**Kontext:** `CLAUDE.md` fordert eine GitHub-Actions-Pipeline, „sobald
eine lauffähige Codebasis existiert". Mockup plus Prüfskripte sind
lauffähig und automatisierbar — die Bedingung ist seit Wochen erfüllt,
die Pipeline fehlt. Die Regel stand also im Dokument und wurde
stillschweigend nicht befolgt.

**Warum das nicht folgenlos ist:** Eine Regel, die sichtbar nicht gilt,
entwertet die Regeln daneben. Wer eine unbefolgte Regel sieht, hält die
nächste auch für unverbindlich.

**Entscheidung: zurückstellen — aber schriftlich.** Begründung:

- Die Pipeline müsste beim Flutter-Umstieg **vollständig neu
  geschrieben** werden (Dart statt Node, `flutter test` statt
  Playwright). Sie hätte ein Verfallsdatum von wenigen Wochen.
- Das Mockup wird laut `spec.md` §4.5 ohnehin **eingefroren**. Eine
  Pipeline, die ein eingefrorenes Artefakt bewacht, prüft nichts, was
  sich noch ändert.
- Der eigentliche Zweck — „läuft es noch?" — ist mit
  `scripts/run-mockup-tests.sh` jetzt in **einem Befehl** erreichbar.
  Das war die tatsächliche Lücke, nicht die fehlende Automatik.

**Fällig wird CI mit dem ersten Flutter-Code**, zusammen mit Lint und
Type-Check. Steht so auch in `docs/status.md` als Schritt 4.

**Nicht getan, bewusst:** `test_contrast` und die anderen Messskripte in
echte Zusicherungen umbauen. Dieselbe Begründung — sie messen ein
Artefakt, das eingefroren wird. Die Arbeit gehört in die Flutter-Tests,
wo sie Bestand hat.

## 2026-08-07 — `test_4bugs` bleibt rot: Reparatur wäre verlorene Zeit

**Befund:** Über 10 Läufe **5× grün, 5× rot**. Tippt man in die
eingeklappte Füllzeile zwischen zwei Aufgaben, gehen die ersten Zeichen
verloren — im Protokoll steht `LINE("EN")` statt `LINE("ZWISCHEN")`. Die
Zusicherung lautet „text between tasks persists".

**Ursache:** Die eingeklappte Füllzeile klappt beim ersten Tastendruck
auf und schluckt dabei Anschläge. Das ist kein Zufallsfehler, sondern
ein Wettlauf zwischen Aufklappen und Tastatureingabe — deshalb der
Münzwurf.

**Entscheidung: nicht reparieren.** `spec.md` §2.3 hält bereits fest,
dass die gesamte Füllzeilen-Konstruktion ein **Notbehelf von
`contenteditable`** ist und **nicht** nach Flutter übernommen wird. Dort
sitzt der Cursor auf einer **Knotenposition** im Dokumentmodell,
unabhängig davon, ob der Knoten Text enthält — es gibt keine Füllzeile,
die auf- oder zuklappen könnte. **Der Fehler verschwindet beim Umstieg
ersatzlos.** Jede Stunde, die jetzt hineinfließt, ist in wenigen Wochen
gelöscht.

Das ist die Anwendung einer bestehenden Projektregel („Unnötige Arbeit
abraten", `CLAUDE.md`) auf einen konkreten Fall.

**Warum er trotzdem dokumentiert wird, statt das Skript zu entfernen:**

- Ein rot laufendes Skript, dessen Rot **erklärt** ist, kostet nichts.
  Ein gelöschtes Skript nimmt die Messung mit, die man beim Bau des
  Flutter-Editors gern zum Vergleich hätte.
- Ohne diesen Eintrag würde die nächste Sitzung den roten Lauf finden,
  ihn für einen Rückschritt halten und mit der Reparatur beginnen —
  genau die Zeitverschwendung, die hier vermieden werden soll.

**Merke für den Flutter-Bau:** Dass ausgerechnet hier ein Wettlauf
auftritt, ist ein Hinweis, worauf beim Editor zu achten ist — die
Eingabe darf nie auf eine Layout-Änderung warten müssen.

### Nachtrag, gleicher Tag — der HANG war ein Messartefakt

Der Eintrag oben führte `test_fuzz_all` als „Zeitüberschreitung" und
nannte einen gemeldeten `*** HANG`. Beides nachgemessen, beides
entwarnt:

- **Laufzeit: 119 s und 120 s** in zwei Läufen. Die Zeitgrenze des
  Läufers lag bei **120 s** — der „Absturz" war die Uhr, um eine
  Sekunde. Ein knapp bemessener Grenzwert erzeugt einen Fehlbefund, der
  wie ein Produktfehler aussieht.
- **Inhaltlich sauber:** 760 Drag-Kombinationen in beiden Läufen,
  **0 Hänger**, keine hängengebliebenen Ghost-Elemente oder
  Sortier-Zustände, keine Seitenfehler, App danach voll bedienbar.

Der eine `*** HANG` aus dem ersten Sammellauf war also ein Ausreißer
unter Last: Die Erkennung wartet 3 s auf eine Antwort der Seite, und
unter Vollast reicht das nicht immer. **Der Pointer-Sortierer, der das
native HTML5-Drag&Drop ersetzt hat, ist damit erneut bestätigt.**

**Lehre, die über diesen Fall hinausgeht:** Zwei der drei „Fehler" im
ersten Lauf lagen im **Prüfwerkzeug**, nicht im Geprüften — ein zu
knapper Zeitwert und eine zu grobe Textsuche. Ein frisch gebautes
Prüfwerkzeug ist zuerst gegen sich selbst zu prüfen, sonst erzeugt es
Arbeit, statt sie zu sparen.

## 2026-08-07 — „+" an der Gruppe hebt sich nur über das Icon hervor

**Kontext:** Der Nutzer merkte an, dass der „+"-Knopf, der beim
Überfahren einer Gruppe erscheint (Liste in dieser Gruppe anlegen), sich
**bis auf das Icon** genauso verhält wie der Löschknopf daneben: Beide
füllten sich beim Hovern mit einer farbigen Fläche. Sein Wunsch: nur die
Icon-Farbe wechselt, der Knopf bleibt flächenlos.

**Warum das mehr ist als Geschmack — und warum ich zustimme:** Die beiden
Knöpfe sitzen unmittelbar nebeneinander in derselben Zeile. Gab man
beiden eine gefüllte Fläche, sah das **harmlose Anlegen einer Liste**
optisch so gewichtig aus wie das **Löschen einer Gruppe**. Die visuelle
Gewichtung soll aber die Tragweite der Aktion abbilden, nicht
verwischen — sonst zögert man vor dem Ungefährlichen und klickt das
Gefährliche zu schnell. Dazu kommt, dass zwei gefüllte Flächen
nebeneinander die Gruppenzeile unruhig machen.

**Entscheidung:** `background: var(--accent-soft)` beim Hover des
„+"-Knopfes entfällt; `color: var(--accent-strong)` bleibt. **Der
Papierkorb behält seine Fläche** — er ist die folgenschwere Aktion und
darf sich melden.

Der Kontrast bleibt gewahrt: `--accent-strong` ist die Textvariante des
Akzents (`#b32f10` hell, `#f38a6e` dunkel) und erfüllt WCAG AA in beiden
Themes — die Regel greift über die Variable, also auch im Dunkelmodus.

**Gegengeprüft und festgehalten:** Neues Prüfskript
`design/mockups/tests/test_group_add_hover.js` mit vier Zusicherungen —
„+" flächenlos, „+" wechselt die Icon-Farbe, Papierkorb behält seine
Fläche, beide bei Gruppen-Hover sichtbar. Alle vier grün. Damit ist die
Regel nicht nur beschrieben, sondern **mechanisch nachprüfbar**: Sie
gehört zu den wenigen Skripten mit echten Zusicherungen (jetzt 7 von 45)
und schlägt an, falls jemand die Fläche später zurückbaut.

## 2026-08-07 — Darstellungs-Schalter mit gleitendem Knopf

**Kontext:** Der Nutzer zeigte einen segmentierten iOS-Schalter (weißer
Knopf, der zwischen zwei Feldern gleitet) und wollte den bisherigen
Umschalter dadurch ersetzen — **dunkel links, hell rechts**.

**Ausgangslage:** Der Schalter war bereits segmentiert, aber ohne
Bewegung: Das aktive Feld bekam schlagartig eine Akzentfläche. Die
Reihenfolge war Hell · Dunkel · System.

**Entscheidung — drei Punkte, zwei davon über das Verlangte hinaus:**

**1. Gleitender Knopf, ausschließlich per `transform`.** Ein eigenes
Element (`.theme-seg-thumb`) liegt hinter den Beschriftungen und wird mit
`translateX(n · 100%)` bewegt, Dauer `--dur-base` (200 ms), Kurve `--ease`.
`left`/`width` zu animieren hätte gleich ausgesehen, aber in jedem Bild
ein neues Layout erzwungen — die Projektregel aus `spec.md`
(„Alle Bewegungen animieren ausschließlich `transform`") ist hier keine
Förmlichkeit, sondern der Unterschied zwischen Compositor und Layout.
Damit `translateX(100%)` genau ein Feld weit trägt, musste das `gap: 4px`
zwischen den Feldern entfallen — sonst wären die Felder nicht exakt ein
Drittel breit.

**2. „System" bleibt — in der Mitte.** Die Vorlage des Nutzers zeigt zwei
Felder, der bestehende Schalter hatte drei. Zwei zu bauen hätte bedeutet,
die Option „folge der Systemeinstellung" **stillschweigend zu
entfernen** — ein Funktionsverlust, den die Bildvorlage nicht verlangt
hat. Sie steht jetzt in der Mitte, weil sie sachlich dorthin gehört: Sie
ist weder hell noch dunkel, sondern das, was dazwischen liegt. Die
Anordnung „dunkel links, hell rechts" ist damit exakt erfüllt. Wenn der
Nutzer wirklich zwei Felder will, ist es eine Zeile Arbeit — aber es
sollte seine Entscheidung sein, nicht ein Nebeneffekt meiner Umsetzung.

**3. Das Menü bleibt beim Umschalten offen.** Vorher setzte jeder Klick
`state.optionsOpen = false` und baute die Sidebar neu. Das hatte zwei
Folgen, die beide gegen die neue Bewegung arbeiteten:

- **Der Knopf hätte nie gleiten können.** `renderSidebar()` erzeugt den
  Knopf als neues Element, und CSS-Übergänge laufen nicht auf frisch
  erzeugten Elementen — er wäre gesprungen. Deshalb `syncThemeSegmented()`,
  das den Schalter **an Ort und Stelle** nachzieht.
- **Man hätte die Bewegung ohnehin nicht gesehen**, weil sich das Menü im
  selben Moment schloss. Und man konnte Hell und Dunkel nicht
  vergleichen, ohne das Menü jedes Mal neu zu öffnen — wofür ein solcher
  Schalter ja gerade da ist.

**Farbwahl:** Knopf `--surface` auf Schiene `--surface-sunken`, Schatten
`--el-1`, Radius `--r-sm` — alles bestehende Stufen, keine neuen Werte
(Projektregel gegen gewachsene Skalen). Die Akzentfläche des aktiven
Feldes entfällt: Sie war für einen ruhenden Einstellungs-Schalter zu
laut, und der gleitende Knopf trägt die Auswahl jetzt selbst.

**Gegengeprüft, an den real gerenderten Elementen:**

| | aktiv | inaktiv |
|---|---|---|
| hell | 12,91:1 | 4,70:1 |
| dunkel | 11,04:1 | 6,82:1 |

Alle über WCAG AA (4,5:1). **Der helle inaktive Wert ist mit 4,70:1
knapp** — wer `--ink-faint` oder `--surface-sunken` künftig anfasst, muss
hier nachmessen. Genau dafür gibt es jetzt das Skript.

**Neues Prüfskript `test_theme_switch.js`** mit sieben Zusicherungen:
Reihenfolge auf dem Bildschirm (nicht nur im Markup), Deckungsgleichheit
von Knopf und aktivem Feld in jeder Stellung (gemessen: Versatz 0,0 px,
Breitendifferenz 0,0 px), Bewegung per `transform` statt Layout, Menü
bleibt offen, und die vier Kontrastwerte oben. Damit ist auch die
`transform`-Regel erstmals **mechanisch** abgesichert und nicht nur
beschrieben.

### Nachtrag, gleicher Tag — zwei Felder, und der Schalter ersetzt den Optionen-Knopf

Der Eintrag oben behielt „System" bei und ließ den Schalter in einem
Aufklapp-Panel hinter dem Knopf „Optionen" sitzen. **Beides hat der
Nutzer korrigiert.** Der alte Text bleibt stehen, damit nachvollziehbar
ist, was zwischenzeitlich galt.

**1. Nur noch zwei Felder: Dunkel · Hell.** Ich hatte „System" bewusst
behalten, um die Systemfolge nicht stillschweigend zu streichen, und das
so gesagt. Der Nutzer hat entschieden: zwei. Damit ist es entschieden —
die Option ist entfernt, nicht versteckt.

Was das technisch bedeutet: `data-theme` trägt jetzt immer `light` oder
`dark`, nie mehr gar nichts. Der Block
`@media (prefers-color-scheme: dark)` in der CSS **bleibt trotzdem**: Er
regelt weiterhin den ersten Bildaufbau, bevor das Skript `data-theme`
setzt. Er ist damit vom Hauptweg zur Rückfallebene geworden — wer die
Farben ändert, muss ihn weiter mitpflegen (siehe Fallstrick „Drei
Theme-Blöcke" in `docs/status.md`).

**2. Der Schalter ersetzt den Knopf „Optionen" samt Panel.** Er steht
jetzt direkt in der Sidebar, unten über den beiden Aktionsknöpfen.

**Warum das die bessere Lösung ist — und ich es vorher hätte sehen
müssen:** Ein Aufklapp-Menü für **eine einzige Einstellung mit zwei
Werten** ist ein Umweg mit drei Nachteilen. Man sieht die aktuelle Wahl
nicht, ohne das Menü zu öffnen. Man braucht zwei Klicks statt einem. Und
der eigentliche Zweck eines segmentierten Schalters — beide Zustände
nebeneinander sehen und vergleichen — wird von einem Menü, das darüber
liegt, gerade zunichtegemacht. Ich hatte im Eintrag oben noch eigens
dafür gesorgt, dass das Menü offen **bleibt**; das war die Reparatur
eines Symptoms, dessen Ursache das Menü selbst war.

**Ersatzlos entfernt:** `.options-wrap`, `.options-panel`,
`.options-title`, `state.optionsOpen`, die beiden Klick-Zweige zum
Öffnen und Schließen sowie `svgGearPath()` — das Zahnrad-Icon hatte
keinen zweiten Verwendungsort. Toter Code, der stehen bleibt, wird beim
nächsten Lesen für absichtlich gehalten.

**Nachgezogen, was sonst still ausgefallen wäre:** `test_fuzz_all.js` und
`test_sidebar_fuzz.js` zogen bisher an `#optionsBtn`. Der Selektor trifft
nichts mehr, und beide Skripte überspringen fehlende Elemente
**stillschweigend** (`if (!S || !D) continue;`) — die Abdeckung wäre
lautlos geschrumpft, ohne dass ein Lauf rot geworden wäre. Beide zeigen
jetzt auf `.theme-segmented`, also auf das Element, das dort tatsächlich
sitzt.

**Breite des gleitenden Knopfes** hängt jetzt an
`--seg-count`, das die Auszeichnung aus `THEME_ORDER.length` setzt. Vorher
stand die Feldzahl fest in der CSS (`/ 3`) und noch einmal im Skript —
genau die Art Doppelung, die beim nächsten Ändern auseinanderläuft.

**Gegengeprüft:** `test_theme_switch.js` umgestellt und um zwei
Zusicherungen erweitert — „Schalter ist ohne Aufklappen sichtbar" und
„kein Rest des alten Optionen-Menüs". Neun Zusicherungen, alle grün.
Deckungsgleichheit weiterhin 0,0 px Versatz und 0,0 px Breitendifferenz;
Kontraste unverändert (hell 12,91 / 4,70 · dunkel 11,04 / 6,82). Keine
Seitenfehler beim Laden, beim mehrfachen Umschalten oder nach einem
Navigationswechsel.

## 2026-08-07 — Fälligkeit: eine dauerhafte Zeile statt eines Menüs

**Kontext:** Aus dem Referenzbild übernommen (Muster `Short | Long | 8s`).
Der Nutzer entschied sich nach der Vorschau für die Spielart **2a** — die
Zeile steht **dauerhaft** im Kopf der Aufgabenseite — und ergänzte:
„Nächste Woche" solle raus, *„da man sich ja sowieso für nächste Woche
eher ein Datum aussuchen würde"*.

**Das Argument ist richtig, und es löst nebenbei ein gemessenes Problem.**
Die Vorschau hatte gezeigt: Mit drei Schnellwahl-Feldern passt die Zeile
**nicht** in die schmalste Spalte (drei offene Spalten) — der Datums-Chip
wurde vom Spaltenrand abgeschnitten. Mit zwei Feldern passt sie: gemessen
**84,5 px Luft** bei 346 px Spaltenbreite, eine Zeile hoch. Aus einer
inhaltlichen Vereinfachung wurde damit auch die technische Lösung.

**Ersetzt die Festlegung in `spec.md` §4.2 vom 2026-08-06**, die
„Heute · Morgen · Nächste Woche · Datum wählen · Entfernen" als
fünfzeiliges Menü vorsah. Der Abschnitt ist überschrieben, die alte
Fassung ist über die Git-Historie erreichbar; die Begründung steht hier.

**Zwei Feinheiten, die beim Bauen aufkamen:**

1. **Der Chip wiederholt die Schnellwahl nicht.** Erste Fassung zeigte bei
   aktivem „Heute" auch im Chip „Heute" — zweimal dasselbe Wort
   nebeneinander. Jetzt nennt der Chip in diesem Fall das konkrete Datum
   (`5. Aug`). Er ergänzt, statt zu doppeln.
2. **Das native Datumsfeld liegt unsichtbar unter dem Chip** und wird per
   `showPicker()` geöffnet. Sichtbar würde es die Browser-Gestaltung in
   eine sonst durchgestaltete Oberfläche holen — im alten Menü war genau
   das der Fall und sah wie ein Fremdkörper aus.

**Beinahe-Fehler beim Aufräumen, festgehalten weil lehrreich:** Mit dem
alten Menü wäre die Animation `due-menu-in` verschwunden — die das
`/`-Blockmenü noch benutzt. Es wäre lautlos ohne Einblendung erschienen,
und niemand hätte es einem Commit zugeordnet, der „Fälligkeitsmenü
entfernt" heißt. Die Animation heißt jetzt `menu-in` und steht bei ihrem
Verwender. **Wer etwas entfernt, muss prüfen, was daran hing.**

**Gegengeprüft:** `test_due_row.js`, elf Zusicherungen, alle grün —
darunter „Zeile passt in die schmalste Spalte" (der Punkt, an dem der
erste Entwurf scheiterte) und „Überfälliges trägt zusätzlich einen
Rahmen" (die Zugänglichkeitsregel aus §4.2).

## 2026-08-07 — Kein Titelmenü: Overlays sind die letzte Wahl

**Kontext:** Der Nutzer hatte Entwurf 1 (Titel mit Aufklappmenü) zunächst
zugesagt, dann aber gefragt, ob es *„ohne dass sich ein kleines Fenster
öffnet"* gehe — mit der Begründung, die App solle minimalistisch und
intuitiv bleiben, mit so wenigen Klicks wie möglich, ohne dabei überfüllt
zu wirken.

**Die Frage kippt meine eigene Empfehlung, und zwar zu Recht.** Ich hatte
das Menü vorgeschlagen, weil „Löschen" nur an einem Hover-Papierkorb
hängt. Beim zweiten Hinsehen trägt der Vorschlag nicht: Von den vier
Menüpunkten braucht **keiner** ein Menü.

| Menüpunkt | Besserer Weg |
|---|---|
| Umbenennen | Der Titel **ist** ein Eingabefeld. Hineinklicken, tippen. **Null** zusätzliche Klicks statt zwei |
| Farbe ändern | Der Punkt vor dem Titel zeigt die Farbe **und** ändert sie. Ein Klick öffnet die Reihe **im Fluss**, kein Overlay |
| In Gruppe verschieben | **Gibt es bereits**: Liste in der Sidebar auf eine Gruppe ziehen (`spec.md` §2.4) |
| Liste löschen | **Gibt es bereits**: Papierkorb beim Überfahren der Sidebar-Zeile |

**Das Menü hätte also zwei Wege dupliziert und zwei Dinge umständlicher
gemacht, als sie sein müssen.** Ein Overlay verdeckt zudem genau den
Inhalt, den man beurteilt, und verbirgt den aktuellen Zustand, bis man es
öffnet — bei einer Farbe, die man sehen will, ist das das Gegenteil des
Gewollten.

**Entscheidung:** Kein Titelmenü. Stattdessen zwei direkte Eingriffe:

1. **Listentitel wird ein Eingabefeld** — Umbenennen war vorher **gar
   nicht möglich**. Der Entwurf hat also eine echte Lücke aufgedeckt, nur
   nicht die, die ich vermutet hatte.
2. **Farbpunkt vor dem Titel**, der die fünf kuratierten Farben als Reihe
   **unter** dem Titel aufklappt. Unter und nicht daneben, weil daneben
   die Überschrift beim Öffnen zur Seite rückte — ein springender Titel
   ist unruhiger als eine zusätzliche Zeile.

**Als Grundsatz nach `spec.md` §2.5 übernommen**, weil er über diesen Fall
hinaus gilt: *Eine Aktion bekommt einen Ort. Wo eine Eigenschaft angezeigt
wird, wird sie auch geändert. Overlays sind die letzte Wahl.* Derselbe
Gedanke hatte schon den Darstellungs-Schalter aus seinem Menü geholt —
jetzt ist er aufgeschrieben, statt zweimal neu hergeleitet zu werden.

**Nicht gelöst, bewusst:** Dass „Liste löschen" allein an einem
Hover-Papierkorb hängt, bleibt. Es war mein ursprüngliches Argument für
das Menü, und es ist nicht falsch — nur ist ein Menü die teure Antwort
darauf. Gehört zu den Löschregeln (`spec.md` §4.3), die ohnehin als
nächstes anstehen.

**Gegengeprüft:** `test_list_header.js`, zehn Zusicherungen, alle grün —
darunter „Farbreihe liegt im Fluss, ist kein schwebendes Fenster"
(`position: static`) und „Farbreihe verdeckt keine Aufgabe" (gemessen:
36 px Abstand zur ersten Zeile).
