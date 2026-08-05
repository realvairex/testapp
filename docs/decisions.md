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
