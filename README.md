# SeeRecht

Übungsprogramm für den theoretischen Prüfungsteil **Schifffahrtsrecht** des
Sportseeschifferscheins (SSS) und Sporthochseeschifferscheins (SHS). 48
Prüfungsfragen aus vier Themengebieten, Antwort frei formulieren, Bewertung
gegen ein Konzeptmodell, danach Abgleich mit der wörtlichen Musterlösung.

Schwestermodul zum SSS-Trainer Seemannschaft: gleiche Architektur, gleiche
Gestaltung, gleiche Bedienung.

---

## Veröffentlichen über GitHub Pages

1. Neues Repository anlegen und den Inhalt dieses Ordners hineinlegen.
2. Unter **Settings → Pages** als Quelle **GitHub Actions** wählen.
3. Auf `main` schieben. Der Ablauf unter `.github/workflows/pages.yml` baut die
   Fragendatei, bündelt die Auslieferungsdatei, prüft den Datenbestand, lässt
   die Tests laufen und veröffentlicht.

Ohne Actions: unter **Settings → Pages** Branch `main` und Ordner `/ (root)`
wählen. Die `.nojekyll` liegt bei, alle Pfade sind relativ.

Wichtig: `index.html` und `data/fragen.json` sind eingecheckt, weil sie erzeugt
werden. Nach einer Änderung an den Quellen `npm run build` laufen lassen und die
erzeugten Dateien mitschieben.

### Örtlich ausprobieren

Die `index.html` **doppelklicken**. Sie ist in sich geschlossen: Stylesheet,
Programm und alle 48 Fragen stecken darin, es wird nichts nachgeladen.

Einzige Einschränkung: über `file://` behandeln Browser den Ursprung als
undurchsichtig und sperren den dauerhaften Speicher. Die App läuft, der
Lernstand ist aber nur bis zum Schliessen des Reiters vorhanden. Wer ihn
behalten will, nutzt GitHub Pages oder startet örtlich einen Server:

```bash
python3 -m http.server 8080     # oder: npm start
```

---

## Aufbau

```
index.html                 ERZEUGT: fertige Anwendung in einer Datei
src/index.html             Gerüst mit sieben Ansichten
manifest.webmanifest
sw.js                      Offlinebetrieb
css/styles.css             Stylesheet des SSS-Trainers plus Ergänzungsblock
js/config.js               Schwellen, Modi, Mixverteilung, Konstanten
js/bewertung.js            Bewertungslogik, ohne DOM-Zugriff
js/speicher.js             Lernstand, Wiedervorlage, Aus- und Einlesen
js/app.js                  Ablauf und Oberfläche
data-src/*.json            Vier Quelldateien, eine je Themengebiet
data/fragen.json           ERZEUGT
tools/build.mjs            data-src -> data/fragen.json, errechnet `soll`
tools/bundle.mjs           src + css + js + data -> index.html
tools/validate.mjs         Prüft den Datenbestand
tools/icons.py             Erzeugt die Anwendungssymbole neu
tests/                     Bewertung, Oberfläche, Durchlauf
```

### Befehle

```bash
node tools/build.mjs        # data-src -> data/fragen.json
node tools/bundle.mjs       # alles -> index.html
node tools/validate.mjs     # Datenbestand prüfen
npm install --no-save jsdom # nur für den Durchlauftest nötig
node --test "tests/*.test.mjs"
npm run pruefen             # alles nacheinander
```

### Warum eine einzige Datei

Ein `<script type="module" src="…">` wird von jedem Browser blockiert, sobald
die Seite über `file://` geöffnet wird. Beim Öffnen aus einem ZIP heraus
entpacken Betriebssysteme zudem oft nur die angeklickte Datei. Beides führt zu
einer Seite ohne Gestaltung, deren Knöpfe nichts tun. Die Bündelung schliesst
beide Fälle aus; der Quelltext bleibt in Modulen aufgeteilt.

---

## Datenmodell

```json
{
  "id": "recht-06",
  "unterthema": "haftung",
  "quellnummer": "Frage 6",
  "titel": "Voraussetzungen eines Schadensersatzanspruchs",
  "sachverhalt": null,
  "sachverhaltRekonstruiert": false,
  "frage": "Welche rechtlichen Voraussetzungen …",
  "logik": "kumulativ",
  "mindestanzahl": null,
  "musterloesung": { "typ": "fliesstext", "bloecke": [{ "text": "…" }] },
  "konzepte": [
    { "id": "k1", "label": "Ein Schaden ist entstanden", "pflicht": true, "treffer": ["…"] }
  ],
  "dublettenGruppe": null,
  "anmerkung": null
}
```

- **`titel`** — die Überschrift aus der Vorlage. Beschriftet Ergebnisliste,
  Fortschrittsraster und Suchtreffer.
- **`sachverhalt`** — Fallschilderung, wird über der Frage angezeigt.
  `sachverhaltRekonstruiert` markiert sie sichtbar als erschlossen.
- **`logik`** — steuert die Punktvergabe, siehe unten.
- **`musterloesung`** — wörtlich aus der Vorlage, einschliesslich „ß". Wird
  angezeigt, nie bewertet.
- **`konzepte`** — die Sinneinheiten, die die Bewertung sucht.
- **`soll`** — wird beim Bauen errechnet: die Zahl der Wertungseinheiten, welche
  die eigene Musterlösung abdeckt.

### Fragen ergänzen

1. Passende Datei unter `data-src/` öffnen, Frage nach obigem Muster ergänzen.
   Die `id` muss im ganzen Bestand einmalig sein.
2. In `tools/validate.mjs` die erwartete Fragenzahl anpassen.
3. `npm run pruefen`

