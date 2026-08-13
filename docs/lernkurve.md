# Lernkurve — welche Fehler wiederkehren und was dagegen hilft

**Zweck:** Aus Einzelfällen **Muster** machen. `docs/decisions.md` hält
jeden Vorfall chronologisch fest — inzwischen über 3000 Zeilen. Darin ist
nicht zu erkennen, dass derselbe Fehler sechsmal vorkam; man müsste ihn
zusammensuchen. Diese Datei tut das.

**Abgrenzung — damit nichts doppelt gepflegt wird:**

| Datei | Enthält |
|---|---|
| `CLAUDE.md` | **Die Regel.** Kurz, verbindlich, wird bei jeder Sitzung geladen. |
| `docs/decisions.md` | **Den Einzelfall.** Was wann warum entschieden wurde. |
| **diese Datei** | **Das Muster.** Wie oft, woran erkannt, was daraus wurde — und was noch offen ist. |

**Wann lesen:** Wenn eine Regel in `CLAUDE.md` unverständlich erscheint oder
gestrichen werden soll — hier steht, was sie gekostet hat. Und bevor eine
neue Regel dazukommt: vielleicht gibt es sie schon.

**Wann schreiben:** Bei `ende unfold`, wenn ein Fehler **zum zweiten Mal**
aufgetreten ist. Einmal ist ein Vorfall, zweimal ist ein Muster.
Vorher **`bash scripts/lernkurve-abgleich.sh`** laufen lassen — es zeigt,
was im Bestand steht und hier fehlt.

**Woran man sieht, ob diese Datei etwas nützt:** Jedes Muster trägt ein
**„zuletzt"**-Datum. Bleibt es stehen, während die Sitzungen weiterlaufen,
wirkt die Gegenmaßnahme. Rückt es nach, wirkt sie nicht — dann ist die
Regel zu schwach oder am falschen Ort, und *das* ist die Erkenntnis, nicht
der Vorfall selbst. Ein Muster, das **drei Sitzungen** ruhig war, wandert
nach unten zu „Beigelegt" — gelöscht wird nie, sonst kommt es
unbeobachtet zurück.

> Dieser Maßstab hat beim ersten Anlegen **gefehlt**. Ich hatte am selben
> Tag die Regel „Erfolgskriterien vor der Arbeit" aufgenommen und sie beim
> Bauen dieser Datei nicht angewandt — eine Sammlung ohne Maßstab ist ein
> Archiv, kein Werkzeug.

---

## Die wiederkehrenden Fehlermuster

### 1. Behaupten statt prüfen — 4 Vorfälle · zuletzt 2026-08-12

| Datum | Gestalt | Wer fand es |
|---|---|---|
| 2026-08-07 | „Alle 40 Prüfskripte grün" — es gab keinen Läufer | ich (beim Bauen des Läufers) |
| 2026-08-11 | Fortschrittsbalken: `transition` im Stylesheet, nie gelaufen | **Nutzer** |
| 2026-08-11 | Mini-Balken an der Aufgabenzeile: derselbe Fehler, Wochen alt | ich (beim Angleichen) |
| 2026-08-12 | Aus einer Werkzeug-Zusammenfassung geschlossen statt die Quelle zu lesen | **Nutzer** |

**Der gemeinsame Kern:** Eine Aussage über ein Verhalten wurde gemacht,
ohne das Verhalten zu beobachten. Ob es um Testläufe, Animationen oder
fremde Dokumente geht, ist zweitrangig.

> **Korrigiert am 2026-08-12 beim Nachzählen:** Hier standen erst 6
> Vorfälle. Zwei davon (`e-05`-Regex, `locator.click()`) waren **falsch
> einsortiert** — bei beiden lag der Fehler in der Messung, sie gehören
> zu Muster 2. Die Gesamtzahl stimmte, das Muster nicht. Das ist nicht
> kosmetisch: Es verschiebt, welche Gegenmaßnahme als die wichtigste
> erscheint.

**Daraus wurde:** `CLAUDE.md`, Abschnitt „Behaupten ist nicht prüfen"
(6 Regeln). Der wirksamste Einzelpunkt ist die **Gegenprobe**: den Fix
entfernen, gleich messen, Unterschied ansehen.

### 2. Der Fehler liegt in der Messung, nicht im Erzeugnis — 6 Vorfälle · zuletzt 2026-08-12

