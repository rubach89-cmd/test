# 🌱 Dyrkingsplanlegger - Norsk Hage

En web-basert dyrkingsplanlegger for å planlegge hageprosjekter basert på norske vekstforhold. Applikasjonen inkluderer en interaktiv plantekatalog, avlingskalkulator, og handleliste med eksport til CSV og PDF.

## Funksjoner

- **Plantekatalog**: Bla gjennom 50 norske hage- og grønnsaksplanter med detaljert informasjon
- **Avlingskalkulator**: Beregn nødvendig areal og frø/settepoteter basert på ønsket avling
- **Handleliste**: Lagre planlagte planter i en persistent handleliste (localStorage)
- **Eksport**: Eksporter handlelisten til CSV eller PDF format
- **Søk og filter**: Finn raskt planter ved å søke på navn
- **Responsivt design**: Fungerer på desktop, tablet og mobil

## Kom i gang

### Forutsetninger

- En moderne nettleser (Chrome, Firefox, Safari, Edge)
- Node.js installert (for lokal HTTP server)

### Installasjon og kjøring

1. Klon eller last ned repositoryet:
```bash
git clone https://github.com/rubach89-cmd/test.git
cd test
```

2. Start en lokal HTTP server:
```bash
npx http-server
```

Alternativt, bruk VS Code Live Server extension eller Python:
```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

3. Åpne nettleseren og gå til `http://localhost:8080` (eller den porten serveren viser)

**Viktig**: Applikasjonen må kjøres over HTTP(S) for at PDF-eksport skal fungere. Å åpne `index.html` direkte fra filsystemet vil ikke fungere korrekt.

## Bruk av handleliste

### Legge til planter i handlelisten

Det er tre måter å legge til planter i handlelisten:

1. **Fra plantekort**: Klikk på "Legg til i handleliste" på et plantekort i katalogen
2. **Fra plantemodal**: Åpne en plante, bruk kalkulatoren i modalen, og klikk "Legg til i handleliste"
3. **Fra global kalkulator**: Bruk hovedkalkulatoren øverst på siden og klikk "Legg til i handleliste"

Når du legger til en plante, angir du ønsket avling i kg. Applikasjonen beregner automatisk:
- Nødvendig areal (m²)
- Mengde frø eller settepoteter
- Enhet (kg eller sett)

### Redigere handlelisten

- **Legg til notat**: Skriv inn i notat-feltet for hver plante
- **Fjern element**: Klikk "Fjern"-knappen for å slette en plante fra listen
- **Tøm liste**: Klikk "Tøm liste" for å fjerne alle planter (krever bekreftelse)

### Eksportere handlelisten

#### CSV-eksport
1. Klikk på "Eksporter CSV"-knappen
2. En CSV-fil med navnet `handleliste-YYYYMMDD.csv` lastes ned automatisk
3. Filen inneholder kolonner: Plante, Ønsket_kg, m2, Frø_sett, Frø_enhet, Notat

#### PDF-eksport
1. Klikk på "Eksporter PDF"-knappen
2. En PDF-fil med navnet `handleliste-YYYYMMDD.pdf` genereres og lastes ned
3. PDF-en inneholder:
   - Handleliste-tabell med alle planter
   - Totaler (totalt areal i m² og totalt frøbehov i kg)
   - Generert dato

**Merk**: PDF-eksport krever at siden kjøres over HTTP(S). Hvis du får en feilmelding, sørg for at du bruker en lokal server (ikke file://).

## Datapersistens

Handlelisten lagres automatisk i nettleserens localStorage. Dette betyr at:
- Listen beholdes selv om du lukker nettleseren
- Listen er spesifikk for din nettleser på denne enheten
- Listen slettes hvis du tømmer nettleserens cache/localStorage

## Teknologi

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Eksport**: 
  - CSV: Blob API og URL.createObjectURL
  - PDF: html2pdf.js (via CDN)
- **Datahåndtering**: localStorage API
- **Ikoner**: SVG (50 planteikoner + generisk fallback)

## Prosjektstruktur

```
.
├── index.html          # Hovedside
├── styles.css          # Styling
├── app.js              # Applikasjonslogikk
├── data/
│   └── crops.json      # Plantedata (50 planter)
├── assets/
│   └── icons/          # SVG-ikoner (51 filer)
└── README.md           # Denne filen
```

## Plantedata

Applikasjonen inkluderer 50 norske planter:
- Grønnsaker (tomat, agurk, paprika, gulrot, potet, etc.)
- Kålvekster (kål, brokkoli, blomkål, grønnkål, etc.)
- Rotgrønnsaker (gulrot, rødbet, pastinakk, etc.)
- Bønner og belgvekster
- Urter (basilikum, persille, dill, rosmarin, etc.)
- Bær (jordbær, bringebær, solbær)

Hver plante har:
- Norsk og vitenskapelig navn
- Avling per m²
- Frø/sett-behov per m²
- Planteavstand
- Plantingstidspunkt (dager etter siste frost)
- Beskrivelse

## Feilhåndtering

Applikasjonen har robuste feilhåndteringer for:
- Manglende plantedata
- Manglende frø/avlingsdata (vises som "—")
- Ugyldig input (validering av tall)
- Feilvarsler for eksportfunksjoner

## Bidrag

Dette er et eksempelprosjekt. Bidrag er velkommen via pull requests.

## Lisens

Dette prosjektet er åpen kildekode og tilgjengelig under MIT-lisensen.

## Forfattere

Utviklet for norske hagegærninger 🌿🇳🇴
