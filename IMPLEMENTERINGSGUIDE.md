# Implementeringsguide - Søk og filtrering

Denne guiden viser hvordan du implementerer søk- og filtreringsfunksjonalitet for planter.

## Steg 1: Legg til HTML-elementer

I `index.html`, legg til søk- og filtreringskontrollen før `<div id="plants-grid">`:

```html
<!-- Plants Grid Section -->
<section id="plants-section">
    <h2>Planter</h2>
    
    <!-- Søk og filtrering -->
    <div class="search-filter-container">
        <div class="search-box">
            <input type="text" id="plant-search" placeholder="Søk etter planter...">
        </div>
        <div class="filter-controls">
            <select id="filter-frost">
                <option value="">Alle frosttåligheter</option>
                <option value="none">Ingen</option>
                <option value="light">Lett</option>
                <option value="moderate">Moderat</option>
                <option value="high">Høy</option>
            </select>
            
            <select id="filter-zone">
                <option value="">Alle soner</option>
                <option value="1">Sone 1+</option>
                <option value="2">Sone 2+</option>
                <option value="3">Sone 3+</option>
                <option value="4">Sone 4+</option>
                <option value="5">Sone 5+</option>
            </select>
            
            <button id="reset-filters" class="btn-secondary btn-small">Nullstill</button>
        </div>
    </div>
    
    <div id="plants-grid" class="plants-grid">
        <!-- Plant cards will be added dynamically -->
    </div>
    <p id="no-results-message" style="display: none; text-align: center; padding: 20px; color: #666;">
        Ingen planter matcher søket. Prøv andre søkekriterier.
    </p>
</section>
```

## Steg 2: Legg til CSS-styling

I `styles.css`, legg til:

```css
/* Søk og filtrering */
.search-filter-container {
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.search-box {
    width: 100%;
}

.search-box input {
    width: 100%;
    padding: 12px 15px;
    font-size: 16px;
    border: 2px solid #ddd;
    border-radius: 8px;
    transition: border-color 0.3s;
}

.search-box input:focus {
    outline: none;
    border-color: #4CAF50;
}

.filter-controls {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.filter-controls select {
    flex: 1;
    min-width: 150px;
    padding: 10px;
    font-size: 14px;
    border: 2px solid #ddd;
    border-radius: 8px;
    background-color: white;
}

.filter-controls select:focus {
    outline: none;
    border-color: #4CAF50;
}

@media (max-width: 768px) {
    .filter-controls {
        flex-direction: column;
    }
    
    .filter-controls select {
        width: 100%;
    }
}
```

## Steg 3: Implementer JavaScript-logikk

I `app.js`, legg til følgende funksjoner:

```javascript
// Globale variabler for filtrering
let searchTerm = '';
let filterFrost = '';
let filterZone = '';

// Oppdater initializeEventListeners() med nye lyttere
function initializeEventListeners() {
    // ... eksisterende event listeners ...
    
    // Søk og filtrering
    document.getElementById('plant-search').addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        filterAndRenderPlants();
    });
    
    document.getElementById('filter-frost').addEventListener('change', (e) => {
        filterFrost = e.target.value;
        filterAndRenderPlants();
    });
    
    document.getElementById('filter-zone').addEventListener('change', (e) => {
        filterZone = e.target.value;
        filterAndRenderPlants();
    });
    
    document.getElementById('reset-filters').addEventListener('click', () => {
        resetFilters();
    });
}

// Filtrer og renderer planter
function filterAndRenderPlants() {
    const filtered = filterPlants();
    renderFilteredPlants(filtered);
}

// Filtrer planter basert på søk og filtre
function filterPlants() {
    return cropsData.filter(plant => {
        // Søk i navn
        const matchesSearch = plant.common_name.toLowerCase().includes(searchTerm) ||
                            plant.scientific_name.toLowerCase().includes(searchTerm);
        
        // Filtrer frosttålighet
        const matchesFrost = !filterFrost || plant.frost_tolerance === filterFrost;
        
        // Filtrer sone (vis planter som kan vokse i valgt sone eller lavere)
        const matchesZone = !filterZone || plant.min_zone <= parseInt(filterZone);
        
        return matchesSearch && matchesFrost && matchesZone;
    });
}

// Render filtrerte planter
function renderFilteredPlants(plants) {
    const grid = document.getElementById('plants-grid');
    const noResultsMsg = document.getElementById('no-results-message');
    
    grid.innerHTML = '';
    
    if (plants.length === 0) {
        grid.style.display = 'none';
        noResultsMsg.style.display = 'block';
        return;
    }
    
    grid.style.display = 'grid';
    noResultsMsg.style.display = 'none';
    
    plants.forEach(plant => {
        const card = createPlantCard(plant);
        grid.appendChild(card);
    });
}

// Nullstill filtre
function resetFilters() {
    searchTerm = '';
    filterFrost = '';
    filterZone = '';
    
    document.getElementById('plant-search').value = '';
    document.getElementById('filter-frost').value = '';
    document.getElementById('filter-zone').value = '';
    
    renderPlants();
}

// Oppdater renderPlants() funksjonen
function renderPlants() {
    renderFilteredPlants(cropsData);
}
```

## Steg 4: Testing

Test følgende scenarioer:

1. **Søk:**
   - Søk etter "tomat" - skal vise tomat-relaterte planter
   - Søk etter "solanum" - skal vise planter med vitenskapelig navn som inneholder "solanum"
   - Søk etter noe som ikke finnes - skal vise "ingen resultater"

2. **Filtrering:**
   - Velg "Ingen" i frosttålighet - skal vise kun frostsensitive planter
   - Velg "Sone 3+" - skal vise kun planter som vokser i sone 3 eller lavere
   - Kombiner filtre - skal vise planter som matcher alle valgte kriterier

3. **Kombinert:**
   - Søk + filter samtidig - skal fungere sammen
   - Nullstill-knappen - skal fjerne alle filtre og vise alle planter igjen

4. **Responsivt:**
   - Test på mobil - kontroller at filtre er brukervennlige
   - Test at søkefeltet er stort nok til å være lett å bruke på touch-skjermer

## Steg 5: Forbedringer (valgfritt)

### Debounce på søk
For å unngå for mange renderinger mens bruker skriver:

```javascript
let searchTimeout;

document.getElementById('plant-search').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        searchTerm = e.target.value.toLowerCase();
        filterAndRenderPlants();
    }, 300);
});
```

### Vis antall resultater
```javascript
function renderFilteredPlants(plants) {
    // ... eksisterende kode ...
    
    // Vis antall
    const countElement = document.getElementById('result-count');
    if (countElement) {
        countElement.textContent = `Viser ${plants.length} av ${cropsData.length} planter`;
    }
}
```

### Lagre filtre i localStorage
```javascript
function saveFilters() {
    localStorage.setItem('plantFilters', JSON.stringify({
        searchTerm,
        filterFrost,
        filterZone
    }));
}

function loadFilters() {
    const saved = localStorage.getItem('plantFilters');
    if (saved) {
        const filters = JSON.parse(saved);
        searchTerm = filters.searchTerm || '';
        filterFrost = filters.filterFrost || '';
        filterZone = filters.filterZone || '';
        
        // Oppdater UI
        document.getElementById('plant-search').value = searchTerm;
        document.getElementById('filter-frost').value = filterFrost;
        document.getElementById('filter-zone').value = filterZone;
    }
}
```

## Konklusjon

Denne implementeringen gir brukerne mulighet til å raskt finne relevante planter. Funksjonen kan utvides videre med:
- Flere filterkriterier (avling, frøbehov)
- Avansert søk (regulære uttrykk)
- Søkehistorikk
- Populære søk / anbefalinger
