# Prüfskripte zum Mockup

Diese Skripte steuern `../v1-desktop.html` in einem echten (headless)
Chromium und messen nach, was auf dem Bildschirm tatsächlich passiert —
Positionen, Farbkontraste, Editor-Struktur, Animationsverläufe. Sie sind
im Lauf der Mockup-Arbeit entstanden, jedes gehört zu einem konkreten
gemeldeten Fehler oder einer Design-Festlegung.

**Warum sie im Repo liegen:** Sie sind der einzige Weg, eine Änderung am
Mockup gegenzuprüfen, ohne alles von Hand durchzuklicken. Ohne sie müsste
jede spätere Session dieselben Messungen neu erfinden.

## Ausführen

**Der übliche Weg — ein Befehl, mit Urteil:**

```bash
bash scripts/run-mockup-tests.sh          # alle
bash scripts/run-mockup-tests.sh fmt      # nur Skripte, deren Name "fmt" enthält
```

Er startet nur `test_*`, `measure_*` und `verify_*` — Hilfsskripte wie
`shot_aufraeumen.js` (macht Screenshots, prüft nichts) dürfen deshalb im
selben Verzeichnis liegen, ohne sich als „Absturz" zu melden.

Der Läufer entscheidet pro Skript selbst: Rückgabewert ≠ 0 → `[FEHLER]`,
eine `>>>`-Zeile endet auf `false` → `[ROT]`, sonst `[ok]`. Vollständige
Ausgaben landen in `out/` (nicht im Git). Zeitgrenze pro Skript: 600 s,
über `MOCKUP_TEST_TIMEOUT` einstellbar — die Fuzz-Skripte brauchen
mehrere Minuten.

**Getestete Version: Playwright 1.56.1.** Sie ist in der `package.json`
im Wurzelverzeichnis exakt festgenagelt, mit Lockfile. Die Skripte laufen
gegen die **global** installierte Playwright-Installation (deshalb der
`NODE_PATH`-Vorspann); die Deklaration hält fest, gegen welche Version
zuletzt gemessen wurde. Das ist keine Förmlichkeit: Diese Skripte messen
gerenderte Pixel und Farbkontraste, und eine andere Chromium-Version
rendert minimal anders. Ohne die Versionsangabe wäre bei einem roten Lauf
nicht unterscheidbar, ob das Mockup kaputt ist oder nur der Browser sich
geändert hat.

**Einzeln aufrufen** geht weiter. **Immer aus dem Repo-Wurzelverzeichnis
starten** — die Skripte lösen den Pfad zum Mockup über `process.cwd()`
auf.

```bash
NODE_PATH="$(npm root -g)" node design/mockups/tests/test_align.js
```

## Was die Skripte aussagen — und was nicht

Nur **achtzehn** der 56 Skripte haben echte Zusicherungen (`>>>`-Zeilen,
`true` = in Ordnung): `test_4bugs`, `test_accum`, `test_aufraeumen`,
`test_due_row`, `test_eingang`, `test_fortschritt`, `test_gaps`, `test_group_add_hover`, `test_kein_flackern`,
`test_list_header`, `test_loeschen`, `test_stimmigkeit`, `test_theme_switch`, `test_typing`,
`test_typing2`, `test_typing3`, `test_unteraufgabe`, `test_window_min`. Alle übrigen sind
**Messskripte**: Sie
drucken Zahlen, die ein Mensch beurteilen muss. Ein grüner Lauf heißt bei
ihnen nur „ohne Absturz durchgelaufen", nicht „Werte sind richtig".

Das gilt ausdrücklich auch für `test_contrast`: Die Aussage „erfüllt WCAG
AA in beiden Themes" wurde einmal von Hand abgelesen und ist **nicht**
automatisch nachprüfbar.

**`test_4bugs` ist ein bekannter Wackelkandidat** — etwa jeder zweite
Lauf ist rot, weil beim Tippen in eine eingeklappte Füllzeile die ersten
Zeichen verlorengehen. **Nicht reparieren:** Der Fehler verschwindet beim
Flutter-Umstieg ersatzlos. Begründung in `docs/decisions.md`, 2026-08-07.

Screenshots landen ebenfalls in `out/` (nicht im Git).

## Was womit geprüft wird

