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
„kein Rest des alten Optionen-Menüs". Acht Zusicherungen, alle grün.
(Ich hatte hier zunächst neun geschrieben; der Läufer zählt acht.)
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

### Nachtrag, gleicher Tag — der Umbau hat ein Prüfskript mitgerissen

Der vollständige Durchlauf nach dem Umbau meldete `test_due` als
**abgestürzt**. Ursache war meine Änderung: Das Skript klickte auf
`[data-due-menu]`, ein Attribut, das mit dem Aufklappmenü verschwunden
ist. Ich hatte beim Umbau die beiden Fuzz-Skripte nachgezogen, dieses
aber übersehen.

**Nachgezogen** auf die neue Bedienung: `.due-seg-btn` statt Menüpunkt,
`.due-chip-x` statt `.due-clear`, `.due-chip-label` statt `.due-add`.
Das Skript prüft danach unverändert dieselben Verhaltensregeln und läuft
grün — inklusive der wichtigen Kette: Datum auf „Heute" setzen → Aufgabe
erscheint auf der Heute-Seite → Datum entfernen → Einladung ist zurück →
eine erledigte überfällige Aufgabe zählt nicht mehr mit (Zähler 5 → 4).

**Danach systematisch statt zufällig gesucht:** eine Suche über alle
Prüfskripte nach den entfernten Bezeichnern (`due-menu`, `due-add`,
`due-opt`, `due-clear`, `due-trigger`, `optionsBtn`, `options-panel`,
`svgGearPath`). Die verbliebenen Treffer sind Absicht — sie sichern zu,
dass es die Dinge **nicht** mehr gibt.

**Erfreulicher Nebenbefund:** `test_stress` enthielt seit jeher den Zweig
`if (t.tagName === 'INPUT')` zum Umbenennen einer Liste über den
Spaltentitel. Der lief bis heute **nie**, weil der Listentitel ein `<h2>`
war. Jetzt greift er zum ersten Mal — und besteht: Ein absurd langer
Listenname bringt weder Sidebar noch Fenster zum Überlaufen, er wird
sauber abgeschnitten (`namenAbgeschnitten: 1`, kein Überlauf).

**Lehre, zum zweiten Mal an einem Tag:** Wer etwas entfernt, muss suchen,
was daran hing — erst im Erzeugnis (die Animation `due-menu-in`), dann im
Prüfwerkzeug (`test_due`). Beide Male war der Schaden lautlos: Das eine
hätte ohne Animation ausgesehen, das andere hätte eine Prüfung
weggenommen. Ein vollständiger Durchlauf **nach** jedem Umbau ist deshalb
keine Kür.

## 2026-08-07 — Eigener Kalender, im Fluss statt als Fenster

**Kontext:** Der Nutzer meldete, dass „Datum wählen" und der Klick auf ein
gesetztes Datum **nichts tun** — man kann kein beliebiges Datum
auswählen. Dazu der Hinweis, an das Leitmotiv zu denken: minimalistisch,
intuitiv, so wenige Klicks wie möglich, umfangreich ohne überfüllt zu
sein.

**Warum es nicht ging — nachgemessen, nicht vermutet:** Der Chip war ein
`<label>` mit einem unsichtbaren `<input type="date">` darunter, geöffnet
per `showPicker()`. Eine Klickverfolgung zeigte, dass **ein** Mausklick
**zwei** Ereignisse auslöst: eines auf den Text und ein zweites, das das
`<label>` nativ an das Eingabefeld weiterreicht. Der erste
`showPicker()`-Aufruf verbraucht die Nutzeraktivierung, der zweite
scheitert daran — und mein `catch` schluckte den Fehler. Ein Fehler, der
nur im echten Browser auftritt und in einer Messung „ok" meldet.

**Die Reparatur wäre einfach gewesen** (Weiterleitung unterbinden). Sie
wird trotzdem nicht gemacht, weil die Grundlage falsch war:

1. **Das native Datumsfeld ist Fremdgestaltung.** Genau deshalb hatte ich
   es unsichtbar gemacht — im alten Menü sah es wie ein Fremdkörper aus.
   Ein unsichtbar gemachtes Element, das ein sichtbares Browser-Fenster
   öffnet, löst das Problem nicht, es verschiebt es.
2. **Es öffnet als schwebendes Fenster.** Unser eigener Grundsatz
   (`spec.md` §2.5) sagt: Overlays sind die letzte Wahl. Und wir hatten am
   selben Tag **gemessen**, dass Overlays am rechten Fensterrand
   abgeschnitten werden.

**Entscheidung: ein eigener Kalender, der im Fluss aufklappt** — genau
wie die Farbreihe im Spaltenkopf. Dieselbe Interaktionssprache, zweimal
angewandt, statt zweier verschiedener Lösungen für dasselbe Muster
„Wert aus einer Menge wählen".

- **Sieben Spalten à 26 px**, Woche beginnt am Montag. Gemessen **206 px**
  breit — passt mit 94,7 px Luft in die schmalste Spalte (240 px Minimum).
  Ein Overlay hätte hier Positionierungslogik gebraucht; ein Element im
  Fluss kann per Konstruktion nicht überlaufen.
- **Heute trägt einen Ring, das gewählte Datum eine Fläche.** Zwei
  verschiedene Träger, damit beide gleichzeitig lesbar bleiben — sonst
  verschwindet „heute", sobald es auch das gewählte Datum ist.
- **Tage der Nachbarmonate bleiben anklickbar**, treten aber zurück. Wer
  den 1. des Folgemonats sieht, will ihn auch treffen können.
- **Die sechste Zeile erscheint nur, wenn sie Tage des Monats enthält** —
  sonst springt die Höhe des Kalenders von Monat zu Monat ohne Grund.
- **Beim Öffnen** steht der Monat des gesetzten Datums, sonst der
  laufende: Man sucht meist in der Nähe dessen, was schon dasteht.

**Klickzahl:** Datum in dieser Woche → **ein** Klick (Heute/Morgen).
Beliebiges Datum → zwei (Chip, Tag). Anderer Monat → drei. Das native
Feld hätte im besten Fall dieselbe Zahl gebraucht, aber mit
Browser-Gestaltung und einem abschneidbaren Fenster.

**Layoutfehler beim Bauen, gleich behoben:** Der Kalender landete
zunächst **neben** der Zeile statt darunter — `.col-progress-row` ist ein
waagerechter Flex-Container. Zeile und Kalender stehen jetzt in einem
gemeinsamen, senkrecht stapelnden Block.

**Ersatzlos entfernt:** das unsichtbare `<input type="date"]`, der
`change`-Handler dazu und `data-pick-due`. Es gibt jetzt **kein** natives
Datumsfeld mehr in der Oberfläche — als Zusicherung im Prüfskript
festgehalten.

**Gegengeprüft:** `test_due_row.js` auf 21 Zusicherungen erweitert, alle
grün — darunter „Kalender liegt im Fluss, ist kein schwebendes Fenster",
„Kalender passt in die Spalte", „Woche beginnt am Montag" und „kein
natives Datumsfeld mehr in der Oberfläche".

### Nachtrag, gleicher Tag — der Kalender schwebt jetzt doch, aber in der Spalte

Der Eintrag oben begründete ausführlich, warum der Kalender **im Fluss**
steht: damit er nicht am Fensterrand abgeschnitten wird. Der Nutzer
meldete die Kehrseite, die ich in Kauf genommen, aber nicht benannt
hatte: **Er schiebt die Aufgabenliste nach unten.** Ein Kalender, der
beim Öffnen den Inhalt verrückt, ist unruhig — und dazu störte ihn der
viele Freiraum rechts neben dem schmalen Kalender.

**Beides hat dieselbe Ursache**, und beides löst sich mit derselben
Änderung: Der Kalender ist jetzt **absolut positioniert — verankert an
der Spalte, nicht am Fenster.**

| | im Fluss (vorher) | schwebend am Fenster | schwebend an der Spalte |
|---|---|---|---|
| schiebt Inhalt | **ja** | nein | nein |
| wird am Fensterrand abgeschnitten | nein | **ja** | nein |

Die dritte Spalte ist die einzige, die beide Regeln zugleich erfüllt. Die
Spalte ist per Spezifikation mindestens 240 px breit, der Kalender misst
**199 px** — er kann also gar nicht überstehen, und es braucht dafür
weiterhin **keine Zeile Positionierungslogik**. Gemessen: Inhalt
verschiebt sich um **0 px**, Kalender liegt 180 px innerhalb der
Spaltenkante.

Der Freiraum rechts erledigt sich mit: Ein schwebendes Feld über dem
Inhalt liest sich als das, was es ist, nicht als halbleere Zeile.
Tagesfelder von 26 auf **25 px**, damit die 199 px auch in der schmalsten
Spalte (208 px nutzbare Breite) noch Luft lassen.

**Was von der alten Begründung bleibt:** Overlays sind weiterhin die
letzte Wahl — aber wenn eines nötig ist, gehört es an den **nächstgelegenen
begrenzten Behälter**, nicht ans Fenster. Das ist die verallgemeinerte
Fassung von `spec.md` §2.5.

## 2026-08-07 — Das Fenster hört auf zu schrumpfen, die Seite scrollt

**Kontext:** Der Nutzer schickte einen Bildschirmausschnitt: Bei zu
schmalem Fenster wird der Inhalt abgeschnitten — das sei in Ordnung —
*„aber es sollte trotzdem ein Padding da sein"*.

**Befund, nachgemessen:** Das App-Fenster schrumpfte **unbegrenzt** mit
(bei 420 px Ansicht auf 372 px). Weil Sidebar (248 px) und eine Spalte
(mindestens 240 px) zusammen 488 px brauchen, scrollte dann das
**Innenleben** des Fensters — und der Inhalt stieß ohne jeden Abstand an
die Fensterkante. Genau der Effekt im Bild.

**Entscheidung:** Das Fenster hört bei seiner nutzbaren Mindestbreite auf
zu schrumpfen (`--win-min: 490px`). Reicht der Platz nicht, scrollt die
**Seite** waagerecht statt des Fensterinnenraums — und ihr Innenabstand
von 24 px bleibt dabei auf beiden Seiten stehen.

Das ist nicht nur hübscher: Ein Fenster, das unter die Summe seiner
unteilbaren Bestandteile gequetscht wird, zeigt nur noch Bruchstücke.
Lieber ein vollständiges Fenster, das man verschiebt, als ein
zerschnittenes, das stillhält.

**Beide Werte stehen an genau einer Stelle** (`--win-min`, `--page-pad`)
und werden zweimal verwendet — am Fenster und an der Seite. Ein erster
Versuch mit `min-width: min-content` rechnete stattdessen die
Mindestbreite des Inhalts aus und kam auf 654 px; die Seite hätte dann
schon bei 700 px zu scrollen begonnen, wo vorher alles passte. Verworfen
zugunsten des ausdrücklichen Werts.

| Ansicht | Fenster | Abstand links/rechts | Seite scrollt |
|---|---|---|---|
| 1240 px | 1040 | 100 / 100 | nein |
| 700 px | 652 | 24 / 24 | nein |
| 560 px | 512 | 24 / 24 | nein |
| 420 px | **490** | 24 / 24 | **ja** |
| 340 px | **490** | 24 / 24 | **ja** |

**Fehler in der eigenen Prüfung, gleich behoben:** Das neue Skript
`test_window_min.js` maß beide Ränder, während es ganz nach rechts
gescrollt war — der linke liegt dann naturgemäß außerhalb des Sichtfelds,
und die Zusicherung schlug fehl. Der Befund lag in der Messung, nicht am
Erzeugnis. Jetzt wird jeder Rand dort gemessen, wo er sichtbar ist. **Zum
zweiten Mal heute steckte ein „Fehler" im Prüfwerkzeug** — es lohnt, bei
einem roten Punkt zuerst zu fragen, ob die Messung stimmt.

