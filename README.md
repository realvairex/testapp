# Unfold

Eine Todo-App, die sich wie ein Dokument anfühlt: Aufgaben und Fließtext
stehen auf derselben Seite, Aufgaben lassen sich unbegrenzt tief
verschachteln, und jede Aufgabe hat selbst wieder eine Seite. Local-first
— die Daten liegen auf dem Gerät, nicht auf einem Server.

**Stand:** Konzept und Spezifikation stehen, das Desktop-Mockup ist fertig
iteriert und durchgemessen. **App-Code existiert noch nicht** — der
entsteht als Nächstes in Flutter.

## Wo anfangen

| Ich will … | Datei |
|---|---|
| wissen, wo das Projekt gerade steht | **[`docs/status.md`](docs/status.md)** ← hier anfangen |
| die App bauen | [`docs/spec.md`](docs/spec.md) — Datenmodell, Verhalten, Design-Tokens |
| verstehen, *warum* etwas so ist | [`docs/decisions.md`](docs/decisions.md) |
| die Produktidee nachlesen | [`docs/concept.md`](docs/concept.md) |
| das Mockup ansehen | `design/mockups/v1-desktop.html` im Browser öffnen |

`docs/spec.md` ist die Wahrheit für die Umsetzung, nicht das Mockup. Bei
Widersprüchen gilt die Spec.

## Arbeitsweise

Der gesamte Projektstand liegt im Repo, nicht in irgendeinem Chatverlauf.
Entscheidungen werden mit Begründung protokolliert, Meilensteine mit
Commit-Hash festgehalten. Die Konventionen stehen in
[`CLAUDE.md`](CLAUDE.md).

Zwei Textbefehle rahmen jede Arbeitssitzung ein — **keine Slash-Befehle**,
sondern normale Nachrichten:

- **`start unfold`** lädt den Projektkontext und holt den aktuellen Stand
  von GitHub.
- **`ende unfold`** überführt alles Wissenswerte ins Repo und überführt den
  Arbeitsstand nach `main`.

## Prüfskripte

Das Mockup wird von Playwright-Skripten in einem echten Chromium
nachgemessen — Geometrie, Farbkontraste, Editor-Verhalten:

```bash
bash scripts/run-mockup-tests.sh        # alle
bash scripts/run-mockup-tests.sh fmt    # nur passende
bash scripts/session-check.sh           # Abschlussprüfung der Sitzung
```

Details: [`design/mockups/tests/README.md`](design/mockups/tests/README.md).

## Tech-Stack

**Flutter** (Dart) für Desktop, Mobile und Web aus einer Codebasis, mit
[`super_editor`](https://github.com/superlistapp/super_editor) als
Editor-Fundament. Begründung und Ausstiegsweg: `docs/decisions.md`.