**Das häufigste Muster** — und das war beim ersten Anlegen dieser Datei
nicht zu sehen, weil zwei Fälle unter Muster 1 einsortiert waren.

Ein Prüfskript wird rot, und der erste Reflex ist, das Erzeugnis zu
reparieren.

| Datum | Gestalt | Wer fand es |
|---|---|---|
| 2026-08-07 | Zeitgrenze 120 s bei 119 s Laufzeit → „Absturz" gemeldet | ich |
| 2026-08-07 | Suche nach „false" traf Mess-JSON statt Zusicherungen | ich |
| 2026-08-07 | Erwartung „Zähler +1" bei verschachtelt summierendem Zähler | ich |
| 2026-08-08 | Linker Rand gemessen, während die Ansicht gescrollt war | ich |
| 2026-08-11 | Regex schnitt `e-05` ab → meldete Überschwinger, den es nicht gab | ich (Rohwerte ausgegeben) |
| 2026-08-12 | `locator.click()` scrollt selbst → meldete Fix als wirkungslos | ich (Gegenprobe per `git stash`) |

**Daraus wurde:** Regel 2 in „Behaupten ist nicht prüfen" — *erst die
Messung anzweifeln, dann das Erzeugnis; die Messung dann aber auch
reparieren, nicht die Zusicherung entschärfen.*

### 3. Zu grob geändert — 2 Vorfälle · zuletzt 2026-08-07

- Beim Entfernen des Fälligkeitsmenüs wurde eine Animation mitgerissen,
  die ein anderer Teil noch benutzte.
- Neun Prüfskripte per Suchen-und-Ersetzen „repariert": Die Selektoren
  waren danach wieder gültig, die Prüfungen inhaltlich sinnlos.

**Daraus wurde:** `CLAUDE.md`, Abschnitt „Chirurgisch ändern".

### 4. Der erste plausible Verursacher ist nicht der einzige — 1 Vorfall · zuletzt 2026-08-12

Beim „Aufblitzen" der Listen fand ich den vollständigen Neuaufbau, hielt
ihn für die Ursache und legte ihn als „verschwindet beim Flutter-Umstieg"
ab. Der Neuaufbau war echt — aber **unsichtbar**. Sichtbar war die
Animation, die er auslöste. Darunter lagen noch Scrollstand und
Cursorverlust. Drei Ursachen, ich hatte bei der ersten aufgehört.

### 5. Zu lange gebraucht — 2 Meldungen · zuletzt 2026-08-11

Ursachen, nachgezählt: der vollständige Prüfungslauf dauert 8–10 Minuten
(Fuzz-Skripte) und lief an einem Tag fünfmal; dazu breite Suche bei vagen
Vorgaben.

**Daraus wurde:** nur betroffene Skripte laufen lassen
(`run-mockup-tests.sh <filter>`), voller Lauf nur bei Eingriffen ins
Datenmodell und zum Schluss. Plus Regel 6: **bei vager Vorgabe zuerst nach
Ort und Auslöser fragen.**

### 6. Angelegt, aber nicht verwoben — 2 Vorfälle · zuletzt 2026-08-12

- `docs/conventions.md` wurde von **keinem** Sitzungswerkzeug erwähnt —
  28 Zeilen Regeln in einer Datei, die im Ablauf nicht vorkam.
- `docs/lernkurve.md` (diese Datei) hätte dasselbe Schicksal gehabt, wenn
  der Nutzer nicht direkt danach gefragt hätte.

**Der Grundsatz daraus** (Formulierung des Nutzers): *„Alles soll wie ein
Netz sein. Wenn etwas in dieses Netz nicht verwoben ist, benutzt es auch
keiner."* Beim Anlegen einer Datei gehören drei Fragen sofort beantwortet:
**Von wo wird verwiesen? Bei welchem Auslöser? Wer schreibt sie fort?**

Das Tückische: Beide Seiten sehen für sich genommen in Ordnung aus. Die
Datei ist gut, die verweisende Datei ist gut — nur die Verbindung fehlt,
und die sieht man nur, wenn man gezielt danach sucht. Deshalb prüft
`session-check.sh` es jetzt mechanisch, und zwar **generisch für alle
Dateien unter `docs/`**, nicht pro Datei: Die ersten beiden Prüfungen waren
handgeschriebene Zwillinge, beim dritten Dokument wäre ein Drilling
entstanden.

### 7. Der Nutzer sieht einen anderen Stand als das Repo — 2 Vorfälle · zuletzt 2026-08-08

