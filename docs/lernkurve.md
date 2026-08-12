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

### 1. Behaupten statt prüfen — 6 Vorfälle · zuletzt 2026-08-12

Mit Abstand der teuerste. Er tarnt sich jedes Mal anders:

| Datum | Gestalt | Wie er auffiel |
|---|---|---|
| 2026-08-07 | „Alle 40 Prüfskripte grün" — es gab keinen Läufer | Beim Bauen des Läufers |
| 2026-08-11 | Fortschrittsbalken: `transition` im Stylesheet, nie gelaufen | Der Nutzer sah, dass er springt |
| 2026-08-11 | Mini-Balken an der Aufgabenzeile: derselbe Fehler, Wochen alt | Erst beim Angleichen bemerkt |
| 2026-08-11 | Regex schnitt `e-05` ab → meldete Überschwinger, den es nicht gab | Rohwerte ausgegeben |
| 2026-08-12 | `locator.click()` scrollt selbst → meldete Fix als wirkungslos | Gegenprobe per `git stash` |
| 2026-08-12 | Aus einer Werkzeug-Zusammenfassung geschlossen statt die Quelle zu lesen | Nachfrage des Nutzers |

**Der gemeinsame Kern:** Eine Aussage über ein Verhalten wurde gemacht,
ohne das Verhalten zu beobachten. Ob es um Testläufe, Animationen oder
fremde Dokumente geht, ist zweitrangig.

**Daraus wurde:** `CLAUDE.md`, Abschnitt „Behaupten ist nicht prüfen"
(6 Regeln). Der wirksamste Einzelpunkt ist die **Gegenprobe**: den Fix
entfernen, gleich messen, Unterschied ansehen.

### 2. Der Fehler liegt in der Messung, nicht im Erzeugnis — 4 Vorfälle · zuletzt 2026-08-12

Ein Prüfskript wird rot, und der erste Reflex ist, das Erzeugnis zu
reparieren.

- Zeitgrenze 120 s bei 119 s Laufzeit → „Absturz" gemeldet
- Suche nach „false" traf Mess-JSON statt Zusicherungen
- Erwartung „Zähler +1" bei einem Zähler, der verschachtelt summiert
- Linker Rand gemessen, während die Ansicht nach rechts gescrollt war

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
- **Ich melde nicht von selbst, wenn ein Dokument fehlt.** Diese Datei
  entstand, weil der Nutzer danach fragte — nicht, weil mir auffiel, dass
  die Lehren unauffindbar in 3289 Zeilen `decisions.md` lagen. Die
  Doku-Pflicht in `CLAUDE.md` verlangt, Entscheidungen festzuhalten; sie
  verlangt nicht, zu bemerken, dass eine **Sorte** von Wissen keinen Ort
  hat. `ende unfold` fragt seit heute danach (Schritt 9).
- **Neue Regeln wirken erst ab der nächsten Sitzung.** `CLAUDE.md` wird
  beim Start geladen; wer sie mitten in einer Sitzung ändert, hält sich
  aus Vorsatz daran, nicht durch Mechanik.
