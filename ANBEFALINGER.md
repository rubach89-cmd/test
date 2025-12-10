# Anbefalinger for videre utvikling

Dette dokumentet inneholder prioriterte anbefalinger for videreutvikling av Plantekalkulator-applikasjonen.

## Høy prioritet (Rask verdi, lave kostnader)

### 1. Søk og filtreringsfunksjonalitet
**Beskrivelse:** Legg til søk- og filteringsmuligheter for plantene.

**Implementering:**
- Legg til søkefelt øverst i planteseksjonen
- Filtreringsalternativer: frosttålighet, minimum sone, avling per m²
- Real-time søk når bruker skriver

**Fordeler:**
- Forbedrer brukeropplevelsen betydelig med 50+ planter
- Gjør det enklere å finne spesifikke planter raskt
- Ingen nye avhengigheter nødvendig

**Estimert tid:** 2-3 timer

**Teknisk implementering:**
```javascript
// Eksempel: Filterfunksjon
function filterPlants(searchTerm, filters) {
    return cropsData.filter(plant => {
        const matchesSearch = plant.common_name.toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesFilters = /* filtreringslogikk */;
        return matchesSearch && matchesFilters;
    });
}
```

### 2. Sortering av handleliste
**Beskrivelse:** Mulighet til å sortere handlelisten etter forskjellige kolonner.

**Implementering:**
- Klikkbare kolonneoverskrifter
- Sorter etter: navn, ønsket kg, areal, frøbehov
- Vis sorteringsretning (↑/↓)
- Lagre sorteringsinnstilling i localStorage

**Fordeler:**
- Gjør store handlelister mer oversiktlige
- Enkel å implementere med eksisterende struktur
- Forbedrer brukeropplevelsen

**Estimert tid:** 2-3 timer

### 3. Redigering av handleliste-elementer
**Beskrivelse:** Mulighet til å endre ønsket kg direkte i handlelisten.

**Implementering:**
- Gjør "Ønsket kg" til redigerbart felt (input eller inline-edit)
- Automatisk omberegning av m² og frøbehov ved endring
- Lagre endringer i localStorage

**Fordeler:**
- Unngår at bruker må fjerne og legge til på nytt
- Mer intuitivt for brukeren
- Øker fleksibiliteten

**Estimert tid:** 1-2 timer

### 4. Forbedret mobilvisning
**Beskrivelse:** Optimalisere tabellvisning for mobile enheter.

**Implementering:**
- Responsive tabelldesign (kortvisning på mobil)
- Alternativt: Horisontal scrolling med sticky første kolonne
- Større berøringsområder for knapper på mobil

**Fordeler:**
- Bedre brukeropplevelse på mobile enheter
- Viktig siden mange planlegger hagen utendørs
- Moderne webstandarder

**Estimert tid:** 3-4 timer

## Middels prioritet (God verdi, moderate kostnader)

### 5. Plantesesongkalender
**Beskrivelse:** Legg til informasjon om når planter skal sås/plantes og høstes.

**Implementering:**
- Utvid crops.json med månedsdata: `sowing_months`, `planting_months`, `harvest_months`
- Vis sesonginfo i plantekort og modal
- Valgfri: Interaktiv kalendervisning

**Fordeler:**
- Stor verdi for brukere - kritisk planleggingsinfo
- Naturlig utvidelse av eksisterende data
- Øker appens nytteverdi betydelig

**Estimert tid:** 4-6 timer (datainnsamling + implementering)

**Datastruktur:**
```json
{
  "id": 1,
  "common_name": "Tomat",
  "sowing_months": [3, 4],
  "planting_months": [5, 6],
  "harvest_months": [7, 8, 9]
}
```

### 6. Favoritter/merking av planter
**Beskrivelse:** La brukere markere favorittplanter.

**Implementering:**
- Stjerne-ikon på plantekort
- Lagre favoritter i localStorage
- Filtreringsalternativ for å vise kun favoritter
- Egen favoritt-seksjon øverst

**Fordeler:**
- Personalisering
- Raskere tilgang til ofte brukte planter
- Enkel å implementere

**Estimert tid:** 2-3 timer

### 7. Flerårige planer / sesongplanlegging
**Beskrivelse:** Mulighet til å lagre flere planleggingsscenarier.

**Implementering:**
- Navngitte lister: "Vår 2026", "Høsthage", etc.
- Lagre flere lister i localStorage
- Dropdown for å bytte mellom lister
- Duplikere/kopiere lister

**Fordeler:**
- Profesjonell funksjonalitet
- Nyttig for seriøse hagedyrkere
- Øker appens verdi

**Estimert tid:** 5-7 timer

### 8. Print-vennlig visning
**Beskrivelse:** Egen print-stylesheet for utskrift av handleliste.

**Implementering:**
- CSS @media print queries
- Fjern unødvendige elementer ved print
- Optimalisert sideinndeling
- Inkluder dato og totaler

