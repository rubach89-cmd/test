# Plantekalkulator med Handleliste

En norsk webapplikasjon for å beregne frø- og arealsbehov for hagebruk, med integrert handleliste-funksjonalitet.

## Funksjoner

- **Plantedatabase**: 50 norske planter med detaljert informasjon om avling, frøbehov og frosttålighet
- **Kalkulator**: Beregn nødvendig areal og frøbehov basert på ønsket avling
- **Handleliste**: Persistent handleliste (localStorage) for planlegging av hagesesongen
- **Eksport**: Eksporter handleliste til CSV eller PDF (klientsiden)
- **SVG-ikoner**: Forbedrede SVG-ikoner for alle planter med automatisk fallback
- **Responsive design**: Fungerer på mobil, nettbrett og desktop

## Installasjon og kjøring

### Forutsetninger
- Node.js (for lokal HTTP-server)
- Moderne nettleser (Chrome, Firefox, Safari, Edge)

### Slik kjører du lokalt:

1. Klon repositoriet:
```bash
git clone https://github.com/rubach89-cmd/test.git
cd test
```

2. Start en lokal HTTP-server:
```bash
npx http-server
```

3. Åpne nettleseren og gå til:
```
http://localhost:8080
```

**Viktig:** Applikasjonen må kjøres via HTTP(S) for at PDF-eksport skal fungere korrekt. Åpne ikke index.html direkte i nettleseren.

## Brukerveiledning

### Legge til planter i handlelisten

Det finnes tre måter å legge til planter:

1. **Fra plantekort**: Klikk "Legg til i handleliste" på et plantekort og skriv inn ønsket avling
2. **Fra modal**: Klikk "Se detaljer" på et plantekort, bruk kalkulatoren i modalen, og klikk "Legg til i handleliste"
3. **Fra global kalkulator**: Velg plante og ønsket avling i kalkulatoren øverst, klikk "Beregn", deretter "Legg til i handleliste"

### Administrere handlelisten

- **Redigere notater**: Klikk i "Notat"-feltet for å legge til egne notater for hver plante
- **Fjerne elementer**: Klikk "Fjern"-knappen på raden du vil slette
- **Tømme listen**: Klikk "Tøm liste" for å slette alle elementene (med bekreftelse)

### Eksportere handlelisten

#### CSV-eksport
1. Klikk "Eksporter CSV"
2. Filen lastes ned automatisk som `handleliste-YYYYMMDD.csv`
3. Åpne i Excel, Google Sheets eller lignende

#### PDF-eksport
1. Klikk "Eksporter PDF"
2. Filen genereres og lastes ned som `handleliste-YYYYMMDD.pdf`
3. PDF-en inneholder:
   - Sammendrag med totalt areal og totalt frøbehov
   - Komplett tabell med alle planter
   - Dato for generering

### Persistence
Handlelisten lagres automatisk i nettleserens localStorage. Listen vil forbli ved:
- Sideoppdatering
- Lukking og gjenåpning av nettleseren
- Navigering til andre sider og tilbake

For å tømme alt lagret data, klikk "Tøm liste" eller bruk nettleserens utviklerverktøy.

## Teknisk informasjon

### Arkitektur
- **Frontend-only**: Ingen backend-server nødvendig
- **Vanilla JavaScript**: Ingen avhengigheter utover html2pdf.js
- **Client-side eksport**: All eksport skjer i nettleseren

### Datastruktur

**crops.json**: Inneholder planteinformasjon
```json
{
  "id": 1,
  "common_name": "Tomat",
  "scientific_name": "Solanum lycopersicum",
  "yield_kg_per_m2": 5,
  "seed_rate": 0.003,
  "seed_unit": "kg",
  "frost_tolerance": "none",
  "min_zone": 3
}
```

**climate_zones.json**: Inneholder klimasoneinformasjon for Norge

### Ikoner
- 50 unike SVG-ikoner for planter i `assets/icons/`
- Filnavn følger slugified `common_name` (æ→ae, ø→o, å→a)
- Automatisk fallback til `generic.svg` ved manglende ikoner

### Avhengigheter
- **html2pdf.js**: Via CDN for PDF-generering
  - URL: https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js

## Testing

### Manuell testing

1. **Test handleliste**:
   - Legg til minst 3 planter fra forskjellige kilder
   - Verifiser at alle kolonner vises korrekt
   - Skriv inn notater og sjekk at de lagres
   - Oppdater siden og verifiser at listen er persistert

2. **Test CSV-eksport**:
   - Klikk "Eksporter CSV"
   - Åpne filen i et regneark
   - Verifiser at alle kolonner og data er korrekte
   - Sjekk at norske tegn (æ, ø, å) vises riktig

3. **Test PDF-eksport**:
   - Klikk "Eksporter PDF"
   - Åpne PDF-filen
   - Verifiser at sammendrag (totaler) stemmer
   - Sjekk at alle planter er med i tabellen

4. **Test responsive design**:
   - Åpne siden på desktop
   - Endre vindustørrelse til mobilstørrelse
   - Verifiser at alle elementer er tilgjengelige og lesbare

5. **Test ikoner**:
   - Sjekk at plantekort viser riktige ikoner
   - Verifiser at fallback-ikonet vises hvis et ikon mangler

## Feilsøking

### PDF-eksport fungerer ikke
- Sørg for at du kjører applikasjonen via HTTP(S), ikke `file://`
- Sjekk nettverksøy i nettleseren for å bekrefte at html2pdf.js lastes

### Handlelisten forsvinner
- Sjekk at localStorage er aktivert i nettleseren
- Private/inkognito-modus kan blokkere localStorage
- Nettleserens historikk/data-sletting vil fjerne listen

### Ikoner vises ikke
- Verifiser at `assets/icons/` mappen eksisterer
- Sjekk at SVG-filer er korrekt navngitt (slugified)
- Åpne nettverksøy for å se om filer lastes

## Lisens

Dette prosjektet er laget som en demonstrasjon og kan fritt brukes og modifiseres.

## Bidrag

Bidrag er velkomne! Åpne en issue eller send en pull request.

### Videre utvikling

Se [ANBEFALINGER.md](ANBEFALINGER.md) for detaljert oversikt over prioriterte forbedringer og implementeringsguider.

**Rask oversikt over foreslåtte forbedringer:**
- 🔍 Søk og filtreringsfunksjonalitet (Høy prioritet)
- 📊 Sortering av handleliste (Høy prioritet)
- ✏️ Redigering av handleliste-elementer (Høy prioritet)
- 📱 Forbedret mobilvisning (Høy prioritet)
- 📅 Plantesesongkalender (Middels prioritet)
- ⭐ Favoritter/merking av planter (Middels prioritet)
- 🌦️ Værogsoneintegrasjon (Lav prioritet)
- 🏪 Integrasjon med online plantebutikker (Lav prioritet)