## 2026-08-07 — Fälligkeits-Pille steht neben dem Titel, nicht am Zeilenende

**Kontext:** Der Nutzer fragte, warum rechts neben „Heute" so viel leerer
Platz ist.

**Befund, nachgemessen:** `.task-title` hatte `flex: 1` und dehnte sich
auf **526 px**, obwohl der Text rund 180 px braucht. Die Pille wurde
dadurch ans rechte Ende der Zeile gedrückt — **534 px** vom Titelanfang
entfernt.

**Das widersprach der eigenen Absicht.** Im Mockup steht bei
`.page-editor { max-width: 680px }` seit jeher der Kommentar: *„Begrenzte
Zeilenlänge: lange Zeilen sind schwer zu lesen, und die
Fälligkeits-Pillen driften sonst weit vom Aufgabentitel weg."* Die Grenze
war also **gegen genau dieses Wegdriften** gesetzt — sie hat es aber nur
gedämpft, weil das Dehnen des Titels nie abgestellt wurde. Eine Maßnahme,
die ihre eigene Ursache nicht beseitigt.

**Entscheidung:** `flex: 0 1 auto`. Der Titel nimmt nur die Breite seines
Textes und schrumpft erst, wenn es eng wird. Fortschrittsbalken und Pille
bekommen `flex-shrink: 0` — sonst würde bei einem langen Titel die
*Information* gekürzt statt des Titels.

**Verworfen: rechtsbündige Datumsspalte** (die übliche Alternative, u.a.
bei Linear). Sie trägt hier nicht:

- **Es entsteht gar keine Spalte.** Nur ein Teil der Aufgaben hat ein
  Datum — der rechte Rand ist löchrig, nicht bündig. Der Vorteil, für den
  man die Distanz sonst in Kauf nimmt, tritt nicht ein.
- **Unfold ist ein Dokument, keine Tabelle.** Die ganze Prämisse ist, dass
  Aufgaben und Fließtext auf derselben Seite stehen. In einem Text gehört
  eine Auszeichnung neben ihren Gegenstand.

**Gegengeprüft im Engpass** (drei Spalten, langer Titel, Aufgabe mit
Fortschritt *und* Datum): Titel kürzt mit „…", Fortschritt und Pille
bleiben vollständig, der Löschknopf sitzt ohne Überlappung dahinter — die
24 px Reserve dafür waren bereits vorhanden. Sechs betroffene Prüfskripte
laufen unverändert grün.

**Ebenfalls verworfen, auf Wunsch des Nutzers und mit Zustimmung:** das
Superlist-Muster, das Datum **unter** den Titel zu setzen. Es verdoppelt
die Zeilenhöhe und macht aus einer überfliegbaren Liste eine Reihe
zweizeiliger Karten.

**Folgefrage, am selben Tag entschieden:** Beim Überfahren einer Zeile
erschien der Löschknopf weiterhin am **rechten Rand** — jetzt mit einer
weiten Lücke zum Inhalt, weil der Inhalt früher endet. Siehe den
nächsten Eintrag.

## 2026-08-07 — Löschknopf steht im Fluss hinter dem Inhalt

**Kontext:** Nachdem die Fälligkeits-Pille an den Titel gerückt war,
endete der Zeileninhalt früh — der Löschknopf hing aber weiter am rechten
Zeilenrand. Der Nutzer: *„das sieht ja dann trotzdem kacke aus, weil wenn
man auf die Aufgabe hovert und man den Button sieht, ist rechts zum Rand
viel Platz frei."* Und die Frage: **Wie lösen das andere Apps?**

**Drei Muster in der Praxis:**