Der letzte Test prüft, ob jede Musterlösung ihre eigene Bewertung besteht. Er
ist der schnellste Weg, eine zu enge Trefferliste zu finden.

### Die fehlenden Themengebiete 7_3 bis 7_6

Die Nummerierung des Materialsatzes springt von 7_2 auf 7_7. Vier Dateien
fehlen. Zum Nachrüsten genügt eine weitere Datei `data-src/05-….json` nach
demselben Schema, ein Eintrag in `erwartet` in `tools/validate.mjs` und ein
Eintrag in `MIX_VERTEILUNG` in `js/config.js`.

---

## Bewertung

Die Antwort wird vereinheitlicht: Kleinschreibung, „ß" zu „ss", Umlautfaltung,
Satzzeichen zu Leerzeichen. Satzschlusszeichen bleiben als Grenzmarke erhalten,
damit eine Verneinung nicht in den nächsten Satz hineinwirkt.

Ein Suchwort ab sechs Zeichen greift auch in Zusammensetzungen (`schiffsführ`
findet „Schiffsführer" und „Schiffsführung"), ab fünf Zeichen am Wortanfang,
darunter nur genau. Bei Wortfolgen dürfen bis zu zwei beliebige Wörter
dazwischenstehen.

Quote = getroffene Wertungseinheiten / Soll, gedeckelt bei 0,6 falls ein
Kernpunkt fehlt und bei 0,5 falls ein Punkt gegenteilig beantwortet wurde,
minus 0,10 je genutztem Hinweis.

| Strenge | richtig ab | teilweise ab |
| ------- | ---------- | ------------ |
| mild    | 0,55       | 0,30         |
| normal  | 0,70       | 0,40         |
| streng  | 0,85       | 0,55         |

### Drei Besonderheiten des Rechtsteils

**Verbotskonzepte.** Der Umweltschutzteil besteht fast nur aus Verboten. Bei
`verbot: true` zählt der Treffer nur, wenn die Verneinung tatsächlich in der
Antwort steht. Wer den positiven Kern ohne Verneinung nennt („Bilgenwasser kann
man ins Gewässer pumpen"), bekommt nicht „fehlt", sondern **„gegenteilig
beantwortet"** — und die Antwort kann nicht mehr richtig werden. Ohne diese
Regel würde eine inhaltlich falsche Antwort als richtig durchgehen.

**Kumulative Fragen.** Bei `logik: "kumulativ"` müssen alle Voraussetzungen
vorliegen. Drei von vier Merkmalen eines Schadensersatzanspruchs sind kein
Teilerfolg, sondern ein falsches Ergebnis: ab zwei fehlenden Voraussetzungen
lautet das Urteil `falsch`.

**Alternativgruppen.** Bei `logik: "alternativ"` genügt einer von mehreren
Fällen. Konzepte mit derselben `alternativgruppe` bilden eine Wertungseinheit;
trifft eines, gilt die ganze Gruppe als erfüllt und zählt einmal.

### Selbstbewertung

Die Automatik erkennt Begriffe, keine Argumente. Rechtsfragen verlangen aber
Begründungen. Deshalb folgt nach jeder Frage eine dreistufige Selbstbewertung,
und **sie** bestimmt den Lernstand.

### Wiedervorlage

Fünf Stufen, Wiedervorlage nach 0, 1, 3, 7 und 21 Tagen. Richtig steigt eine
Stufe, teilweise hält, falsch setzt auf null zurück. Die Auswahl ist gewichtet:
zuletzt falsch beantwortete und noch nie gestellte Fragen kommen häufiger.

---

## Übungsarten

| Art          | Umfang                                                          |
| ------------ | --------------------------------------------------------------- |
| Themengebiet | alle Fragen eines Gebiets, wahlweise auf ein Unterthema begrenzt |
| Prüfungsmix  | 10 Fragen: 2 Recht allgemein, 3 SOLAS, 2 SUG, 3 Umweltschutz     |
| Wiederholung | fällige Fragen aus der Wiedervorlage                            |
| Markierte    | selbst vorgemerkte Fragen                                       |

Der Mix verteilt anteilig zur Grösse der Gebiete und nimmt höchstens eine Frage
je Dublettengruppe. Restplätze kommen aus dem Gebiet mit dem schwächsten Stand.

---

## Zur Datengrundlage

| Themengebiet | Datei | Fragen |
| ------------ | ----- | ------ |
| Schifffahrtsrecht allgemein | 7_1 | 9 |
| SOLAS, Schiffspapiere, Logbuch | 7_2 | 13 |
| SUG | 7_7 | 10 |
| Umweltschutz | 7_8 | 16 |

**Die Dateien 7_3 bis 7_6 fehlen im Materialsatz.** Es fehlen also vermutlich
vier weitere Themengebiete des Prüfungsteils.

Bei 7_8 stehen 14 Nummern, Position 3 enthält aber drei Teilfragen unter einem
gemeinsamen Sachverhalt — daher 16 statt 14 Fragen.

**Der Sachverhalt zum Fallbeispiel in 7_7 fehlt in der Vorlage.** Die Fragen 9
und 10 verweisen auf „dieses Ereignis", „Yacht A" und das „Sinken der Yacht B",
ohne dass der Fall geschildert wird. Er ist hier aus den Musterantworten
erschlossen, bewusst knapp gehalten und in der App als rekonstruiert
gekennzeichnet. Vor der Prüfung mit der vollständigen Unterlage abgleichen.

---

## Datenschutz

Kein Server, keine Zählpixel, keine Übertragung. Der Lernstand liegt allein im
`localStorage` dieses Browsers und lässt sich unter Einstellungen als Datei
ausgeben und auf einem anderen Gerät wieder einlesen.