| Datum | Gestalt | Wer fand es |
|---|---|---|
| 2026-08-07 | Mockup unter einer **zweiten, leeren** Artifact-Adresse veröffentlicht | **Nutzer** |
| 2026-08-08 | Mockup geändert, aber **nicht neu** veröffentlicht — „hast du Variante 2 überhaupt gebaut?" | **Nutzer** |

**Warum dieses Muster besonders tückisch ist:** Im Repo stimmt alles, jede
Prüfung meldet grün — nur das, was der Nutzer *ansieht*, ist veraltet. Der
Fehler ist geräuschlos und kann beliebig lange unbemerkt bleiben. **Beide
Male hat ihn der Nutzer gefunden, nicht ich.**

**Daraus wurde:** `ende unfold`, Schritt 12 — die ausdrückliche Frage, ob
das veröffentlichte Mockup zum Repo-Stand passt. Mechanisch prüfbar ist es
nicht (das Skript läuft ohne Netz), deshalb eine bewusste Frage.

> **Nachgetragen am 2026-08-12 beim Double-Check.** Dieses Muster fehlte,
> obwohl es nach eigener Definition (zweimal = Muster) hineingehörte und in
> `status.md` §6 seit Tagen als Fallstrick stand. Beim ersten Anlegen habe
> ich nur die Fehler aus dem *laufenden* Chat gesammelt, statt die
> vorhandene Doku systematisch durchzugehen.

### 8. Textersetzung per Skript, ohne das Ergebnis anzusehen — 4 Vorfälle · zuletzt 2026-08-13