| App | Lösung |
|---|---|
| **Todoist** | Datum am Titel, Hover-Aktionen ganz rechts — **genau die beanstandete Lücke**. Trägt dort nur, weil die Hover-Fläche beide Enden verbindet |
| **Things** | Aktionen **direkt hinter dem Inhalt**, kein rechter Rand |
| **Notion** | Alle Zeilen-Bedienelemente im **linken Rand** (Griff, „+"), rechts nur Information |
| **Linear** | Rechts Metadaten, Aktionen über ⋯-Menü oder Rechtsklick |

**Entscheidung: der Things-Weg** (vom Nutzer gewählt). `.row-delete` ist
nicht mehr absolut am rechten Rand positioniert, sondern steht **im
Fluss** hinter der Pille. Gemessen: 10 px Abstand zur Pille statt mehrerer
hundert Pixel Lücke.

**Verworfen: der Notion-Weg** (linker Rand neben dem Ziehgriff). Er wäre
konzeptionell der sauberste — ein Ort für alle Zeilen-Bedienelemente —
scheitert aber an einer Zahl: Der linke Rand ist 16 px breit, für Griff
**und** Löschknopf bräuchte er rund 34 px. Damit rückten alle Aufgaben
doppelt so weit von den Textzeilen ein, was `spec.md` §2.3 widerspricht
(„Blöcke stehen so dicht wie zwei Textzeilen").

**Zwei Details, die den Unterschied machen:**

1. **Der Knopf behält seinen Platz auch unsichtbar** (`opacity: 0` statt
   `display: none`). Sonst spränge die Zeile beim Überfahren um 24 px.
   Nachgemessen: Titelposition vor und nach dem Überfahren identisch.
2. **Die 24 px Reserve am rechten Rand entfallen** (`padding-right`
   24 → 6 px). Sie hielt die Spur für den absolut positionierten Knopf
   frei; ohne ihn ist sie nur noch ungenutzter Rand.

**Bekannter Nachteil, bewusst in Kauf genommen:** Der Knopf steht je nach
Titellänge an einer anderen Stelle — ein wanderndes Ziel bei einer
Aktion, die man nicht versehentlich treffen will. Das Risiko ist klein,
weil er nur auf der überfahrenen Zeile erscheint: Fährt man senkrecht
durch die Liste, landet der Zeiger auf der nächsten Zeile fast nie genau
auf deren Löschknopf. **Beim Bau des Papierkorbs (§4.3) noch einmal
anschauen** — mit Wiederherstellung verliert das Argument ohnehin sein
Gewicht.

**Gegengeprüft:** Löschen funktioniert unverändert (3 → 2 Aufgaben), die
Zeile springt beim Überfahren nicht, und im Engpass (drei Spalten, langer
Titel) bleibt der Knopf 25 px innerhalb der Spaltenkante, während der
Titel kürzt und die Pille vollständig bleibt.

**Ebenfalls betrachtet und vom Nutzer selbst zurückgezogen:** das
Superlist-Muster, das Datum unter den Titel zu setzen — es verdoppelt die
Zeilenhöhe und macht aus einer überfliegbaren Liste eine Reihe
zweizeiliger Karten.

## 2026-08-07 — Der Eingang: erfassen und einsortieren werden getrennt

**Kontext:** Der Nutzer möchte sich für die Startseite an **Xdo**
orientieren: eine Seite, die nur dazu dient, Aufgaben schnell
hineinzuschreiben — und später zu entscheiden, was damit passiert.

**Warum das Muster trägt:** Der eigentliche Gewinn ist nicht der
Bildschirm, sondern die **Trennung zweier Vorgänge**. Beim Notieren muss
man nicht wissen, wohin es gehört — deshalb geht es unter einer Sekunde,
was `concept.md` §3 als Kernprinzip fordert. Der Eingang ist ein **Ort
ohne Eigenschaften**: kein Thema, kein Datum, keine Liste. Genau deshalb
kann man dort ohne Entscheidung ablegen.

**Das beantwortet nebenbei eine offene Frage.** `spec.md` §4.1 fragte:
*„Was passiert mit der erfassten Aufgabe — feste Eingangsliste, oder
Listenauswahl im Eingabefeld?"* Antwort: **feste Eingangsliste**. Eine
Listenauswahl beim Erfassen widerspricht dem ganzen Gedanken — sie
erzwingt genau die Entscheidung, die der Eingang aufschieben soll.

**Entschieden und gebaut:**

1. **Der Eingang ist ein Ort, keine Liste.** Er steht in der Übersicht
   über „Heute", trägt ein Symbol statt eines Farbpunkts (er hat kein
   Thema), und lässt sich **nicht** umbenennen, löschen, umsortieren oder
   in eine Gruppe ziehen.

   *Das behebt einen echten Fehler:* Bisher war die Inbox eine gewöhnliche
   Liste — man konnte sie löschen, und Schnellerfasstes wäre danach
   nirgends gelandet.

2. **Der Eingang ist die Startansicht.** Das Erfassungsfeld bleibt
   **unten** (Wunsch des Nutzers; ich hatte oben vorgeschlagen, was eine
   Inkonsistenz zu allen anderen Listen erzeugt hätte). Sein Platzhalter
   lautet dort „Was ist zu tun?" statt „Aufgabe hinzufügen …".

3. **Keine Bild-Leiste im Eingang.** Dort wird erfasst, nicht gestaltet.

4. **Einsortiert wird durch Ziehen** einer Aufgabe auf eine Liste in der
   Sidebar — die vom Nutzer bevorzugte Vorgehensweise. Das ist die
   Desktop-Entsprechung von Xdos Wischgeste nach links, und sie geht in
   **beide** Richtungen: Aufgaben lassen sich auch aus einer Liste zurück
   in den Eingang ziehen. Ein Ort, in den man nur hineinschreiben kann,
   wäre eine Einbahnstraße.

**Umsetzung:** Die vorhandene Zieh-Maschinerie (`SORT_CONFIGS`) musste
nicht umgebaut werden — die Konfiguration `embed` bekam ein zusätzliches
Ablageziel. Zeigt der Zeiger beim Ziehen auf eine Sidebar-Liste, ist das
Ziel ein **Ortswechsel** statt eines Umsortierens auf der Seite. Bilder
sind ausgenommen: Ein Bild gehört zu seiner Seite und hat in einer Liste
nichts verloren.

**Die heikelste Stelle** ist das Verschieben selbst: Aufgabe **und**
Blockverweis müssen mitwandern. Die Kinderliste hält die Daten, die
Blockliste die Reihenfolge auf der Seite. Eines von beiden zu vergessen
erzeugt eine Aufgabe, die es gibt, die aber nirgends steht — oder einen
Verweis ins Leere. Zusätzlich wird eine offene Spalte abgeschnitten, die
auf die verschobene Aufgabe zeigt, und der bisherige Besitzer neu
berechnet (er kann durch den Weggang fertig werden).

**Nicht übernommen, mit Zustimmung des Nutzers:**

- **Tastenkürzel für die Triage** (`L` Liste, `D` Datum …). Ausdrücklich
  nicht gewünscht.
- **Der Stern für „wichtig".** Er wäre eine zweite, parallele Ordnung
  neben Datum und Liste. Solche Markierungen werden erfahrungsgemäß
  bedeutungslos, weil mit der Zeit alles wichtig wird. Dringlichkeit
  trägt die „Heute"-Seite.
- **Die untere Leiste** (Heute · Eingang · Listen) — ein mobiles Muster;
  auf dem Desktop ist die Sidebar dasselbe, nur besser.

**Offen, noch zu zeigen:** Die Fälligkeitszeile direkt an der Zeile im
Eingang (statt erst auf der Aufgabenseite) — der Nutzer will das erst
sehen. Und der **Aufräum-Modus**, der die Aufgaben eine nach der anderen
durchgeht; als Idee angenommen, noch nicht beauftragt.

**Fehler in der eigenen Prüfung, zum dritten Mal heute:** Die Zusicherung
„zurück in den Eingang" erwartete, dass der Zähler um **eins** steigt. Er
stieg um fünf — der Zähler summiert alle verschachtelten Aufgaben, und
die gezogene Aufgabe hatte vier Unteraufgaben. Das Erzeugnis war richtig,
die Erwartung falsch. Jetzt wird die Sache geprüft (steht die Aufgabe
dort?) statt der Zahl.

## 2026-08-07 — Rückmeldung beim Ziehen: die Geste sichtbar machen

**Kontext:** Der Nutzer zum neuen Einsortieren: *„am Anfang dachte ich es
funktioniert gar nicht, weil man keine visuellen Anhaltspunkte hat"* —
und präzisiert: *„die Funktion ist an sich nicht kaputt, aber man denkt,
dass sie nicht funktioniert."*

**Das ist der schwerere Fehler.** Eine Funktion, die arbeitet, aber nicht
zeigt, dass sie arbeitet, ist für den Nutzer nicht vorhanden — schlimmer
als eine, die sichtbar fehlt, denn er sucht nicht weiter.

**Was es gab und was fehlte** (Muster aus anderen Apps zum Vergleich):

| Muster | Wer macht es | Unfold vorher |
|---|---|---|
| Mitziehendes Etikett unter dem Zeiger | Notion, Linear, Trello, Figma | **fehlte** |
| Quelle bleibt gedämpft stehen | Notion, Linear | vorhanden (0,4) |
| Marke am Ziel | Notion, Finder | vorhanden |
| Zeiger „greifend" für die ganze Geste | überall | **fehlte** |
| Mögliche Ziele andeuten | Trello, Finder | **fehlte** |

Besonders schwer wog es hier, weil der Weg **vom Editor bis in die
Sidebar quer durchs Fenster** führt. Auf dieser ganzen Strecke gab es
keinen einzigen Anhaltspunkt.

**Vier Ergänzungen:**

1. **Ein mitziehendes Etikett** mit Griffsymbol und dem Namen des
   Gezogenen, versetzt neben dem Zeiger, damit es nicht verdeckt, worauf
   man zielt. Bewegt ausschließlich per `transform`.
2. **Der Zeiger bleibt „greifend"** über die ganze Geste — vorher wurde er
   außerhalb des Griffs wieder zum Textcursor, was aussieht, als sei die
   Geste vorbei.
3. **Die Listen zeigen sich als Ziele**, sobald eine *Aufgabe* gezogen
   wird (zurückhaltend: eine Kontur, keine Fläche). Bei einem Bild nicht —
   es gehört zu seiner Seite. „Heute" ebenfalls nicht, dort lässt sich
   nichts ablegen.
4. **Der Griff wird sichtbarer** (0,55 → 0,85 beim Überfahren). Er ist der
   einzige Hinweis darauf, dass sich die Zeile überhaupt ziehen lässt —
   bei 0,55 kam man nicht auf die Idee, es zu versuchen.

**Die Beschriftung ist Teil der Zieh-Konfiguration**, nicht fest
verdrahtet: Jede Zieh-Art liefert ihren eigenen Namen. Damit bekommt auch
das Umsortieren von Listen und Gruppen in der Sidebar ein Etikett, ohne
dass dafür etwas Eigenes gebaut werden musste.

**Aufgeräumt wird zentral** beim Ende der Geste — Etikett entfernt,
Zeiger zurück, Kontur weg. Ein hängengebliebenes Etikett sieht aus wie
eine eingefrorene App; als Zusicherung festgehalten („nach dem Loslassen
bleibt nichts zurück").

## 2026-08-07 — Datum an der Zeile: ein Steuerelement statt dreier

**Kontext:** Für die Triage im Eingang sollte die Fälligkeit direkt an der
Aufgabenzeile erreichbar sein. Der Nutzer wollte die Vorschau sehen, bevor
er entscheidet — richtig, denn die Vorschau hat den Entwurf widerlegt.

**Variante 1** (`Heute · Morgen · 📅` an der Zeile) wurde zuerst gewählt und
auch gebaut. Im Bild wurde sichtbar, was ich vorher nur vermutet hatte:
Drei Knöpfe neben einer Pille, die das Datum ohnehin schon nennt, machen
die Zeile voll und sagen dasselbe zweimal. Der Nutzer wechselte daraufhin
selbst zu **Variante 2**.

**Entschieden: Variante 2.** Ein Steuerelement statt dreier:

- **Ohne Datum** erscheint beim Überfahren ein **Kalendersymbol**.
- **Mit Datum** ist die **Pille selbst der Knopf** — sie zeigt das Datum
  ohnehin an, also braucht es daneben keinen zweiten Ort dafür. Eine feine
  Kontur beim Überfahren verrät, dass man sie anfassen kann; ohne sie sähe
  sie aus wie reine Anzeige.
- Beides öffnet denselben Kalender, den es schon gibt.

**Der Kalender einer Zeile hängt an der SPALTE, nicht an der Zeile.**
`.inline-embed` hat `overflow: hidden` und würde ihn abschneiden. Seine
Lage wird deshalb gemessen und am rechten Spaltenrand nach innen gerückt,
statt hinauszulaufen. Das ist dieselbe Regel wie beim Kalender im
Seitenkopf: verankert am nächstgelegenen begrenzten Behälter.

**Gebaute und wieder verworfene Arbeit ist hier kein Verlust:** Variante 1
zu sehen war der Grund, warum Variante 2 entstand. Die Vorschau vor der
Entscheidung hat funktioniert.

## 2026-08-07 — Nachwehen des Eingangs: stille Löcher in der Prüfung

**Befund:** Weil der Eingang seine Zieh-Attribute verloren hat
(`data-drag-type`, `data-drag-id`), zeigten **neun** Prüfskripte ins Leere.
Ein pauschales Suchen-und-Ersetzen von `data-drag-id="inbox"` auf
`data-list="inbox"` war die **falsche** Reparatur — es machte die
Selektoren wieder gültig, aber inhaltlich sinnlos:

- `test_sidebar_dnd`, `test_unified`, `test_sidebar_weak`,
  `test_fuzz_all`, `test_sidebar_fuzz` **zogen am Eingang**, der sich nicht
  mehr ziehen lässt. Die Skripte wären grün geblieben und hätten nichts
  mehr geprüft. Jetzt ziehen sie an `groceries`.
- `test_list_header` prüfte **Umbenennen und Farbe am Eingang** — beides
  kann er nicht mehr. Läuft jetzt auf `Persönlich`.
- `test_align` maß den **Farbpunkt des Eingangs**, den es nicht mehr gibt.
- In `test_eingang` drehte das Ersetzen sogar eine Zusicherung um: Aus
  „taucht nicht unter LISTEN auf" wurde „existiert gar nicht".

**Lehre:** Ein Selektor, der wieder *matcht*, ist nicht dasselbe wie eine
Prüfung, die wieder *prüft*. Nach einer Umbenennung gehört jede Fundstelle
einzeln angesehen — genau die Arbeit, die ein pauschales Ersetzen
vortäuscht, aber nicht leistet.

**Zweiter Befund, aus derselben Ecke:** Mehrere Skripte öffneten eine
Aufgabe durch einen Klick auf die **Zeilenmitte**. Seit die Pille ein Knopf
ist, kann die Mitte je nach Titellänge genau auf ihr liegen — dann öffnet
sich der Kalender statt der Seite. Sie klicken jetzt auf den **Titel**.

## 2026-08-08 — Das Artifact gehört in die Abschlussprozedur

**Anlass:** Der Nutzer fragte, ob Variante 2 überhaupt eingebaut sei. Sie
war es — Commit `b432eca`, in `main`. **Aber das veröffentlichte Mockup
war einen Commit älter**, weil ich nach dem Umbau nicht mehr veröffentlicht
hatte. Wer nachgesehen hätte, hätte Variante 1 gesehen und zu Recht
geglaubt, es sei nichts passiert.

**Warum dieser Fehler eine eigene Vorkehrung verdient:** Er ist
geräuschlos und in jeder Prüfung grün. Im Repo stimmt alles, der
Sitzungs-Check meldet „alles gesichert" — nur das, was der Nutzer
tatsächlich *ansieht*, ist veraltet. Das ist dieselbe Fehlerklasse wie die
doppelte Artifact-URL (`status.md` §6), nur in der anderen Richtung: nicht
eine zweite Adresse, sondern eine vergessene Veröffentlichung.

**Entscheidung:** `ende unfold` bekommt einen Schritt 11 — „Passt das
veröffentlichte Mockup zum Repo-Stand?"

**Bewusst als Frage in der Anleitung und nicht als Prüfung im Skript:**
`session-check.sh` läuft ohne Netz (so entschieden am 2026-08-07, damit es
offline funktioniert und keine stillen Netzzugriffe macht). Ob das
Artifact aktuell ist, lässt sich ohne Abruf nicht feststellen. Eine
Prüfung, die dafür heimlich ins Netz greift, wäre ein schlechterer Tausch
als eine ausdrückliche Frage an der richtigen Stelle.

**Im Zweifel neu veröffentlichen** — es kostet nichts, und die URL bleibt
dieselbe, solange der `url`-Parameter mitgegeben wird.

## 2026-08-08 — Löschregeln: Kaskade nach unten, abgesichert durch den Papierkorb

**Kontext:** `spec.md` §4.3 stand seit dem 2026-08-06 offen und war der
nächste Schritt vor dem Flutter-Bau, weil die Regeln das Datenmodell
betreffen. Vier Fragen, alle vom Nutzer entschieden.

**1. Gelöschte Gruppe nimmt ihre Listen mit.**

Ich hatte das **Gegenteil** empfohlen: Eine Gruppe ist laut §1 eine reine
Sortier-/Faltebene, sie besitzt die Listen nicht — beim Löschen einer
Sortierhilfe sollten keine Daten sterben. Der Nutzer entschied anders,
**mit einem Argument, das meinen Einwand aufhebt:** Es ist ohnehin ein
Papierkorb geplant, aus dem sich im schlimmsten Fall alles zurückholen
lässt. Damit kostet ein Fehlklick keine Daten mehr, und die Kaskade ist
das einfachere, erwartbarere Verhalten.

**Daraus folgt eine Reihenfolge, die nicht umgangen werden darf:** Die
Regel ist **nur zulässig, solange der Papierkorb existiert.** Bis dahin
fragt „Gruppe löschen" nach („Gruppe und 2 Listen löschen?"). Die
Alternative — bis zum Papierkorb die andere Regel gelten lassen und danach
umstellen — wurde verworfen: Dann verließe sich bis zur Umstellung schon
jemand auf ein Verhalten, das später wechselt. Lieber dieselbe Regel von
Anfang an und nur die Absicherung wechseln.

**2. Gelöschte Aufgabe nimmt ihre Unteraufgaben mit**, beliebig tief, und
zwar als **eine Einheit**: Im Papierkorb steht ein Eintrag
„Urlaub planen (+3 Unteraufgaben)", nicht vier einzelne. Sonst ließe sich
eine Unteraufgabe zurückholen, deren Elternaufgabe es nicht mehr gibt —
ein Zustand, den das Datenmodell gar nicht kennt.

**Warum hier kaskadiert wird und bei der Gruppe begründet werden musste:**
Eine Gruppe *ordnet* nur, eine Elternaufgabe *bedeutet* etwas. „Flüge
vergleichen" ohne „Urlaub planen" ist sinnlos. Dasselbe Gefälle zeichnet
die Erledigt-Kaskade (§2.2) schon vor.

**3. Papierkorb, 30 Tage.** Frist zählt **ab dem Löschen**, nicht ab der
letzten Benutzung — sonst löscht ein langer Urlaub gar nichts und ein
vielbenutzter Tag alles. **Aufgeräumt wird beim App-Start und beim Öffnen
des Papierkorbs**, ohne Hintergrundprozess und ohne Zeitgeber.

Der Nutzer fragte hier nach, was der Unterschied überhaupt sei. Er ist
klein, aber nicht null: Läuft die App wochenlang durch, liegt ein Eintrag
bei „beim Start" ein paar Tage länger als nötig — harmlos. Bei einem
laufenden Zeitgeber verschwände er dagegen mitten in der Sitzung, unter
Umständen während man in den Papierkorb schaut. Zu früh verschwinden ist
der schlimmere Fehler als zu spät.

**Der Papierkorb erscheint in der Sidebar nur, wenn etwas drin ist** — ein
dauerhaft leerer Eintrag ist Rauschen.

**Gestaffelte Umsetzung:** „Rückgängig" direkt nach dem Löschen wird
zuerst gebaut; der Papierkorb kommt **mit der Datenschicht**, weil er ein
Feld „gelöscht am" im Speicherformat und eine Bereinigung braucht — beides
gehört dorthin und nicht ins Mockup.

**4. Offene Spalten, die auf Gelöschtes zeigen.**

> Verschwindet ein Knoten aus dem Baum — durch Löschen, Verschieben oder
> endgültiges Entfernen —, werden alle geöffneten Spalten ab diesem Knoten
> geschlossen. Wird er wiederhergestellt, öffnen sie sich **nicht** von
> selbst wieder.

Verworfen: Spalten stehen lassen und „Diese Aufgabe wurde gelöscht"
anzeigen. Das erzeugt einen Zustand, in dem man auf einer Seite steht, die
es nicht gibt, und jede weitere Aktion braucht dafür einen Sonderfall.

**Der Gewinn ist nicht das Verhalten, sondern der Status als Regel.** Im
Mockup passierte das Richtige schon, aber als Reparatur an einer Stelle im
Code. Als Regel gilt es an **drei** Stellen: beim Löschen, beim
Verschieben in eine andere Liste (seit 2026-08-07 gebaut) und beim
endgültigen Leeren des Papierkorbs. In Flutter gehört sie zentral in den
Bearbeitungs-Pfad, wie die Erledigt-Kaskade.

**Noch nicht umgesetzt:** Der Nutzer wollte erst alles definieren. Was im
Mockup sichtbar werden soll (Rückfrage beim Gruppenlöschen,
Rückgängig-Meldung), steht als nächster Bauschritt an.

## 2026-08-08 — Gruppen verschieben: vorhanden, aber der Zeiger log

**Kontext:** Der Nutzer meldete, es fehle noch, ganze Gruppen zu
verschieben („wenn ich möchte, dass Arbeit über Privat ist"). Nachgemessen
— **es funktioniert bereits**: `[Privat, Arbeit]` wird zu
`[Arbeit, Privat]`, mit Etikett und Einfügemarke. Er hat das dann selbst
bemerkt.

**Trotzdem war die Meldung berechtigt, und der Grund ließ sich messen:**

| Element | Zeiger |
|---|---|
| Gruppenzeile | `grab` |
| **Gruppenname** | **`text`** |
| Listenzeile | `grab` |
| Listenname | `grab` |

Der Name ist das **größte Ziel** der Gruppenzeile — und war als einziges
Element mit einem Textcursor versehen. Ziehen funktionierte dort, aber der
Zeiger sagte „hier wird getippt". Wer eine Gruppe verschieben will, greift
naheliegenderweise an ihren Namen, sieht einen Textcursor und schließt
daraus, dass es nicht geht.

**Behoben:** `.group-title` bekommt `cursor: grab`, im **fokussierten**
Zustand `cursor: text`. Beides ist dann richtig — vor dem Bearbeiten
zeigt der Zeiger, dass man ziehen kann, während des Bearbeitens, dass man
tippt.

**Das ist innerhalb weniger Tage der dritte Fall derselben Sorte:** eine
Funktion, die arbeitet, aber nicht zeigt, dass sie arbeitet (Ziehen ohne
Etikett, der zu blasse Ziehgriff, jetzt der falsche Zeiger). Für den
Nutzer ist eine solche Funktion nicht vorhanden — schlimmer als eine, die
sichtbar fehlt, denn er sucht nicht weiter. **Beim Flutter-Bau ist das
eine eigene Prüffrage: Sieht man einer Sache an, was mit ihr möglich ist?**

## 2026-08-08 — Rückgängig steht dort, wo gelöscht wurde

**Kontext:** Umsetzung der Löschregeln (`spec.md` §4.3). Zwei Platzierungen
für die Rückgängig-Meldung wurden gebaut und als Bild vorgelegt.

**Variante A — schwebende Meldung unten im Fenster.** Das übliche Muster
(Gmail, macOS, Slack). Beim Bauen sofort ein Problem: Sie lag über dem
**Erfassungsfeld** — ausgerechnet dem wichtigsten Element im Eingang. Sie
ließ sich höher setzen, aber das ist die Kernschwäche der Form: Eine
schwebende Meldung nimmt Platz vor Inhalt und muss überall ausweichen.
Zweiter Nachteil: Sie steht immer am selben Ort, egal wo gelöscht wurde.

**Variante B — an der Stelle, wo gelöscht wurde. Gewählt.** Die Zeile
bleibt stehen und wird zu ihrer eigenen Rückgängig-Meldung:
durchgestrichener Name, „gelöscht", rechts der Knopf. Nach **fünf
Sekunden** klappt sie weich ein.

**Der Gewinn, den ich unterschätzt hatte, bis es gebaut war: nichts
springt.** Der Platz bleibt belegt — die Liste rutscht beim Löschen nicht
hoch und beim Zurückholen nicht wieder runter. Gemessen: Die Folgezeile
bewegt sich um **1 px** (die gestrichelte Umrandung ist minimal höher als
eine Aufgabenzeile). Bei Variante A rutscht die ganze Liste zweimal.

Das folgt außerdem dem Grundsatz aus `spec.md` §2.5: *Wo etwas passiert,
steht es auch.*

**Umsetzung — der Trick liegt im Datenmodell, nicht in der Oberfläche:**
Der Blockverweis der gelöschten Aufgabe wird nicht entfernt, sondern
**an Ort und Stelle durch einen Block vom Typ `undo` ersetzt**, der den
herausgenommenen Knoten und seinen alten Kindindex mitträgt. Dadurch
- steht die Zeile automatisch an der richtigen Position, ohne zweite
  Mechanik für Platzhalter,
- überlebt sie jeden Neuaufbau des Editors,
- und das Zurückholen ist dieselbe Paarung wie beim Verschieben: Knoten in
  die Kinderliste, Blockverweis zurück auf `task`.

Die Aufgabe ist dabei aus der Kinderliste **sofort** entfernt — der Zähler
sinkt augenblicklich, und die Erledigt-Kaskade rechnet richtig. Nur der
Platz auf der Seite bleibt reserviert.

**Nicht ziehbar:** Was gerade verschwindet, sortiert man nicht um. Die
Zieh-Konfiguration überspringt Blöcke mit `undo:`-Marker.

## 2026-08-08 — Gruppe löschen fragt nach, und die Spaltenregel steht an einer Stelle

**Rückfrage beim Gruppenlöschen.** Umgesetzt wie in §4.3 festgelegt: Enthält
die Gruppe Listen, erscheint „„Privat" und 2 Listen löschen?" samt Namen
der betroffenen Listen. **Diese Rückfrage ist kein Komfort, sondern die
Bedingung dafür, dass die Kaskade überhaupt zulässig ist** — solange es
keinen Papierkorb gibt, wäre es sonst unwiderruflicher Datenverlust mit
einem Klick. Sie entfällt, sobald sich Gelöschtes zurückholen lässt.

Eine leere Gruppe wird ohne Rückfrage gelöscht — dort gibt es nichts zu
verlieren.

**Die Spaltenregel steht jetzt an einer Stelle.** `closePanelsFrom(id)`
ersetzt die zwei Stellen, an denen der `panelStack` bisher einzeln
abgeschnitten wurde, und wird an **vier** Stellen benutzt: Aufgabe
löschen, Aufgabe verschieben, Liste löschen, Liste über eine gelöschte
Gruppe verlieren. Damit ist aus einer Einzelfall-Reparatur die Regel
geworden, die `spec.md` §4.3 verlangt.

**Nebenbefund, gleich mitbehoben:** Beim Löschen der aktuell geöffneten
Liste fiel die App auf `lists[0]` zurück — und auf `today`, falls gar
keine Liste mehr da war. Seit es den Eingang gibt (§2.0), ist der
richtige Rückfallort **immer** der Eingang: Es gibt ihn per Definition
immer, und er ist die Startansicht.

## 2026-08-08 — „Overlays vermeiden" ist ab jetzt Design-Richtung

**Kontext:** Beim Entwurf des Aufräum-Modus legte ich eine Karte vor, die
mittig in der Spalte schwebt. Der Nutzer: *„finde ich gut, aber ich würde
kein Pop-up-Fenster dafür benutzen, sondern einfach die leere Seite"* —
und anschließend allgemein: *„Overlays versuchen so gut es geht zu
vermeiden."*

**Damit wird aus einer wiederkehrenden Einzelentscheidung eine Haltung.**
Sie war innerhalb weniger Tage fünfmal dieselbe:

| Fall | was es geworden ist |
|---|---|
| Darstellungs-Schalter | steht in der Sidebar, statt hinter „Optionen" |
| Titel umbenennen / Farbe | im Fluss, kein Menü am Titel |
| Fälligkeit | dauerhafte Zeile, kein Aufklappmenü |
| Rückgängig | an der Stelle des Gelöschten, keine schwebende Meldung |
| Aufräum-Modus | die Seite übernimmt, keine Karte |

Fünfmal derselbe Gedanke ist keine Vorliebe mehr, sondern eine Regel —
und sie gehört dorthin, wo die Gestaltung beschrieben wird, nicht in fünf
verstreute Protokolleinträge.

**Eingetragen in `concept.md`, Abschnitt Design-Richtung**, mit der
Begründung (ein Overlay verdeckt den Gegenstand der Entscheidung, kostet
zwei Klicks für einen Wert, verbirgt den Zustand) und der Ausnahme: Wo
eines unvermeidbar ist — ein Kalender lässt sich schlecht dauerhaft
aufgeklappt lassen —, gehört es an den **nächstgelegenen begrenzten
Behälter**, die Spalte statt das Fenster. `spec.md` §2.5 verweist darauf.

**Warum in `concept.md` und nicht nur in `spec.md`:** Die Spec beschreibt,
**was** gebaut wird; die Design-Richtung, **wie** entschieden wird, wenn
etwas Neues dazukommt. Diese Regel ist die zweite Sorte — sie soll auch
für Bildschirme gelten, die es noch nicht gibt.

## 2026-08-11 — Aufräum-Modus: entschieden und gebaut

**Kontext:** Der Modus stand seit dem 2026-08-07 als beauftragter, aber
ungebauter Punkt in `status.md`, mit drei offenen Fragen. Der Nutzer hat
sich nach mehreren Entwurfsrunden für die **schlichte, seitenbasierte
Variante** entschieden — nicht für eine der drei stärker gestalteten
Alternativen aus dem zweiten Anlauf. Sein Auftrag dazu:

> „da spricht mich das vom Anfang noch am meisten an, können wir das
> ausarbeiten? und es so satisfying wie möglich machen? dass der Benutzer
> sich belohnt fühlt wenn er eine Aufgabe macht und man dadurch den Modus
> auch benutzen will" — „weil er haptisch auch geil sich anfühlt"

Vollständig festgeschrieben in `spec.md` §2.8.

### Die drei offenen Fragen, beantwortet

**Wo lebt der Modus?** *Die Spalte übernimmt.* Folgt der Design-Richtung
vom 2026-08-08, hat hier aber ein eigenes, stärkeres Argument: Die
Sidebar muss **sichtbar bleiben**, weil sie das Ziel der
Wegflug-Bewegung ist. Ein Overlay hätte die Belohnung, um die es
eigentlich geht, selbst verdeckt.

**Wie kommt man raus, ohne fertig zu werden?** „Fertig" und `Escape`.
Entschiedenes bleibt entschieden, der Rest bleibt im Eingang. Keine
Rückfrage — es gibt nichts zu verlieren.

**Was ist mit Aufgaben, die bewusst im Eingang bleiben sollen?**
Ein Knopf „Später", der **keinen dauerhaften Zustand** erzeugt. Ich hatte
eine Eigenschaft „zurückgestellt" erwogen und verworfen: Sie wäre eine
dritte Ordnung neben Liste und Datum, mit demselben Verfallsdatum wie
der abgelehnte Stern für „wichtig" (§2.0) — nach vier Wochen ist alles
zurückgestellt. Stattdessen gilt die Sperre nur für den laufenden
Durchgang, damit er sich nicht im Kreis dreht.

### Warum das Belohnungsgefühl in der Spec steht

Es wäre der naheliegende Kandidat gewesen, um es „später beim Feinschliff"
zu machen. Genau das ist die Falle: Der Aufräum-Modus hat keinen
funktionalen Vorteil gegenüber dem Einsortieren per Ziehen — er kann
nichts, was das Ziehen nicht auch kann. **Sein einziger Vorteil ist, dass
man ihn gern öffnet.** Fällt die Bewegungsschicht heraus, bleibt ein
Formular mit sieben Runden übrig, und der Modus ist wertlos. Deshalb
steht sie als Tabelle in §2.8 und nicht als Kommentar im Mockup.

Der tragende Gedanke: **Jede Entscheidung bekommt ihre eigene Bewegung.**
Liste = nach links zur Sidebar, Erledigt = sinkt zusammen, Löschen =
fällt nach unten, Später = schiebt nach rechts. So unterscheiden sich die
Entscheidungen körperlich und nicht nur inhaltlich — man merkt an der
Bewegung, was man getan hat, bevor man es liest. „Zurück" führt die
Karte aus derselben Richtung zurück, in die sie ging.

### Eine zweite Bewegungskurve — die einzige Ausnahme

`ease-spring` (`cubic-bezier(0.22, 1.4, 0.36, 1)`) schwingt über das Ziel
hinaus. Bisher galt: **eine** Kurve für die ganze App. Diese Regel wird
bewusst um genau einen Fall erweitert, den Fortschrittsbalken des
Aufräum-Modus, und die Ausnahme steht als solche in `spec.md` §3.

Begründung: Ein Überschwingen sagt „geschafft". Das ist an einer
Quittung richtig und überall sonst Unruhe. Die Alternative wäre gewesen,
die Belohnung mit der vorhandenen Kurve zu bauen — sie ist eine starke
Verzögerungskurve und damit sauber, aber sie kommt nirgends an, sie
*hält nur an*. Zwei Kurven, keine dritte; wer eine vierte braucht, hat
vermutlich ein anderes Problem.

### Haptik

Der Nutzer nannte ausdrücklich das haptische Gefühl. Auf dem Desktop gibt
es das nicht, deshalb zwei Ebenen: **sichtbar** gibt jeder Knopf beim
Drücken nach (`scale(0.96)` auf `:active`, `dur-fast`) — das ist der
Ersatz, den ein Zeigegerät bieten kann; **spürbar** kommt auf
Mobilgeräten ein Tick pro Entscheidung dazu (Flutter
`HapticFeedback.selectionClick()`, beim Abschluss `mediumImpact()`), im
Mockup stellvertretend `navigator.vibrate()`. Kein Tick bei „Später" —
Aufschieben ist keine Leistung, und eine Rückmeldung, die alles quittiert,
quittiert nichts.

**Bewusst nicht:** Konfetti und Klänge. Die Palette ist warm und ruhig,
die ganze App verzichtet auf Ausrufezeichen; ein Feuerwerk wäre der erste
Fremdkörper. Auch kein Zeitmesser („in 1:12 geschafft") — das macht aus
Aufräumen einen Wettkampf gegen sich selbst, und wer einmal langsam war,
öffnet den Modus nicht wieder.

## 2026-08-11 — Unteraufgaben im Eingang bleiben erlaubt

**Ich hatte das Gegenteil vorgeschlagen.** Der Eingang soll keine
Eigenschaften tragen (§2.0), und eine Unteraufgabe ist eine — sie legt
eine Struktur fest, die der Eingang gerade aufschieben soll.

Der Nutzer hat widersprochen, und das Argument hebt den Einwand auf: Wer
„Umzug" notiert und im selben Atemzug „Kartons besorgen" darunter
schreibt, hat nicht einsortiert, sondern **einen Gedanken zu Ende
gedacht**. Das ist genau der Vorgang, den der Eingang schützen soll. Ein
Verbot würde ihn unterbrechen, um eine Regel zu retten, die für den
*anderen* Fall gedacht war (Liste, Datum, Wichtigkeit — Eigenschaften,
die eine Einordnung *vorwegnehmen*).

Praktisch fällt dabei nichts an: Der Aufräum-Modus verschiebt eine
Aufgabe ohnehin samt ihrem Unterbau, weil `moveTaskToList()` den Knoten
als Ganzes umhängt. Eingetragen in `spec.md` §2.0.

## 2026-08-11 (nachmittags) — Aufräum-Modus: vier Korrekturen nach der ersten Sicht

Der Nutzer hat den gebauten Stand angesehen und vier Punkte gemeldet. Drei
waren Gestaltung, einer war ein **stiller Fehler**.

### 1. Der Fortschrittsbalken sprang, statt zu laufen — ein echter Fehler

Gemeldet als *„der Fortschrittsbalken sollte langsam auf den nächsten
Punkt hochlaufen und nicht direkt sein"*, nachgereicht: *„das sollte auch
passieren, wenn man zurückgeht, dass er zurückläuft"*.

Im CSS stand eine Übergangsanimation über 400 ms — sie ist **nie gelaufen**.
Grund: `renderTidy()` baut die Seite bei jedem Schritt komplett neu auf. Ein
frisch eingesetztes Element hat keinen Vorzustand, von dem aus ein
`transition` laufen könnte; es steht sofort auf seinem Endwert. Die
Animation war da, hatte aber nie eine Strecke.

Behoben, indem der Balken mit dem **alten** Wert aufgebaut und erst im
übernächsten Bild auf den neuen gesetzt wird (zwei `requestAnimationFrame`
— nach einem einzigen hat der Browser den Startwert nicht zwingend gemalt).
Das trägt beide Richtungen ohne Zusatzaufwand: Beim „Zurück" ist der neue
Wert kleiner, und der Balken läuft gefedert zurück.

**Die Lehre ist die wichtigere Hälfte:** Eine Animation, die im Stylesheet
steht, ist keine Animation, die läuft. Das ist dieselbe Familie wie „alle
Prüfskripte grün" (2026-08-07) und „Selektor matcht wieder" (2026-08-07) —
die Zusicherung existiert, geprüft wurde sie nie. `test_aufraeumen.js`
zeichnet den Verlauf jetzt im Browser auf und verlangt **Zwischenwerte**;
Anfangs- und Endwert allein hätten den Fehler nicht gezeigt.

Dauer dabei von 400 auf 600 ms gesetzt — **kein neuer Skalenwert**, sondern
`dur-slow + dur-base`. Der Balken ist das Einzige, dem man beim Laufen
zusehen soll; bei 400 ms war er am Ziel, bevor der Blick von der
weggeflogenen Karte zurück war. Die Kurve wurde von
`cubic-bezier(0.22, 1.4, 0.36, 1)` auf `cubic-bezier(0.34, 1.28, 0.52, 1)`
geändert: Die erste war so stark vorgezogen, dass sie 90 % der Strecke in
den ersten 150 ms zurücklegte — technisch eine Animation, für das Auge ein
Sprung mit Nachwippen.

### 2. „Aufräumen" war größer als die Aufgabe

Gemeldet als *„wieso Titel so klein, das bringt Unstimmigkeiten über die
gesamte App-Stimmigkeit"* — und das trifft genau.

In der ganzen App trägt `fs-xl` **das, was man gerade ansieht**: Eine Spalte
zeigt so ihren Titel. Auf dieser Seite stand `fs-xl` beim Wort „Aufräumen"
und die Aufgabe auf `fs-lg`. Damit war der *Name des Werkzeugs* wichtiger
gesetzt als der *Gegenstand*, um den es geht. Das ist keine Geschmacksfrage,
sondern ein Bruch der Rangfolge, die überall sonst gilt.

Getauscht: Aufgabentitel auf `fs-xl`, „AUFRÄUMEN" auf die Rubrikenschrift
dieser Seite (`fs-xs`, Großbuchstaben, `ink-faint`) — dieselbe, die schon
„IN WELCHE LISTE?" trägt. Es entsteht also keine neue Schriftrolle.

### 3. Das Loch zwischen Balken und Aufgabe

Es kam von `justify-content: safe center`, das ich eingebaut hatte, damit
die eine Aufgabe der Gegenstand des Bildschirms ist statt eines Formulars,
das oben klebt. Der Gedanke war richtig, die Ausführung nicht: Der
Kopfbereich bleibt oben, die Karte rutschte in die Mitte — und dazwischen
stand ein Loch, das den Zusammenhang zwischen Fortschritt und Aufgabe
zerriss. **Der Zusammenhang wiegt schwerer als die optische Mitte.** Wieder
oben angesetzt; die Aufgabe wirkt jetzt über ihre Größe, nicht über ihre
Lage.

### 4. Erledigen war die schwächste der vier Bewegungen

Gemeldet als *„wenn man Erledigt drückt, ist nicht die gleiche Animation wie
wenn man eine Aufgabe einer Liste zuordnet"*.

Die vier Bewegungen sollen sich **unterscheiden** — das ist der Kern der
Sache, man soll an der Bewegung merken, was man getan hat. Das Problem war
nicht die Verschiedenheit, sondern die **Stärke**: Einsortieren geht sichtbar
irgendwohin (nach links zur Sidebar, die Zielzeile blitzt auf), Erledigen
wurde nur kleiner. Bloßes Kleinerwerden liest sich wie „nichts passiert".

Erledigen bekommt deshalb eine eigene, gleich starke Geste: Erst zieht sich
ein **Strich über den Titel**, dann sinkt die Karte zusammen. Die Bewegung
dauert entsprechend länger (400 statt 260 ms). Umgesetzt als
Pseudo-Element, weil `text-decoration` sich nicht animieren lässt.

**Nicht gemacht:** die Bewegungen angleichen. Falls der Nutzer das gemeint
hat, ist es ein Handgriff — aber dann geht der Kern verloren.

## 2026-08-11 (abends) — Erledigt und Löschen sind im Eingang dasselbe

**Die Frage des Nutzers:** *„Was ist der Unterschied zwischen Erledigt und
Löschen? Also der Sinn? Wenn eine Aufgabe erledigt ist, wofür muss man sie
noch sehen? In meinem Kopf sollten Erledigt und Löschen das gleiche sein."*

**Er hat recht — für den Eingang.** Innerhalb einer **Liste** trägt der
Unterschied: Erledigtes bleibt durchgestrichen stehen, zählt in „3 von 7
erledigt", füllt den Fortschritt der übergeordneten Aufgabe. Es ist ein
Beleg, und ein Todo-Programm ohne Belege ist keins.

Im **Eingang** bricht das zusammen. Eine abgehakte Eingangs-Aufgabe hat
keinen Ort. Sie blieb als durchgestrichene Zeile liegen, obwohl der Eingang
per Definition für *Unsortiertes* da ist und etwas Erledigtes nicht mehr
unsortiert ist. Der Unterschied war **benannt, aber nicht gebaut** — zwei
Knöpfe, die dasselbe tun, mit unterschiedlichen Wörtern.

**Das ist mein Fehler beim Entwurf gewesen.** Ich habe die beiden Aktionen
aus der Listenansicht übernommen, ohne zu prüfen, ob ihr Unterschied im
Eingang noch trägt. Der Nutzer hat ihn beim ersten Ansehen bemerkt.

**Gewählt (Nutzer, aus drei vorgelegten Wegen):** ein Knopf statt zwei.
„Erledigt" hakt ab **und** räumt aus dem Eingang; wiederherstellbar über
„Zurück", danach über den Papierkorb. „Löschen" bleibt in den Listen
erhalten und fällt nur im Aufräum-Modus weg.

Verworfen: (a) beides behalten und „Erledigt" ein Archiv geben — richtig,
aber es verschiebt die Frage auf die Datenschicht, ohne heute etwas zu
lösen; (b) alles lassen wie es war — sammelt Leichen im Eingang an.

## 2026-08-11 (abends) — Drei Bewegungskurven statt zwei

**Anlass:** *„Der Fortschrittsbalken ist nicht ganz da. Er schießt über die
jeweilige Kerbe hinaus, und die Animation soll smoother sein, wie eine
Kurve, also langsam anfangen und immer schneller werden."*

Der Balken lief auf `ease-spring`, der Überschwing-Kurve. Am Balken ist das
nicht nur unruhig, sondern **falsch**: Ein Fortschrittsbalken, der über
seine Kerbe hinausschießt, zeigt für einen Moment einen Fortschritt an, den
es nicht gibt. Das ist ein Messwert, keine Geste.

Neu: `--ease-lauf: cubic-bezier(0.85, 0, 0.35, 1)` — langsam an, immer
schneller, rastet ein, kein Überschwingen. Sie trägt den
Fortschrittsbalken **und** alle Zähler.

**Damit sind es drei Kurven, und in `spec.md` §3 stand „zweite Kurve, keine
dritte".** Diese Zeile ist korrigiert — aber die Regel dahinter ist dabei
*schärfer* geworden, nicht weicher: **Überschwingen dort, wo etwas ankommt
(Karte, Knopf, Abschlussbild); nie dort, wo etwas gemessen wird (Balken,
Zähler).** Das ist ein Kriterium, an dem sich eine vierte Kurve messen
lassen müsste — und keine hätte bisher bestanden.

Die Zähler rollen jetzt **in der ganzen Sidebar**, nicht nur im
Aufräum-Modus, und in der Richtung, in die sich der Wert bewegt (wird
weniger → neue Zahl kommt von oben). Es ist dieselbe Aussage („eins
weniger"), egal wo man etwas abgehakt hat; sie an einer Stelle zu animieren
und an der anderen nicht wäre die Art von Willkür, die eine Oberfläche
unruhig macht, ohne dass man das einzelne Element benennen könnte.

## 2026-08-11 (abends) — „Später" bewegt sich wie das Einsortieren

**Der Nutzer:** *„Die Animation, wenn man Später drückt, sollte so sein wie
wenn man die Aufgabe einer Liste zuordnet und eine neue kommt."* — und
danach präzisiert: *„Die sind ähnlich, aber nicht gleich."*

Genau das war der Entwurf: „Später" schob nach rechts, in Richtung seines
eigenen Knopfes, während das Einsortieren nach links zur Sidebar fliegt.
Der Gedanke war, dass jede Entscheidung ihre eigene Bewegung bekommt.
**Die Ausführung hat den Gedanken aber nicht getragen:** Zwei Bewegungen,
die sich nur in der Richtung unterscheiden, lesen sich nicht als „zwei
Bedeutungen", sondern als Wackeln.

Umgesetzt wie gewünscht. Der Preis ist benannt und steht in `spec.md`
§2.8: Die Bewegung sagt nicht mehr, **was** geschehen ist. Das trägt jetzt
allein der Zähler — er zählt beim Überspringen nicht weiter. Übrig bleiben
zwei unterscheidbare Gesten: wegfliegen (Liste/Später) und
durchstreichen-und-sinken (Erledigt).

## 2026-08-11 (abends) — Drei kleinere Ergänzungen, vom Nutzer bestätigt

- **Überfällig steht auf der Karte.** Ein gesetztes Datum — erst recht ein
  überfälliges — ist genau die Angabe, die „Wann?" beeinflusst. Sie hinter
  den Knöpfen erraten zu lassen wäre eine verschwiegene
  Entscheidungsgrundlage gewesen.
- **`+ Neue Liste` als letzte Pille.** Passte keine Liste, musste man den
  Durchgang vorher verlassen. Das Feld klappt an Ort und Stelle auf (im
  Fluss, kein Overlay), Enter legt an und sortiert gleich ein, Escape nimmt
  es zurück.
- **Zähler rollen**, siehe oben.

## 2026-08-11 (abends) — Zwei Fehler, die in der MESSUNG lagen

Beide sind es wert, festgehalten zu werden, weil sie dieselbe Familie sind
wie „alle Prüfskripte grün" (2026-08-07):

**1. Der Balken schien über sein Ziel hinauszuschießen.** Das Prüfskript las
`transform` mit `s.match(/matrix\(([-\d.]+)/)`. Bei kleinen Werten schreibt
der Browser aber `matrix(7.30435e-05, ...)` — der Ausdruck schnitt das
`e-05` ab und machte aus 0,00007 die Zahl **7,3**. Gemeldet wurde ein
Ausreißer, den es nie gab. Behoben mit `DOMMatrixReadOnly`. Aufgefallen ist
es nur, weil ich die Rohwerte ausgegeben habe, statt der Zahl zu glauben.

**2. Drei Bewegungsprüfungen blinkten unter Last rot.** Sie griffen die
Karte nach einer festen Wartezeit von 60 ms ab; im vollständigen Lauf (52
Skripte hintereinander) verschiebt sich der Takt, und die Messung traf mal
davor, mal danach. Jetzt wird nachgesehen, bis der Zustand da ist. **Ein
rot blinkendes Prüfskript ist schlimmer als keines** — man gewöhnt sich an,
den Punkt wegzudrücken, und übersieht dann den echten Fehler daneben.

**Die Regel, die aus beidem folgt:** Bei einem roten Punkt zuerst fragen,
ob die Messung stimmt — aber die Messung dann auch *reparieren* und nicht
die Zusicherung entschärfen.

## 2026-08-11 (abends) — „Erledigt" steht unten am Rand, nicht als vierte Rubrik

**Gemeldet:** *„Der Erledigt-Button muss woanders hin und sich von der Masse
abheben, dort wo er ist, ist er bisschen random."* — mit der Vorgabe:
mittig unten, aber **nicht** in der Leiste von „Zurück/Später", und in der
Akzentfarbe.

**Die Ursache war strukturell**, nicht nur Platzierung: Er stand unter einer
Rubrik „ODER", und eine Rubrik mit genau **einem** Knopf darunter liest sich
wie ein Rest, der übrig geblieben ist — Rubriken bündeln mehrere Dinge.
Dazu kam ein inhaltlicher Bruch: „Erledigt" ordnet nicht ein, es **beendet**.
In der Reihe der Einordnungen („in welche Liste?", „wann?") hatte es nichts
zu suchen.

**Umgesetzt:** Rubrik „ODER" ersatzlos weg, der Knopf sitzt mittig am
unteren Rand des Inhaltsbereichs, 24 px über der Fußzeile, mit großem
Abstand zu den Rubriken. Der Abstand sagt „das ist etwas anderes", ohne dass
es ein Wort dafür braucht.

**Er liegt außerhalb der Karte.** Das ist kein Umsetzungsdetail: Er *löst*
die Wegflug-Bewegung aus, er ist nicht Teil von ihr. Flöge er mit, wäre er
Teil der Aufgabe statt eine Handlung an ihr.

**Zur Akzentfarbe — Kontur statt gefüllter Fläche.** Der Nutzer wollte
Akzent; ich habe die Kontur gewählt und den Grund genannt: Wäre er die
einzige **gefüllte** Akzentfläche auf dem Bildschirm, wäre er der optische
Schwerpunkt — die Seite lüde zum **Abhaken** ein, obwohl sie zum
**Einsortieren** einladen soll. Als Kontur hebt er sich klar von den grauen
Pillen ab, ohne sie zu überstimmen; beim Überfahren füllt er sich. Falls der
Nutzer die gefüllte Fläche will, ist es eine Zeile.

**Vorgelegt und verworfen:** (B) ein Häkchen-Kreis links am Titel — meine
Empfehlung, weil sie die Sprache der App nutzt (man hakt überall links ab)
und nichts Neues erfindet; (C) eine Akzent-Pille rechts auf Höhe des Titels.
Der Nutzer hat die Platzierung unten gewählt.

Das Vergleichsskript (`shot_erledigt_varianten.js`) ist nach der Entscheidung
**gelöscht** worden: `run-mockup-tests.sh` startet **alle** `.js` im
Verzeichnis, und ein Skript mit veralteten DOM-Annahmen wäre dort abgestürzt.
Entscheidungsmaterial gehört in dieses Protokoll, nicht als toter Code ins
Prüfverzeichnis.

## 2026-08-11 (abends) — Fortschritt sieht überall gleich aus

**Gemeldet:** *„Der Fortschrittsbalken neben einer Aufgabe sollte ebenfalls
die Animation wie der Fortschrittsbalken im Aufräum-Modus haben."*

Richtig, und zwar aus einem Grund, der über den Einzelfall hinausgeht:
**Es ist dieselbe Aussage.** Beide sagen „es ist mehr geworden". Zwei
Bewegungen für eine Aussage sind genau die Art von Willkür, die eine
Oberfläche unruhig macht, ohne dass man das einzelne Element benennen
könnte — dieselbe Diagnose wie bei der Normalisierung der Skalen
(2026-08-07).

Beim Umbauen kam derselbe stille Fehler zum Vorschein wie beim Balken des
Aufräum-Modus: Im Stylesheet stand ein `transition` auf `width` — **es ist
nie gelaufen.** `renderColumns()` baut die Zeile bei jeder Änderung neu auf,
und ein frisch eingesetztes Element hat keinen Vorzustand. Der Balken stand
sofort auf dem Endwert. Zusätzlich verstieß er gegen die eigene Regel aus
`spec.md` §3: Layout-Eigenschaften werden nie animiert.

Behoben in einem Zug: `transform: scaleX` statt `width`, Kurve `ease-lauf`,
Dauer `dur-slow + dur-base`, und der Merkspeicher der alten Werte
(`fortschrittAlt`). Die Vorher-Nachher-Mechanik ist dabei aus dem
Aufräum-Modus **herausgelöst** worden: `balkenLaufen()` behandelt jetzt jeden
Balken mit `data-balken-ziel`, egal wo er steht. Ein dritter Balken bekäme
die richtige Bewegung damit geschenkt.

Geprüft von `test_fortschritt.js` (9 Zusicherungen). Es verlangt
**Zwischenwerte** — Anfangs- und Endwert allein hätten den Fehler nicht
gezeigt, so wie er zwei Wochen lang nicht aufgefallen ist.

## 2026-08-11 (abends) — Das „Aufblitzen" der Listen: gemessen, nicht repariert

**Gemeldet:** *„Wieso refreshen die Aufgaben in den Listen so oft? Wenn ich
z. B. eine Unteraufgabe als erledigt mache oder in eine Unteraufgabe
reingehe, bei vielen Aktionen refresht die Liste."*

**Nachgemessen** (MutationObserver auf dem Inhaltsbereich): Ein Klick auf
ein Kästchen verwirft **alle sichtbaren Spalten** und baut sie neu auf —
`renderColumns()` setzt `innerHTML` in einem Stück, `mountEditors()` erzeugt
die contenteditable-Editoren neu. Der Nutzer sieht also nicht ein
Kästchen umspringen, sondern die ganze Ansicht neu entstehen.

**Bewusst nicht im Mockup repariert.** Die Reparatur hieße, eine zweite,
gezielte Renderlogik neben der bestehenden zu bauen — für ein Artefakt, das
eingefroren wird (`spec.md` §4.5). In Flutter gibt es das Problem gar nicht:
Dort wird neu gebaut, was sich geändert hat, und der Fortschritt einer
übergeordneten Aufgabe ist ein abgeleiteter Wert mit eigenem Widget.
Dieselbe Begründung wie bei `test_4bugs` und der Füllzeilen-Konstruktion.

**Aber als Anforderung festgeschrieben**, in `spec.md` §2.2 direkt neben der
Erledigt-Kaskade: *Eine Änderung darf nur ihre Zeile betreffen.* Genau dort
wird beim Bau die Versuchung entstehen, mit einem pauschalen Neuzeichnen
abzukürzen — und genau dort steht jetzt, warum das dieses Flackern
zurückholt.

**Das ist die eigentliche Ausbeute des Abends:** Ein Mockup-Fehler, der
nicht behoben wird, ist trotzdem wertvoll — wenn er als Anforderung dort
landet, wo er beim echten Bau gelesen wird. Sonst wird er einfach
nachgebaut.

## 2026-08-12 — Das „Refreshen" war eine Animation, nicht der Neuaufbau

**Gemeldet:** *„Kalender drücken, auf die Aufgabe drücken, Heute auswählen
usw. lösen aus, dass die Aufgabe so eine kleine Animation macht — wirklich
sehr kleine —, die aussieht, als würde sich die Seite refreshen. Ich weiß
nicht, ob sie sich refresht oder jedes Mal eine Animation ausgelöst wird,
wir müssen den Bug finden."*

**Die Frage des Nutzers war die richtige, und die Antwort war: beides — aber
nur eines davon war das Übel.**

Am Vortag hatte ich den vollständigen Neuaufbau gemessen und als
„verschwindet beim Flutter-Umstieg" abgelegt. Das war richtig, aber
unvollständig: Der Neuaufbau allein ist **unsichtbar** — er tauscht Knoten
gegen identisch aussehende Knoten. Was man sah, war die
Einblend-Animation, die er dabei **auslöste**.

**Nachgemessen mit `document.getAnimations()`** — nicht mit Screenshots. Die
Bewegung ist 3 Pixel groß und 200 ms kurz; auf einem Standbild ist sie
unsichtbar, und zwei Aufnahmen im Abstand von 200 ms treffen sie nur mit
Glück. Die Frage „läuft gerade eine Animation?" beantwortet der Browser
dagegen exakt:

| Aktion | vorher | nachher |
|---|---|---|
| Aufgabe öffnen | `block-in` ×6 | ×4 (nur die **neue** Spalte) |
| Kalender drücken | `block-in` ×6 + `strip-in` | nur `strip-in` |
| „Heute" wählen | `block-in` ×6 + `strip-in` | — |
| Kästchen abhaken | `block-in` ×6 + `strip-in` | — |

**Die Ursache:** `animation: block-in` hing **unbedingt** an
`.inline-embed`. Die Animation ist für neu hinzugefügte Blöcke gedacht —
aber weil jede Änderung alle Zeilen neu erzeugt, blendeten sich bei jedem
Klick sämtliche Zeilen neu ein.

**Behoben** (und das ließ sich im Mockup sinnvoll beheben, anders als der
Neuaufbau selbst): Die Animation hängt jetzt an `.ist-neu`, und die Klasse
bekommt nur, was beim letzten Aufbau noch nicht da war. `einblendenNurNeu()`
merkt sich dazu die vorhandenen `data-embed-marker`. Dasselbe für Kalender
und Farbreihe, die bei jedem Klick neu einblendeten, obwohl sie schon offen
waren.

**Die Gegenprobe steht mit im Prüfskript:** Eine wirklich neu hinzugefügte
Zeile muss weiterhin einblenden. Ohne sie wäre „keine Animation mehr" auch
dadurch zu erreichen, dass man die Animation ganz entfernt — und dann fehlte
sie dort, wo sie hingehört.

**Die Lehre, und sie ist die wertvollste des Tages:** *„Sieht aus wie ein
Refresh"* hieß nicht, dass man den Neuaufbau sieht. Ich hatte den teuren,
nicht behebbaren Verursacher gefunden und war dabei stehen geblieben —
und hätte damit das billige, tatsächlich sichtbare Übel stehen lassen.
**Der erste plausible Verursacher ist nicht automatisch der richtige.**

In `spec.md` §2.2 steht die Regel jetzt für den Flutter-Bau: *Einblenden ist
für Neues.* Dort ist die Falle dieselbe — eine Einblend-Animation an einem
Listeneintrag, der bei jedem Zustandswechsel neu gebaut wird, läuft jedes
Mal.

## 2026-08-12 — „Besser, aber noch nicht ganz clean": Scrollstand und Cursor

Nach dem Beheben der Einblend-Animation blieb ein Rest. Die Rückmeldung des
Nutzers war vage — *„habe das Gefühl, dass es besser ist, aber noch nicht
ganz clean"* — und deshalb habe ich nicht geraten, sondern die typischen
Verluste eines Neuaufbaus **durchgemessen**: Scrollposition, Fokus,
Cursorstelle.

**Zwei davon waren echt:**

| | vorher | nachher |
|---|---|---|
| Scrollstand einer langen Liste beim Abhaken | 109 → **0** | 109 → 109 |
| Fokus + Cursorstelle im Listentitel | `col-title@3` → **`BODY`** | bleibt `col-title@3` |

Eine Liste, die beim Abhaken nach ganz oben springt, ist genau das
„Refresh"-Gefühl — nur diesmal nicht als Animation, sondern als **Verlust**.
Behoben mit `zustandMerken()` / `zustandZurueck()` um den Aufbau herum. Der
Schlüssel ist der `data-col-key` der Spalte bzw. das eindeutige
`data`-Attribut des Eingabefelds; eine Positionsnummer würde beim Öffnen
oder Schließen einer Spalte auf die falsche zeigen.

**Die Cursorstelle wird mit wiederhergestellt, nicht nur der Fokus.** Ein
Feld, das den Fokus behält, aber den Cursor ans Ende springen lässt, ist
beim Tippen schlimmer als gar kein Fokus.

### Zweimal in derselben Stunde die eigene Messung repariert

**Erstens:** `locator.click()` scrollt das Element vor dem Klick in den
sichtbaren Bereich. Die erste Messung meldete den Fehler deshalb als „nicht
behoben", obwohl der Fix längst griff — Playwright hatte vor dem Klick
selbst nach oben gescrollt. Der Klick wird jetzt **im Browser** ausgelöst,
auf eine Zeile, die ohnehin sichtbar ist.

**Zweitens:** Im Prüfskript stand `return bl.scrollTop` **nach** dem Klick.
Da ist das Element bereits abgehängt und meldet 0 — ein Wert, der gemessen,
aber wertlos ist.

Beide Male hätte ich fast am Erzeugnis weitergesucht. **Die Gegenprobe hat
es entschieden:** Ich habe den Fix per `git stash` entfernt, mit derselben
Methode gemessen und den Unterschied gesehen. Ohne diesen Schritt hätte ich
eine Reparatur dokumentiert, ohne zu wissen, ob sie etwas repariert. Das
gehört ab jetzt zu jeder Fehlerbehebung, deren Wirkung man nicht
unmittelbar sieht.

In `spec.md` §2.2 steht die Regel für den Flutter-Bau: *Ein Neuaufbau darf
nicht kosten, was der Nutzer eingestellt hat.* Dort ist die Falle dieselbe —
`ScrollController` und `FocusNode` tragen den Zustand nur, wenn sie
**außerhalb** des neu gebauten Teilbaums leben.

## 2026-08-12 — CLAUDE.md gegen zwei fremde Vorlagen geprüft

**Anlass:** Der Nutzer verwies auf zwei Quellen und bat ausdrücklich um
sorgfältige Prüfung statt blinder Übernahme:
[HumanLayer, „Writing a good CLAUDE.md"](https://www.humanlayer.dev/blog/writing-a-good-claude-md)
und [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills).

**Einschränkung, die hier festgehalten gehört:** Der HumanLayer-Artikel ist
vom Egress-Proxy dieser Umgebung **blockiert**, zwei Spiegel ebenfalls.
Grundlage war deshalb die Zusammenfassung aus der Websuche — zweite Hand.
Das Karpathy-Repo ließ sich direkt lesen. Wer die Entscheidungen unten
später anzweifelt, sollte den Originalartikel selbst prüfen.

### Was gemessen wurde

`CLAUDE.md` hatte 174 Zeilen, davon **64 im Block
„Entwicklungs-Konventionen"** — dem mit Abstand größten. Beim Durchzählen:
**28 dieser 64 Zeilen galten nur für bestimmte Arbeiten** (Abhängigkeiten,
Datenschicht, Feature-Bau, Flutter-Start). Sie standen also in einer Datei,
die bei *jeder* Sitzung vollständig gelesen wird, und hatten in den meisten
davon nichts zu suchen.

### Übernommen

**1. Situative Regeln nach `docs/conventions.md`** (HumanLayer:
aufgabenspezifische Dokus auslagern und nur mit kurzer Beschreibung
listen).

**Entscheidend ist dabei der Auslöser, nicht das Thema.** Ein Verweis
„Konventionen siehe conventions.md" wird nie befolgt; „**bevor** du eine
Bibliothek hinzufügst → dort nachlesen" schon. Ohne diese Präzisierung wäre
die Auslagerung eine Verschlechterung gewesen: Die Regeln zur Datenschicht
schützen vor unwiederbringlichem Datenverlust, und eine Regel, die niemand
aufschlägt, schützt nicht.

**2. „Behaupten ist nicht prüfen" als eigener Abschnitt.** Das ist der
teuerste wiederkehrende Fehler dieses Projekts — sechsmal vorgekommen
(2026-08-07 bis 2026-08-12) — und stand bisher nur verstreut in diesem
Protokoll, also dort, wo man erst nachliest, wenn man den Fehler schon
gemacht hat. Aus dem Karpathy-Repo stammt der Gedanke, Aufgaben in
**überprüfbare Ziele** statt in imperative Schritte zu fassen
(„Aktion → verify: Kontrolle"); die vier Regeln sind aber aus **unseren
eigenen** Fehlern abgeleitet, nicht abgeschrieben.

**3. „Chirurgisch ändern"** (Karpathy: *Surgical Changes*). Trifft hier
belegbar: Beim Entfernen des Fälligkeitsmenüs wurde eine Animation
mitgerissen, die ein anderer Teil noch benutzte, und neun Prüfskripte
wurden per Suchen-und-Ersetzen „repariert", bis die Selektoren wieder
matchten und die Prüfungen inhaltlich sinnlos waren.

### Nicht übernommen — mit Begründung

**Die 60-Zeilen-Marke.** HumanLayer hält die eigene Datei unter 60 Zeilen;
der breitere Konsens liegt bei unter 300. Unsere 172 liegen dazwischen, und
das ist hier richtig: Die Grundhaltung und die Doku-Pflicht (rund 40 Zeilen)
sind in diesem Projekt **universell** und vom Nutzer mehrfach ausdrücklich
eingefordert („und schön dokumentieren, ich will das nicht jedes Mal
erwähnen BITTE"). Sie zu kürzen, um eine fremde Zahl zu treffen, würde
genau die Erwartung untergraben, um die es ihm geht. Die richtige Frage ist
nicht „wie viele Zeilen?", sondern „gilt das **jedes Mal**?".

**„Simplicity First / minimum code" als Leitprinzip.** Das ist für
Coding-Agents in fremden Codebasen geschrieben. Hier gilt teilweise das
Gegenteil: ausführliche Begründungen, Prüfskripte zu jedem gemeldeten
Fehler, ein Entscheidungsprotokoll. „Keine ungefragten Features" gilt
weiterhin — aber als Sparsamkeit im *Produkt*, nicht in der *Dokumentation*.

**„Fragen statt Vermutungen".** Der Nutzer hat in diesem Projekt mehrfach
das Gegenteil verlangt („analysiere du das optimalste und führ dann die
richtige entscheidung aus"). Für uns gilt: Annahme **benennen** und
weiterarbeiten, nicht blockieren. Die bestehende Regel „Mitdenken statt
abarbeiten" deckt das bereits ab.

### Nebenbei behoben: drei Faktenfehler

- **Session-Start-Hook** stand als offenes To-do („einrichten, sobald…"),
  obwohl er seit 2026-08-06 lokal und seit 2026-08-07 auch in einer
  Web-Sitzung nachweislich läuft.
- **„Gearbeitet wird auf einem lokalen Klon"** galt absolut — während diese
  Sitzung im Web lief. Jetzt umgebungsunabhängig formuliert, mit Verweis
  auf `status.md` §0.
- **„Proaktive Hinweise"** stand doppelt: einmal als Grundhaltung, einmal
  als Konvention.

### Ergebnis

`CLAUDE.md` 174 → **172 Zeilen**, `docs/conventions.md` neu mit 60. Die
Datei ist also kaum kürzer — aber **umgeschichtet**: 28 Zeilen „gilt
vielleicht irgendwann" raus, rund 25 Zeilen „gilt jedes Mal und ist hier
schon sechsmal schiefgegangen" rein.

**Eine Beobachtung zum Schluss, weil sie den Wert der Regel belegt:** Beim
Einarbeiten war meine erste Fassung **203 Zeilen lang** — ich hatte einen
Artikel über Sparsamkeit gelesen und daraufhin mehr geschrieben. Erst das
Nachmessen hat es gezeigt. Das ist dieselbe Familie wie „behaupten ist
nicht prüfen", nur an einem Text statt an Code.

## 2026-08-12 (Nachtrag) — Ich habe aus einer Zusammenfassung geschlussfolgert

**Der Eintrag oben („CLAUDE.md gegen zwei fremde Vorlagen geprüft") bleibt
stehen, ist aber in Teilen falsch.** Historische Einträge werden hier nicht
überschrieben (Festlegung des Nutzers, 2026-08-07) — deshalb dieser
Nachtrag.

**Anlass:** Der Nutzer fragte, ob ich mir *wirklich alles* aus dem Repo
angesehen habe. Antwort: **nein.** Ich hatte eine von einem anderen Werkzeug
erzeugte Zusammenfassung der README und zwei Paraphrasen der `CLAUDE.md` —
mehr nicht. Daraufhin habe ich seine wichtigste Datei umgebaut.

Er stellte im selben Zug die Regel dazu:

> **Verify, Don't Trust** — When producing an analysis or summarization of
> something gleaned from a resource, do not trust a memory or retained
> summary of that resource. Always retrieve the resource afresh and compare
> it to the summary or analysis you are preparing. When comparing, do so in
> an adversarial way: you are fact-checking work that you suspect at the
> start contains errors and hallucinations.

### Was der Abgleich am geklonten Repo ergab

| Behauptung (aus der Zusammenfassung) | Wirklichkeit |
|---|---|
| `CLAUDE.md` „ca. 100–120 Zeilen" | **65** |
| 6 Dateien | **9** |
| `skills/` kam nicht vor | existiert: `skills/karpathy-guidelines/SKILL.md` |
| `EXAMPLES.md` = „praktische Beispiele" | **522 Zeilen — die größte Datei, ungelesen** |

### Drei Korrekturen an meiner Bewertung

**1. „Simplicity First" habe ich gegen einen Strohmann abgelehnt.** Ich
schrieb, es sei „für Coding-Agents in fremden Codebasen" und hier gelte
teilweise das Gegenteil. Im Original steht aber nicht „wenig schreiben",
sondern: *„The problem is **timing**: they add complexity before it's
needed"* und *„Good code is code that solves today's problem simply, not
tomorrow's problem prematurely."* Das ist kein Argument gegen Dokumentation
— es richtet sich gegen **verfrühte Abstraktion**, und das trifft uns sehr
wohl. Meine Ablehnung war zu pauschal, weil ich nur die Überschrift kannte.

**2. Den Tradeoff-Absatz hatte ich übersehen.** Das Repo sagt selbst:
*„These guidelines bias toward caution over speed. For trivial tasks, use
judgment."* Meine Einwände gegen „fragen statt vermuten" waren also weniger
originell als dargestellt — die Quelle nennt den Preis selbst.

**3. „Goal-Driven Execution" habe ich unterschätzt — und es ist der
wertvollste Punkt für unser tatsächliches Problem.** Der Kernsatz aus der
README stand in meiner Zusammenfassung nicht:

> „LLMs are exceptionally good at looping until they meet specific goals…
> Don't tell it what to do, give it success criteria and watch it go."
> — und: *„Strong success criteria let the LLM loop independently. Weak
> criteria ('make it work') require constant clarification."*

Der Nutzer hat sich in dieser Sitzung **zweimal** über die Dauer beklagt.
Ein erheblicher Teil davon lief nach genau diesem Muster: vage Vorgabe
(„noch nicht ganz clean"), daraufhin breite Suche. Die Regel dagegen ist
billig — **erst Ort und Auslöser klären, dann messen** — und steht jetzt
als Punkt 6 in `CLAUDE.md`.

### Aufgenommen

Als Punkt 5 unter „Behaupten ist nicht prüfen": *Eine Zusammenfassung ist
keine Quelle.* Bewusst dort und nicht als eigener Abschnitt — es ist
dieselbe Fehlerfamilie, nur auf **Quellen** statt auf **Code** angewandt.
Genau diese Hälfte fehlte: Die vier bisherigen Punkte adressieren
ungeprüfte Behauptungen über *das eigene Erzeugnis*, nicht über *fremdes
Material*.

**Was das Ganze über die Werkzeuge sagt:** `WebFetch` liefert die Antwort
eines kleinen Modells auf eine Frage, nicht die Seite. Für „gibt es das?"
reicht das; für „darauf baue ich eine Entscheidung" nicht. Ein Repo lässt
sich klonen und wirklich lesen — das kostete hier keine zwei Minuten und
hätte alle drei Fehler oben verhindert.

**Nachtrag zum Nachtrag (gleicher Tag):** Als der Nutzer nachfragte, ob nun
*wirklich alles* gelesen sei, ergab das Nachzählen: **nein — 6 von 9
Dateien.** Es fehlten `.claude-plugin/marketplace.json`,
`.cursor/rules/karpathy-guidelines.mdc` und `README.zh.md`. Inzwischen
gelesen; sie enthalten nichts Neues (Plugin-Metadaten, eine Kopie der
Richtlinien für Cursor, die chinesische Übersetzung der README).

**Zweimal in Folge „alles geprüft" gesagt, ohne nachgezählt zu haben** —
beim ersten Mal grob falsch, beim zweiten Mal knapp daneben. Die Lehre ist
nicht neu, aber sie sitzt jetzt: **„Alles" ist eine Mengenangabe und
gehört gezählt.** Der HumanLayer-Artikel bleibt unerreichbar (Domain auf
Proxy-Ebene gesperrt, auch per `curl`: 403) — jede Aussage darüber steht
weiterhin auf zweiter Hand.

Eine Kleinigkeit am Rande, die dem Repo-Autor gehört: Die Cursor-Fassung
der Richtlinien enthält den Tradeoff-Absatz („bias toward caution over
speed") **nicht**, obwohl `CURSOR.md` ausdrücklich verlangt, beide Fassungen
synchron zu halten.

## 2026-08-12 — „Steht in der Datei" ist noch nicht „implementiert"

**Die Frage des Nutzers:** *„Okay, also hast du das neue Wissen auch
implementiert?"* — Beim Nachprüfen (statt Antworten aus dem Gedächtnis) kam
eine echte Lücke heraus:

**`docs/conventions.md` wurde von keinem der drei Sitzungswerkzeuge
erwähnt** — nicht von `start.md`, nicht von `ende.md`, nicht von
`session-check.sh`. Ich hatte 28 Zeilen Regeln aus `CLAUDE.md` in eine
Datei ausgelagert, die im Sitzungsablauf schlicht nicht vorkam. Der
Verweis stand nur in `CLAUDE.md` selbst. Das hätte funktionieren *können* —
aber es war nirgends abgesichert.

**Behoben in zwei Schritten:**

1. **`start.md` nennt die Datei jetzt** bei den Dokumenten, die *bei Bedarf*
   gelesen werden, zusammen mit ihren Auslösern. Bewusst nicht bei den
   Dateien, die *immer* gelesen werden — sonst wäre die Auslagerung
   sinnlos gewesen.
2. **`session-check.sh` prüft die Verweise mechanisch** (neuer Abschnitt 7).
   Er meldet drei Zustände: Datei fehlt, obwohl `CLAUDE.md` sie nennt;
   ein Abschnitt fehlt, auf den ein Auslöser zeigt; oder der Verweis ist
   aus `CLAUDE.md` verschwunden, sodass die Datei nie gelesen würde.

**Warum das nötig ist:** Eine ausgelagerte Regel, deren Verweis ins Leere
zeigt, ist praktisch gelöscht — und niemandem fällt es auf, weil beide
Dateien für sich genommen in Ordnung aussehen. Bei den Regeln zur
Datenschicht wäre der Preis unwiederbringlicher Datenverlust.

**Die Prüfung wurde gegengeprüft**, wie es die eigene Regel verlangt: Datei
entfernt → rot; einen Abschnitt gelöscht → rot mit Namen des fehlenden
Abschnitts; Verweis aus `CLAUDE.md` entfernt → rot. Danach wiederhergestellt
→ grün. Ohne diesen Schritt wäre es wieder eine Prüfung gewesen, von der
niemand weiß, ob sie prüft.

### Was ausdrücklich NICHT implementiert ist

- **Die neuen Regeln wirken erst ab der nächsten Sitzung.** `CLAUDE.md`
  wird beim *Start* geladen; in dieser Sitzung liegt noch die alte Fassung
  im Kontext. Dass ich mich seit heute daran halte, ist Vorsatz, nicht
  Mechanik.
- **Verhaltensregeln lassen sich nicht mechanisch erzwingen.** „Behaupten
  ist nicht prüfen" und „eine Zusammenfassung ist keine Quelle" kann kein
  Skript kontrollieren. Prüfbar ist nur, ob die Regeln **vorhanden und
  erreichbar** sind — das tut Abschnitt 7 jetzt.
