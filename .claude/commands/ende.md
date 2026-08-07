---
description: Session sauber abschließen - alles Wissenswerte ins Repo schreiben, damit nichts verloren geht
---

Diese Session wird gleich beendet$ARGUMENTS. Der Session-Container ist
temporär: **alles, was nur im Chat steht, ist danach weg.** Deine
Aufgabe ist, den Chat so ins Repo zu überführen, dass die nächste
Session ohne ihn auskommt.

**Führe zuerst `bash scripts/session-check.sh` aus.** Das Skript prüft
mechanisch nach, was noch offen ist, und ist der Maßstab: Am Ende muss es
ohne einen einzigen `[OFFEN]`-Punkt durchlaufen. Jeden `[pruefen]`-Punkt
schaust du dir an und entscheidest bewusst, ob er erledigt werden muss.

Arbeite dann das Folgende der Reihe nach ab:

1. **Unfertiges sichern.** `git status` prüfen. Alles Sinnvolle
   committen und pushen. Halbfertiges lieber committen und im
   Commit-Text als unfertig kennzeichnen, als es zu verlieren.
2. **Temporäre Dateien retten.** Prüfe, ob im Scratchpad-Verzeichnis
   Dinge liegen, die Bestand haben sollten — Prüfskripte, Messwerte,
   Hilfsprogramme. Alles Wiederverwendbare gehört ins Repo, alles
   Wegwerfbare bleibt liegen.
3. **`docs/status.md` aktualisieren.** Das ist der wichtigste Schritt.
   Neuer Stand, neuer nächster Schritt, und vor allem: neue
   Festlegungen des Nutzers und neu abgelehnte Vorschläge in die
   entsprechenden Abschnitte eintragen, damit die nächste Session sie
   nicht noch einmal vorschlägt.
4. **`docs/decisions.md` nachziehen.** Jede in dieser Session getroffene
   Entscheidung mit Kontext, abgewogenen Optionen und Begründung — nicht
   nur dem Ergebnis.
5. **`docs/milestones.md` prüfen.** Wurde ein nennenswerter
   Zwischenstand erreicht, trag ihn mit Commit-Hash ein.
6. **`docs/session-log.md` fortschreiben.** Ein neuer Abschnitt ganz
   oben, überschrieben mit `## <Datum> — <kurzer Titel>`, mit den drei
   Blöcken **Gemacht**, **Entschieden**, **Offen**. Hier gehört auch
   hinein, was ein Commit nicht zeigt: verworfene Wege, Begründungen im
   Vorbeigehen, Vermutungen.
7. **`CLAUDE.md` prüfen.** Stimmen Status und Doku-Struktur noch? Die
   Datei bleibt schlank — Details gehören nach `docs/`.
8. **Offene Fäden benennen.** Alles, was in der Luft hängt — eine
   Frage, auf die du keine Antwort bekommen hast, ein Verdacht, dem du
   nicht nachgegangen bist, ein Fehler, den du bewusst stehen gelassen
   hast — gehört sichtbar nach `docs/status.md`. Nicht in deinen Kopf.
9. **Alles pushen**, dann **`bash scripts/session-check.sh` erneut
   ausführen**. Läuft es noch nicht sauber durch, ist die Session nicht
   fertig — dann die verbleibenden Punkte abarbeiten und erneut prüfen.
10. **Den Arbeitsstand nach `main` überführen.** Gepusht heißt nicht
    angekommen: Arbeitest du auf einem Nebenbranch (jede Web-Sitzung tut
    das, `claude/…`), liegt der Stand danach zwar auf GitHub, aber
    **nicht** dort, wo die nächste Sitzung ihn sucht. Genau so hing das
    Projekt monatelang an `claude/todo-app-brainstorm-fmv1sd`, während
    `main` ein leeres README war — und jede Prüfung war dabei grün.

    **Ein sauberer Fast-Forward wird ausgeführt, nicht angekündigt.** Der
    Nutzer ruft `ende unfold` bewusst auf, damit etwas passiert — eine
    Frage, die unbeantwortet bleibt, weil er den Chat schon verlassen
    hat, hilft ihm nicht. Genau so entstand die Drift beim letzten Mal.

    ```bash
    git fetch origin

    # Fall 1: schon drin - nichts zu tun.
    git merge-base --is-ancestor HEAD origin/main && echo "in main enthalten"

    # Fall 2: main ist Vorfahr von HEAD -> Fast-Forward, ausfuehren.
    git merge-base --is-ancestor origin/main HEAD \
      && git push origin HEAD:main
    ```

    **Nur diese beiden Fälle laufen von selbst.** Trifft *keiner* zu, ist
    `main` auseinandergelaufen (hat eigene Commits bekommen). Dann wird
    **nichts** gepusht: Lage schildern, Optionen nennen (Merge, Rebase,
    Pull Request), den Nutzer entscheiden lassen. Niemals `--force`,
    niemals `main` überschreiben — ein Fast-Forward kann nichts
    verlieren, alles andere schon.

    Melde anschließend in einer Zeile, was passiert ist: „`main` per
    Fast-Forward auf `<hash>` gezogen" oder „`main` war schon aktuell"
    oder „nicht möglich, weil …".

Melde dann in wenigen Zeilen: das Ergebnis des Prüflaufs, was committet
wurde, was in `docs/status.md` und `docs/session-log.md` neu steht, und
ob etwas offen bleiben musste.