**Fordeler:**
- Mange ønsker papirutgave til hagen
- Enkelt å implementere med CSS
- Profesjonelt preg

**Estimert tid:** 1-2 timer

## Lav prioritet (Langsiktige forbedringer)

### 9. Værogsoneintegrasjon
**Beskrivelse:** Foreslå planter basert på brukers lokasjon.

**Implementering:**
- Be om brukers klimasone ved første besøk
- Fremhev anbefalte planter for sonen
- Valgfritt: API-integrasjon med YR.no for lokale værdata

**Fordeler:**
- Svært relevant for norske brukere
- Reduserer feilplanting
- Differensierer appen

**Estimert tid:** 6-10 timer

**Avhengigheter:** Kanskje API-tilgang (YR.no)

### 10. Dyrkingstips og veiledning
**Beskrivelse:** Legg til dyrkingsveiledning for hver plante.

**Implementering:**
- Utvid datamodellen med `growing_tips`, `spacing`, `companion_plants`
- Vis tips i modal/detaljvisning
- Valgfritt: Lenke til eksterne ressourcer

**Fordeler:**
- Gjør appen til en komplett dyrkingsguide
- Høy brukerverdi
- Krever mye innholdsarbeid

**Estimert tid:** 10-20 timer (avhengig av innholdsomfang)

### 11. Community-funksjoner
**Beskrivelse:** Del planer og erfaringer med andre brukere.

**Implementering:**
- Krever backend-server
- Brukerprofiler og autentisering
- Deling av handlelister
- Kommentarer og vurderinger

**Fordeler:**
- Bygger community
- Øker engasjement
- Gjør appen "sticky"

**Estimert tid:** 40-80 timer + infrastruktur

**Avhengigheter:** Backend (Node.js/Python), database, hosting

### 12. Integrasjon med nettbutikker
**Beskrivelse:** Lenke direkte til frøkjøp hos norske leverandører.

**Implementering:**
- Affiliate-avtaler med frøbutikker
- API-integrasjon eller dype lenker
- Prissammenligning

**Fordeler:**
- Inntektsmulighet
- Praktisk for brukere
- Komplisert juridisk/kommersiell side

**Estimert tid:** 20-40 timer + forhandlinger

**Avhengigheter:** Forretningsavtaler, API-tilgang

## Tekniske forbedringer

### 13. Testing
**Beskrivelse:** Legg til automatiserte tester.

**Implementering:**
- Jest eller Vitest for enhetstester
- Playwright eller Cypress for E2E-tester
- Test kritiske funksjoner: kalkulering, localStorage, eksport

**Fordeler:**
- Forhindrer regresjoner
- Tryggere refaktorering
- Profesjonell standard

**Estimert tid:** 10-15 timer

### 14. Byggesystem og moduler
**Beskrivelse:** Overgå til moderne JavaScript-moduler.

**Implementering:**
- Vite eller Webpack som byggesystem
- ES6-moduler
- Bundling og minifisering
- TypeScript (valgfritt)

**Fordeler:**
- Bedre kodestruktur
- Raskere lasting
- Enklere vedlikehold

**Estimert tid:** 8-12 timer

### 15. Progressive Web App (PWA)
**Beskrivelse:** Gjør appen installerbar og offline-tilgjengelig.

**Implementering:**
- Service Worker for caching
- Web App Manifest
- Offline-funksjonalitet

**Fordeler:**
- Fungerer uten internett
- Installerbar på hjemskjerm
- Moderne brukeropplevelse

**Estimert tid:** 6-10 timer

### 16. Tilgjengelighetsforbedringer (a11y)
**Beskrivelse:** Følge WCAG-standarder.

**Implementering:**
- Semantisk HTML
- ARIA-attributter
- Tastaturnavigasjon
- Skjermleser-støtte
- Kontrast og skriftstørrelse

**Fordeler:**
- Inkluderende
- Juridisk viktig i noen sammenhenger
- Bedre SEO

**Estimert tid:** 4-8 timer

## Anbefalt prioritering for neste sprint

**Sprint 1 (1-2 uker):**
1. Søk og filtreringsfunksjonalitet
2. Sortering av handleliste
3. Redigering av handleliste-elementer

**Sprint 2 (1-2 uker):**
4. Forbedret mobilvisning
5. Plantesesongkalender (data + UI)
6. Print-vennlig visning

**Sprint 3 (2-3 uker):**
7. Favoritter/merking
8. Flerårige planer
9. Testing (grunnleggende)

**Langsiktig (2-6 måneder):**
- Værogsoneintegrasjon
- Dyrkingstips
- PWA-funksjonalitet
- Community-funksjoner (hvis ønskelig)

## Konklusjon

De mest verdifulle forbedringene å starte med er:
1. **Søk og filtrering** - høyest verdi for innsats
2. **Sortering av handleliste** - rask forbedring
3. **Plantesesongkalender** - stor brukerverdi

Disse tre vil betydelig forbedre brukeropplevelsen uten å kreve store tekniske endringer eller eksterne avhengigheter.
