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

Voraussetzung ist Playwright mit Chromium. In der Session-Umgebung liegt
es global, deshalb der `NODE_PATH`-Vorspann. **Immer aus dem Repo-Wurzel-
verzeichnis starten** — die Skripte lösen den Pfad zum Mockup über
`process.cwd()` auf.

```bash
# ein einzelnes Skript
NODE_PATH="$(npm root -g)" node design/mockups/tests/test_align.js

# alle nacheinander
for f in design/mockups/tests/test_*.js; do
  echo "== $f"; NODE_PATH="$(npm root -g)" node "$f"
done
```

Die Skripte haben keine Zusicherungen im Sinne eines Test-Frameworks —
sie schreiben ihre Messwerte nach stdout. Zeilen mit `>>>` sind die
eigentlichen Aussagen (`true` = in Ordnung). Ein Skript, das ohne Fehler
durchläuft und nur `true` meldet, ist bestanden.

Screenshots landen in `out/` (nicht im Git).

## Was womit geprüft wird

| Bereich | Skripte |
|---|---|
| Spalten, Animation, Scrollbalken | `test_anim`, `test_anim2`, `test_height`, `test_scrollbar`, `test_4cols`, `test_1panel_scroll*`, `test_no_rebuild`, `test_reopen_after_close`, `test_shot` |
| Drag & Drop (auch der frühere Freeze) | `test_drag`, `test_drag2`, `test_pdrag`, `test_unified`, `test_sidebar_dnd`, `test_sidebar_weak`, `test_sidebar_fuzz`, `test_fuzz_all` |
| Editor / Blockmodell | `test_typing`, `test_typing2`, `test_typing3`, `test_3bugs`, `test_4bugs`, `test_gaps`, `test_gap0`, `test_caret`, `test_backspace`, `test_bs_exact`, `test_accum` |
| Formatierung, Fälligkeit | `test_fmt`, `test_fmt2`, `test_due`, `test_regression` |
| Ausrichtung, Icons, Kontrast | `test_align`, `test_measure`, `test_svg`, `test_contrast`, `test_addlist` |
| Belastung (lange Namen, viele Aufgaben) | `test_states`, `test_stress` |
| Geometrie von Icons und Knöpfen | `measure_center`, `measure_ref`, `verify_center`, `verify_icon` |

Die vier `measure_`/`verify_`-Skripte messen nach, ob ein Icon
tatsächlich mittig in seinem Knopf sitzt — das war ein hartnäckiger
Fehler, weil `getBBox()` ein Motiv als zentriert meldet, sobald ein
äußeres Element (der Deckel des Papierkorbs) die Ausmaße bestimmt. Wer
ein Icon neu zeichnet, prüft damit nach.

`test_fuzz_all.js` ist mit Absicht langsam (mehrere hundert
Drag-Kombinationen, mehrere Minuten Laufzeit) — es war das Werkzeug, mit
dem der App-Freeze eingekreist wurde. Nicht in einen Schnelldurchlauf
aufnehmen.

## Grenzen

Sie prüfen das **Mockup**, nicht das Produkt. Sobald der Flutter-Bau
beginnt, sind sie Referenzmaterial („so war es gemeint gemessen"), aber
kein Bestandteil der Test-Pipeline mehr — deren Zusicherungen gehören
dann in Dart-Tests gegen `docs/spec.md`.
