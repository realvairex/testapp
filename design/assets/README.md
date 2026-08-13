# Bildmarken

## Das Logo

**Aktiv ist `logo.svg`.** Daneben liegen die Fassungen, aus denen es
stammt — der Nutzer hat sich zwischen ihnen **noch nicht entschieden**
(Stand 2026-08-13), deshalb bleiben beide erhalten.

| Datei | Was drin ist |
|---|---|
| `logo.svg` | **die aktive Fassung** — derzeit v2, eingefärbt mit der aktuellen Akzentfarbe |
| `logo-v1.svg` | v1, unverändert wie geliefert (`#ed6c4e`) — der Wimpel ohne Bogen |
| `logo-v2.svg` | v2, unverändert wie geliefert (`#ed6d2c`) — Wimpel **mit** Bogen darüber |

Die beiden nummerierten Dateien werden **nicht angefasst**. Sie sind das
Archiv: Wer sie nachbessert, kann später nicht mehr sagen, was der Nutzer
eigentlich geschickt hat.

### Auf eine andere Fassung umschalten

Es sind **zwei Stellen**, und das ist die eigentliche Fehlerquelle — eine
davon zu vergessen erzeugt eine App, die ein anderes Logo trägt als die
Datei daneben, und beide sehen für sich genommen richtig aus:

1. **`design/assets/logo.svg`** — Inhalt der gewünschten Fassung
   übernehmen und `fill` auf die aktuelle Akzentfarbe setzen (steht in
   `docs/spec.md` §3, derzeit `#ff6d1f`).
2. **`design/mockups/v1-desktop.html`, Funktion `svgLogo()`** — `viewBox`
   **und** alle `<path>` übernehmen. Dort steht `fill="currentColor"`
   statt einer festen Farbe, damit das Logo im Dunkelmodus die passende
   Akzentvariante annimmt. Das ist Absicht und darf nicht durch einen
   festen Wert ersetzt werden.

> **Warum `logo.svg` eine feste Farbe trägt, das Mockup aber nicht:** Eine
> einzeln geöffnete SVG-Datei erbt kein `color` und würde mit
> `currentColor` schwarz erscheinen. Innerhalb der App gibt es ein
> `color`, und nur so folgt das Logo dem Theme.

### Was beim Wechsel v1 → v2 aufgefallen ist

**Das Seitenverhältnis ändert sich.** v1 ist `214.8 × 152.49`, v2
`214.8 × 199.66` — v2 ist bei gleicher Höhe also **spürbar schmaler**.
Das Logo im Sidebar-Kopf ist über `.brand-logo { height: 21px }` an der
**Höhe** festgemacht, nicht an der Breite; der Bogen kommt oben dazu, und
der Wimpel darunter wird entsprechend kleiner. Wer zurück auf v1 wechselt,
sollte die 21 px noch einmal ansehen — die Zahl wurde für v1 gewählt.