| Datum | Gestalt | Wer fand es |
|---|---|---|
| 2026-08-12 | `session-log.md`: Überschrift klebte am Trennstrich (`---## 2026-08-12`) → die Prüfung erkannte den Eintrag nicht | Prüfskript |
| 2026-08-12 | `lernkurve.md`: Muster 6 landete hinter „Was nicht funktioniert hat" statt bei den Mustern | ich (beim Nachlesen) |
| 2026-08-12 | `ende.md`: doppelter Halbsatz („Alles Übrige… Alles, was in der Luft hängt…") | ich (beim `ende unfold`) |
| 2026-08-13 | `session-log.md`: neuer Eintrag ohne Leerzeile vor dem `---` eingefügt → die letzte Textzeile wurde dadurch selbst zur Überschrift (Setext) | ich (beim Ansehen der Stelle) |

**Der Kern:** Ein `python3 -c "…replace(…)"` meldet keinen Fehler, wenn das
Ergebnis unsinnig ist — nur wenn das Suchmuster gar nicht passt. Die
Ersetzung *gelingt* also, und das Ergebnis ist trotzdem falsch. Das ist
dieselbe Familie wie Muster 1: Der Vorgang wurde ausgeführt, aber nicht
**beobachtet**.

**Daraus wurde:** Nach jeder Textersetzung die betroffene Stelle ansehen —
`sed -n 'X,Yp'` oder `grep -n "^## "` für die Gliederung. Das kostet eine
Zeile und hätte alle drei Fälle gefunden.

Bemerkenswert: Dreimal fiel es **mir** auf, einmal dem Prüfskript. Wo eine
mechanische Prüfung existiert, greift sie — deshalb ist der Ausbau der
Prüfungen wirksamer als der Vorsatz, sorgfältiger zu sein.

**Der vierte Fall (2026-08-13) ist der Beleg, dass die Gegenmaßnahme
wirkt** — und zugleich, dass sie den Fehler nicht *verhindert*. Ich hatte
denselben Trennstrich vor Augen, an dem es beim ersten Mal schiefging,
habe die Stelle deshalb angesehen und den Fehler in derselben Minute
gefunden. Das „zuletzt"-Datum rückt also nach, aber die Kosten sind von
einer Prüfung-meldet-rot-Runde auf eine Zeile gefallen. **Was fehlt:** Die
`session-check.sh`-Prüfung erkennt nur den geklebten Fall (`---## …`),
nicht den Setext-Fall (Text direkt über `---`). Eine Zeile im Skript wäre
das Netz — noch nicht gebaut, steht in `docs/status.md` §2 als kleiner
offener Punkt.

### 9. Werkzeug im Scratchpad angelegt, obwohl es ins Repo gehört — 2 Vorfälle · zuletzt 2026-08-11

| Datum | Gestalt | Wer fand es |
|---|---|---|
| 2026-08-06 | **40 Prüfskripte** lagen ausschließlich im Scratchpad — bei einem Sitzungswechsel ersatzlos verloren | ich |
| 2026-08-11 | `shots.js` (Screenshots des Aufräum-Modus) erst beim Sitzungsende gerettet, nicht gleich angelegt | `session-check.sh` |

**Der Kern:** Die Regel in `CLAUDE.md` sagt *„von vornherein im Repo
anlegen"*. In der Praxis entsteht das Skript im Scratchpad, weil es
„nur schnell etwas nachsehen" sollte — und wird dann doch zum Werkzeug.
Der Übergang ist fließend und deshalb schwer zu bemerken.

**Was hilft:** `session-check.sh` Abschnitt 6 listet das Scratchpad beim
Sitzungsende auf. Das ist ein **Netz**, kein Vorsatz — es hat beim zweiten
Vorfall funktioniert.

**Dritter Vorfall am 2026-08-13**, gleiche Gestalt: `anim.js`, `logo.js`
und `logogr.js` entstanden als „nur schnell nachsehen" und wurden zu den
Werkzeugen, mit denen zwei Befunde des Tages überhaupt erst sichtbar
wurden. Gerettet hat sie wieder Abschnitt 6, nicht mein Vorsatz. Damit ist
belegt: Der fließende Übergang lässt sich nicht durch Aufmerksamkeit
abstellen — das Netz muss ihn auffangen. Der Zähler steht bei **3**.

---

### 10. Eine Prüfung schreibt einen **Zustand** fest statt einer **Regel** — 4 Vorfälle · zuletzt 2026-08-13

| Datum | Prüfung | Schrieb fest | Statt der Regel |
|---|---|---|---|
| 2026-08-13 | `test_list_header` | den Hexwert des alten Taubenblaus | „der Punkt zeigt die gewählte Farbe" |
| 2026-08-13 | `test_aufraeumen` | die Liste der damaligen `--ease-spring`-Fundstellen | „federnd nur, wo etwas ankommt" |
| 2026-08-13 | `verify_center` (offen) | die alte Achse der Gruppenzeile | die Ausrichtungsregel |
| 2026-08-13 | `test_aufraeumen` | „der Knopf ist nicht im DOM" | „kein Weg in den Aufräum-Modus bei leerem Eingang" |

**Der Kern:** So eine Prüfung meldet einen Fehler **genau dann, wenn eine
Entscheidung korrekt umgesetzt wird**. Sie schützt nicht, sie bremst — und
sie ist besonders tückisch, weil sie beim Anlegen richtig aussieht: Im
Moment des Schreibens *ist* der Zustand ja die Regel.

**Warum es an einem Tag dreimal auftrat:** Es war der erste Tag, an dem
gleichzeitig viele Design-Festlegungen geändert wurden (Palette, Logo,
Bewegungskurven). Vorher gab es kaum Anlässe, an denen ein festgeschriebener
Zustand sich hätte ändern müssen. Die Prüfungen waren also schon lange
falsch gebaut — aufgefallen ist es erst, als es wehtat.

**Der Test beim Schreiben einer Zusicherung:** *Wenn der Nutzer morgen eine
erlaubte Entscheidung ändert — meldet die Prüfung dann rot?* Wenn ja,
prüft sie den Zustand. Richtig ist, die **Beziehung** zu prüfen („der Punkt
trägt dieselbe Farbe wie die Liste"), nicht den Wert.

**Der vierte Fall ist der teuerste Beleg:** Er hat eine **Reparatur**
blockiert, nicht nur eine Entscheidung. Der Knopf musste im Aufbau bleiben,
damit die Kopfzeile nicht mehr springt — und genau das meldete die Prüfung
als Fehler. Wer der Prüfung geglaubt hätte, hätte den Fehler des Nutzers
stehen lassen.

**Noch kein Netz.** Anders als bei Muster 9 gibt es hier keine mechanische
Prüfung — eine Prüfung, die prüft, ob Prüfungen Regeln statt Zuständen
folgen, ist nicht trivial. Steht bewusst unter „Offene Schwächen".

---

## Wer die Fehler findet — die eigentliche Kennzahl

Ob ich besser werde, zeigt sich nicht an der Zahl der Fehler, sondern
daran, **wer sie entdeckt**. Ein Fehler, den ich selbst finde, kostet
Minuten; einer, den der Nutzer melden muss, kostet ihn Vertrauen und eine
Runde.

Stand 2026-08-13, über alle Muster:

| | Anzahl | Veränderung |
|---|---|---|
| von mir selbst gefunden | 13 | — |
| von einem Prüfskript gefunden | **6** | +4 |
| **vom Nutzer gemeldet** | **6** | — |

**Am 2026-08-13 kamen vier Vorfälle dazu — alle vier fand ein Skript,
keinen davon der Nutzer.** Die drei Fälle von Muster 10 meldeten die
Prüfungen selbst (indem sie rot wurden, wo sie nicht rot werden durften),
den dritten Scratchpad-Fall fand `session-check.sh`. Das ist die erste
Sitzung, in der die Netze mehr gefunden haben als ich.

**Diese Zahl ist der Maßstab dieser Datei.** Sinkt der rechte Wert über die
nächsten Sitzungen, wirken die Regeln. Bleibt er, wirken sie nicht — egal
wie gut sie klingen.

**Die zweite Zeile ist die wichtigste Erkenntnis der Datei:** Wo eine
mechanische Prüfung existiert, findet sie den Fehler — ohne dass jemand
daran denken muss. Das ist der Grund, warum der Ausbau von
`session-check.sh` und `run-mockup-tests.sh` mehr gebracht hat als jede
Vorsatzregel.

Auffällig dabei: Bei Muster 2 (Messfehler) habe ich **alle sechs** selbst
gefunden. Bei den sichtbaren Dingen — Animation, veröffentlichter Stand —
war es umgekehrt. Ich prüfe offenbar gut, was ich *messen* kann, und
schlecht, was man *sehen* muss.

---

## Was messbar geholfen hat

- **`scripts/run-mockup-tests.sh`** — fällt ein Urteil pro Skript, statt
  Zahlen zu drucken. Vorher war „alles grün" eine Behauptung.
- **`scripts/session-check.sh`** — prüft mechanisch, was sonst vergessen
  wird. Hat mehrfach echte Lücken gefunden, zuletzt den toten Verweis auf
  `conventions.md`.
- **Zwischenwerte statt Endwerte messen.** Anfangs- und Endwert stimmten
  bei beiden Animationsfehlern immer — nur der Weg dazwischen fehlte.
- **Rohwerte ausgeben, wenn eine Zahl seltsam aussieht.** So fiel die
  abgeschnittene Exponentialschreibweise auf.
- **`document.getAnimations()`** statt Screenshots für kurze Bewegungen.
  Eine 3-Pixel-Bewegung über 200 ms ist auf einem Standbild unsichtbar.
- **Gegenprobe per `git stash`.**
- **An den gerenderten Elementen messen, nicht an den CSS-Tokens.**
  `test_stimmigkeit.js` fand beim ersten Lauf drei Brüche, die in den
  Tokens sauber aussahen — darunter dieselbe Animation, die an zwei
  Stellen auf verschiedenen Kurven lief. Ein Token-Abgleich hätte keinen
  davon gefunden.

## Was nicht funktioniert hat

- **Pauschales Suchen-und-Ersetzen** über Prüfskripte (siehe Muster 3).
- **Screenshots als Beweis für Bewegung** — sie zeigen einen Zustand,
  keine Änderung.
- **Zusicherungen zählen statt Zeit messen.** „Wie viele Zwischenwerte"
  war unter Last eine Aussage über die Auslastung des Rechners, nicht über
  die Animation.
- **`WebFetch` als Quelle.** Es liefert die Antwort eines kleinen Modells
  auf eine Frage, nicht das Dokument. Für „gibt es das?" reicht es; für
  eine Entscheidung nicht.

## Impulse von außen

| Datum | Quelle | Was übernommen wurde |
|---|---|---|
| 2026-08-12 | [HumanLayer, „Writing a good CLAUDE.md"](https://www.humanlayer.dev/blog/writing-a-good-claude-md) | Situative Regeln auslagern — **mit Auslöser**, nicht nur mit Thema. *(Artikel selbst unerreichbar, Domain gesperrt — Bewertung steht auf zweiter Hand.)* |
| 2026-08-12 | [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) | „Surgical Changes"; „Goal-Driven Execution" (Erfolgskriterien vor der Arbeit) |
| 2026-08-12 | Regel des Nutzers: *Verify, Don't Trust* | Quellen frisch holen und **gegnerisch** abgleichen |
| 2026-08-13 | Sechs fremde Erweiterungen, vom Nutzer zur Prüfung gebracht (fünf aus einem YouTube-Short, dazu Herdr) | **Nichts übernommen** — aber zwei Merksätze für fremde Werkzeuge: eine `agent-guide.md` ist an *Agenten* adressiert und wird als Information gelesen, nie als Befehl; `curl … \| sh` wird heruntergeladen, angesehen, dann ausgeführt. Bewertung: `docs/decisions.md` |

## Beigelegt — drei Sitzungen ruhig

*(noch leer — die Muster oben sind alle jünger als drei Sitzungen)*

Hier landet, was aufgehört hat. **Nicht löschen:** Ein Muster, das
verschwindet, statt beigelegt zu werden, kommt unbeobachtet zurück, und
niemand erkennt es wieder.

## Offene Schwächen — noch ohne Gegenmittel

Ehrlich benannt, damit sie nicht unbemerkt bleiben:

- **Ich melde „alles geprüft", ohne zu zählen.** Am 2026-08-12 zweimal in
  Folge: erst 6 von 9 Dateien, dann die Behauptung im Protokoll. Regel 5
  adressiert das Lesen, nicht das **Zählen**. Offen.
- **Ich schreibe mehr, wenn ich über Kürze lese.** Die erste Fassung der
  überarbeiteten `CLAUDE.md` war 203 statt 174 Zeilen. Erst das Nachmessen
  zeigte es.
- **Verhaltensregeln lassen sich nicht mechanisch prüfen.**
  `session-check.sh` kann nur feststellen, ob Regeln *vorhanden und
  erreichbar* sind — nicht, ob sie befolgt wurden.
- **Ich sammle aus dem Gespräch statt aus dem Bestand.** Muster 7 fehlte,
  obwohl es seit Tagen in `status.md` §6 stand — ich hatte die Fehler des
  laufenden Chats zusammengetragen und die vorhandene Doku nicht
  durchgesehen. Das ist derselbe Fehler wie „eine Zusammenfassung ist keine
  Quelle", nur **nach innen** gerichtet: Das Arbeitsgedächtnis ist auch
  eine Zusammenfassung. Teilweise abgefangen durch
  `scripts/lernkurve-abgleich.sh`, aber nur teilweise — das Skript findet
  Kandidaten, es erkennt keine Muster.
- **Ich melde nicht von selbst, wenn ein Dokument fehlt.** Diese Datei
  entstand, weil der Nutzer danach fragte — nicht, weil mir auffiel, dass
  die Lehren unauffindbar in 3289 Zeilen `decisions.md` lagen. Die
  Doku-Pflicht in `CLAUDE.md` verlangt, Entscheidungen festzuhalten; sie
  verlangt nicht, zu bemerken, dass eine **Sorte** von Wissen keinen Ort
  hat. `ende unfold` fragt seit heute danach (Schritt 9).
- **Neue Regeln wirken erst ab der nächsten Sitzung.** `CLAUDE.md` wird
  beim Start geladen; wer sie mitten in einer Sitzung ändert, hält sich
  aus Vorsatz daran, nicht durch Mechanik.
- **Gegen Muster 10 gibt es kein Netz.** Ob eine Zusicherung eine *Regel*
  oder nur einen *Zustand* prüft, kann `run-mockup-tests.sh` nicht
  feststellen — beide laufen grün. Es bleibt eine Frage beim Schreiben:
  *Meldet die Prüfung rot, wenn der Nutzer morgen eine erlaubte
  Entscheidung ändert?* Bisher nur ein Vorsatz, und Vorsätze haben in
  dieser Datei eine schlechte Bilanz.
- **Regel 5 gilt auch für Suchergebnisse, und ich habe sie am 2026-08-13
  nur halb befolgt.** Bei der Bewertung von sechs fremden Werkzeugen habe
  ich zwei Quellen wirklich selbst geholt (die README im
  `anthropics`-Repo, die Herdr-Repo-Seite) — die Beschreibungen von
  Headroom, Task Observer und claude-mem stammen dagegen aus
  **Suchzusammenfassungen**. Das reicht für „gibt es das und was ist es
  ungefähr", nicht für eine Entscheidung. Da nichts übernommen wurde, hat
  es nichts gekostet; bei einer Übernahme müsste zuerst das Repo gelesen
  werden. Steht auch in `docs/status.md` §7.
