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