| Bereich | Skripte |
|---|---|
| Spalten, Animation, Scrollbalken | `test_anim`, `test_anim2`, `test_height`, `test_scrollbar`, `test_4cols`, `test_1panel_scroll*`, `test_no_rebuild`, `test_reopen_after_close`, `test_shot` |
| Drag & Drop (auch der frühere Freeze) | `test_drag`, `test_drag2`, `test_pdrag`, `test_unified`, `test_sidebar_dnd`, `test_sidebar_weak`, `test_sidebar_fuzz`, `test_fuzz_all` |
| Aufgabe in Aufgabe ziehen (Unteraufgabe), inkl. Kreisfall | `test_unteraufgabe` |
| **Stimmigkeit der ganzen Oberfläche** (Skalen für Schrift, Dauer, Kurve, Radius; Marke) | `test_stimmigkeit` |
| Editor / Blockmodell | `test_typing`, `test_typing2`, `test_typing3`, `test_3bugs`, `test_4bugs`, `test_gaps`, `test_gap0`, `test_caret`, `test_backspace`, `test_bs_exact`, `test_accum` |
| Formatierung, Fälligkeit | `test_fmt`, `test_fmt2`, `test_due`, `test_regression` |
| Ausrichtung, Icons, Kontrast | `test_align`, `test_measure`, `test_svg`, `test_contrast`, `test_addlist` |
| Hover-Gewichtung in der Sidebar | `test_group_add_hover` |
| Darstellungs-Schalter (Gleiten, Kontrast) | `test_theme_switch` |
| Spaltenkopf: Umbenennen, Farbe | `test_list_header` |
| Fälligkeitszeile und Kalender, auch im engsten Fall | `test_due_row` |
| Schmales Fenster: Mindestbreite und Abstand | `test_window_min` |
| Eingang als Ort, Einsortieren per Ziehen | `test_eingang` |
| Löschregeln: Rückgängig, Rückfrage, Spalten | `test_loeschen` |
| Aufräum-Modus: Entscheidungen **und** Belohnungsschicht | `test_aufraeumen` |
| Fortschrittsbalken an der Aufgabenzeile | `test_fortschritt` |
| Kein Aufblitzen bei gewöhnlichen Aktionen | `test_kein_flackern` |
| Belastung (lange Namen, viele Aufgaben) | `test_states`, `test_stress` |
| Geometrie von Icons und Knöpfen | `measure_center`, `measure_ref`, `verify_center`, `verify_icon` |

Die vier `measure_`/`verify_`-Skripte messen nach, ob ein Icon
tatsächlich mittig in seinem Knopf sitzt — das war ein hartnäckiger
Fehler, weil `getBBox()` ein Motiv als zentriert meldet, sobald ein
äußeres Element (der Deckel des Papierkorbs) die Ausmaße bestimmt. Wer
ein Icon neu zeichnet, prüft damit nach.

**`test_aufraeumen.js` prüft die Bewegungen mit, nicht nur die Wirkung.**
Das ist Absicht und kein übereifriger Test: Der Aufräum-Modus kann nichts,
was das Einsortieren per Ziehen nicht auch könnte — sein einziger Vorteil
ist, dass man ihn gern öffnet (`docs/spec.md` §2.8). Fällt eine der
Bewegungen aus, ist der Modus kaputt, auch wenn die Daten stimmen.
Wer hier einen roten Punkt sieht, hat also **keinen** Kosmetikfehler vor
sich.

`test_fuzz_all.js` ist mit Absicht langsam (mehrere hundert
Drag-Kombinationen, mehrere Minuten Laufzeit) — es war das Werkzeug, mit
dem der App-Freeze eingekreist wurde. Nicht in einen Schnelldurchlauf
aufnehmen.

## Grenzen

Sie prüfen das **Mockup**, nicht das Produkt. Sobald der Flutter-Bau
beginnt, sind sie Referenzmaterial („so war es gemeint gemessen"), aber
kein Bestandteil der Test-Pipeline mehr — deren Zusicherungen gehören
dann in Dart-Tests gegen `docs/spec.md`.

## `test_stimmigkeit.js` — warum es das gibt

Es beantwortet eine Frage, die schon einmal **von Hand** beantwortet
wurde: „Ist die Oberfläche stimmig?" Das Ergebnis von damals — 12
Schriftgrößen, 8 Radien, 13 Übergangsdauern — steht in `docs/spec.md` §3
als Begründung für die Skalen. Nur war die Antwort nach der nächsten
Änderung wieder wertlos.

Geprüft wird an den **gerenderten** Elementen, nicht an den CSS-Tokens.
Der Unterschied ist nicht theoretisch: Ein `<button>` ohne eigene
`font-size` erbt 13,33px vom Browser, und die steht in keiner Skala.

**Was es beim ersten Lauf fand (2026-08-13):** eine dreizehnte
Übergangsdauer (250 ms am `body`), eine **vierte** Bewegungskurve am
Kästchen (`cubic-bezier(0.34, 1.56, 0.64, 1)` — nirgends dokumentiert)
und neun Bewegungen auf der Browser-Vorgabe statt auf der Hauskurve. Alle
drei repariert.

**Bewusst nur gezählt, nicht zugesichert:** Farb- und
Deckkraft-Übergänge auf der Browser-Kurve (derzeit 119). Auf einer 120 ms
langen Farbblende sieht niemand, welche Kurve läuft; an einer Bewegung
sieht man es sofort. Die Zahl steht trotzdem im Protokoll — driftet sie
stark, ist das ein Signal.
