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
5. **`docs/lernkurve.md` fortschreiben — aber nur beim zweiten Mal.**
   Ist in dieser Sitzung ein Fehler aufgetreten, den es **schon einmal
   gab**, gehört er dort ins Muster (Zeile in der Tabelle, Zähler hoch).
   Einmal ist ein Vorfall und gehört nur nach `decisions.md`; **zweimal
   ist ein Muster**. Ebenso: Hat etwas messbar geholfen oder nachweislich
   nicht funktioniert, kommt es in die entsprechenden Abschnitte. Eine
   Schwäche, für die es noch kein Gegenmittel gibt, wird unter „Offene
   Schwächen" benannt statt verschwiegen.
6. **`docs/milestones.md` prüfen.** Wurde ein nennenswerter
   Zwischenstand erreicht, trag ihn mit Commit-Hash ein.
7. **`docs/session-log.md` fortschreiben.** Ein neuer Abschnitt ganz
   oben, überschrieben mit `## <Datum> — <kurzer Titel>`, mit den drei
   Blöcken **Gemacht**, **Entschieden**, **Offen**. Hier gehört auch
   hinein, was ein Commit nicht zeigt: verworfene Wege, Begründungen im
   Vorbeigehen, Vermutungen.
8. **`CLAUDE.md` prüfen.** Stimmen Status und Doku-Struktur noch? Die
   Datei bleibt schlank — Details gehören nach `docs/`.
9. **Offene Fäden benennen — und die Frage, auf die der Nutzer sonst
   selbst kommen muss:** Gab es in dieser Sitzung Wissen, das **nirgendwo
   hingehörte**? Nicht „ist es dokumentiert", sondern „hat diese *Sorte*
   Wissen überhaupt einen Ort". So entstand `docs/lernkurve.md` — die
   Lehren lagen längst da, nur unauffindbar in über 3000 Zeilen
   `decisions.md`, und aufgefallen ist es dem Nutzer, nicht mir. Fehlt ein
   Ort, sag es von dir aus.

   Alles Übrige, was in der Luft hängt — Alles, was in der Luft hängt — eine
   Frage, auf die du keine Antwort bekommen hast, ein Verdacht, dem du
   nicht nachgegangen bist, ein Fehler, den du bewusst stehen gelassen
   hast — gehört sichtbar nach `docs/status.md`. Nicht in deinen Kopf.
10. **Alles pushen**, dann **`bash scripts/session-check.sh` erneut
   ausführen**. Läuft es noch nicht sauber durch, ist die Session nicht
   fertig — dann die verbleibenden Punkte abarbeiten und erneut prüfen.
11. **Den Arbeitsstand nach `main` überführen.** Gepusht heißt nicht
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
12. **Passt das veröffentlichte Mockup zum Repo-Stand?** Wurde
    `design/mockups/v1-desktop.html` in dieser Sitzung geändert, muss es
    unter der **gespeicherten Artifact-URL** (`docs/status.md` §6) neu
    veröffentlicht sein — mit dem Parameter `url`, sonst entsteht eine
    zweite, leere Adresse.

    **Warum das hier steht:** Am 2026-08-07 wurde das Mockup nach der
    letzten Veröffentlichung noch zweimal geändert. Der Nutzer hätte beim
    Nachsehen den alten Stand vor sich gehabt und zu Recht geglaubt, es
    sei nichts passiert. Der Fehler ist geräuschlos — im Repo stimmt
    alles, nur das, was der Nutzer *ansieht*, ist veraltet.

    Mechanisch prüfbar ist das nicht (das Skript läuft ohne Netz), also
    ist es hier eine bewusste Frage: **Zuletzt veröffentlicht — vor oder
    nach der letzten Änderung am Mockup?** Im Zweifel neu veröffentlichen;
    es kostet nichts.

Melde dann in wenigen Zeilen: das Ergebnis des Prüflaufs, was committet
wurde, was in `docs/status.md` und `docs/session-log.md` neu steht, und
ob etwas offen bleiben musste.
