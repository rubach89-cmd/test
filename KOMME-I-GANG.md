# Kom i gang med forbedringer

Dette er en rask oppstartsguide for å implementere de mest verdifulle forbedringene til Plantekalkulator-appen.

## 🎯 Anbefalt rekkefølge

Vi anbefaler å starte med disse tre forbedringene i denne rekkefølgen:

1. **Søk og filtrering** (2-3 timer)
2. **Sortering av handleliste** (2-3 timer)  
3. **Redigering av handleliste** (1-2 timer)

**Total tid:** ~6-8 timer for alle tre

**Resultat:** Betydelig forbedret brukeropplevelse med minimal innsats

## 📋 Forbedring 1: Søk og filtrering

**Estimert tid:** 2-3 timer

### Hva får du?
- Real-time søk i plantenavn
- Filtrering på frosttålighet og klimasone
- Resultatantall og "ingen resultater"-melding

### Implementering
Se detaljert guide i [IMPLEMENTERINGSGUIDE.md](IMPLEMENTERINGSGUIDE.md)

### Rask sjekkliste
- [ ] Legg til HTML for søkefelt og filtre
- [ ] Legg til CSS for styling
- [ ] Implementer `filterPlants()` funksjon
- [ ] Implementer `renderFilteredPlants()` funksjon
- [ ] Koble opp event listeners
- [ ] Test med ulike søk og filtre

## 📊 Forbedring 2: Sortering av handleliste

**Estimert tid:** 2-3 timer

### Hva får du?
- Klikkbare kolonneoverskrifter
- Sortering stigende/synkende
- Visuell indikator for sorteringsretning
- Persistent sortering (localStorage)

### Implementering

#### HTML-endring i `index.html`

```html
<thead>
    <tr>
        <th class="sortable" data-sort="common_name">
            Plante <span class="sort-indicator"></span>
        </th>
        <th class="sortable" data-sort="desiredKg">
            Ønsket kg <span class="sort-indicator"></span>
        </th>
        <th class="sortable" data-sort="neededM2">
            m² <span class="sort-indicator"></span>
        </th>
        <th class="sortable" data-sort="seedNeeded">
            Frø/sett <span class="sort-indicator"></span>
        </th>
        <th>Frø_enhet</th>
        <th>Notat</th>
        <th>Fjern</th>
    </tr>
</thead>
```

#### CSS i `styles.css`

```css
.sortable {
    cursor: pointer;
    user-select: none;
    position: relative;
    padding-right: 20px;
}

.sortable:hover {
    background-color: #f0f0f0;
}

.sort-indicator {
    position: absolute;
    right: 5px;
    font-size: 0.8em;
    color: #666;
}

.sort-indicator.asc::after {
    content: ' ↑';
}

.sort-indicator.desc::after {
    content: ' ↓';
}
```

#### JavaScript i `app.js`

```javascript
// Globale variabler
let sortColumn = '';
let sortDirection = 'asc';

// Legg til i initializeEventListeners()
document.querySelectorAll('.sortable').forEach(header => {
    header.addEventListener('click', () => {
        const column = header.dataset.sort;
        handleSort(column);
    });
});

// Sorteringsfunksjon
function handleSort(column) {
    if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortDirection = 'asc';
    }
    
    sortHandleliste();
    renderHandleliste();
    saveSortPreference();
}

// Sorter handlelisten
function sortHandleliste() {
    handleliste.sort((a, b) => {
        let aVal = a[sortColumn];
        let bVal = b[sortColumn];
        
        // Håndter strenger vs tall
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
}

// Oppdater sorteringsindikatorer
function updateSortIndicators() {
    document.querySelectorAll('.sort-indicator').forEach(indicator => {
        indicator.className = 'sort-indicator';
    });
    
    if (sortColumn) {
        const header = document.querySelector(`[data-sort="${sortColumn}"]`);
        if (header) {
            const indicator = header.querySelector('.sort-indicator');
            indicator.classList.add(sortDirection);
        }
    }
}

// Lagre sorteringsinnstilling
function saveSortPreference() {
    localStorage.setItem('handleliste-sort', JSON.stringify({
        column: sortColumn,
        direction: sortDirection
    }));
}

// Last sorteringsinnstilling
function loadSortPreference() {
    const saved = localStorage.getItem('handleliste-sort');
    if (saved) {
        const pref = JSON.parse(saved);
        sortColumn = pref.column;
        sortDirection = pref.direction;
    }
}

// Oppdater renderHandleliste() til å kalle updateSortIndicators()
function renderHandleliste() {
    // ... eksisterende kode ...
    updateSortIndicators();
}
```

### Rask sjekkliste
- [ ] Oppdater HTML med `data-sort` attributter
- [ ] Legg til CSS for sorteringsindikatorer
- [ ] Implementer `handleSort()` funksjon
- [ ] Implementer `sortHandleliste()` funksjon
- [ ] Legg til `updateSortIndicators()`
- [ ] Implementer localStorage for sorteringsinnstilling
- [ ] Test sortering på alle kolonner

## ✏️ Forbedring 3: Redigering av handleliste

**Estimert tid:** 1-2 timer

### Hva får du?
- Direkte redigering av "Ønsket kg" i tabellen
- Automatisk omberegning av m² og frøbehov
- Bedre brukeropplevelse (ingen sletting/ny tillegg nødvendig)

### Implementering

#### Oppdater `renderHandleliste()` i `app.js`

```javascript
function renderHandleliste() {
    const tbody = document.getElementById('handleliste-body');
    const emptyMsg = document.getElementById('empty-list-message');
    const table = document.getElementById('handleliste-table');
    
    tbody.innerHTML = '';
    
    if (handleliste.length === 0) {
        table.style.display = 'none';
        emptyMsg.style.display = 'block';
        return;
    }
    
    table.style.display = 'table';
    emptyMsg.style.display = 'none';
    
    handleliste.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.common_name}</td>
            <td>
                <input type="number" 
                       class="editable-kg" 
                       value="${item.desiredKg}" 
                       min="0.1" 
                       step="0.1"
                       data-item-id="${item.id}">
            </td>
            <td>${item.neededM2}</td>
            <td>${item.seedNeeded}</td>
            <td>${item.seedUnit}</td>
            <td>
                <input type="text" 
                       class="editable-note" 
                       value="${item.note || ''}" 
                       placeholder="Legg til notat..."
                       data-item-id="${item.id}">
            </td>
            <td>
                <button class="btn-danger btn-small" onclick="removeFromHandleliste(${item.id})">
                    Fjern
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Legg til event listeners for redigering
    attachEditListeners();
    updateSortIndicators();
}

// Legg til event listeners for redigering
function attachEditListeners() {
    // Redigering av ønsket kg
    document.querySelectorAll('.editable-kg').forEach(input => {
        input.addEventListener('change', (e) => {
            const itemId = parseInt(e.target.dataset.itemId);
            const newKg = parseFloat(e.target.value);
            
            if (newKg && newKg > 0) {
                updateHandlelisteItem(itemId, newKg);
            } else {
                alert('Vennligst skriv inn et gyldig tall større enn 0');
                renderHandleliste();
            }
        });
    });
    
    // Redigering av notater
    document.querySelectorAll('.editable-note').forEach(input => {
        input.addEventListener('blur', (e) => {
            const itemId = parseInt(e.target.dataset.itemId);
            const newNote = e.target.value;
            
            const item = handleliste.find(i => i.id === itemId);
            if (item) {
                item.note = newNote;
                saveHandleliste();
            }
        });
    });
}

// Oppdater handleliste-element
function updateHandlelisteItem(itemId, newKg) {
    const item = handleliste.find(i => i.id === itemId);
    if (!item) return;
    
    const plant = cropsData.find(p => p.id === item.plantId);
    if (!plant) return;
    
    // Beregn på nytt
    const result = calcAreaAndSeed(plant, newKg);
    
    // Oppdater item
    item.desiredKg = newKg;
    item.neededM2 = result.neededM2;
    item.seedNeeded = result.seedNeeded;
    
    // Lagre og re-render
    saveHandleliste();
    renderHandleliste();
}
```

#### CSS for redigerbare felt i `styles.css`

```css
.editable-kg,
.editable-note {
    width: 100%;
    padding: 5px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.editable-kg {
    width: 80px;
}

.editable-note {
    min-width: 150px;
}

.editable-kg:focus,
.editable-note:focus {
    outline: none;
    border-color: #4CAF50;
    background-color: #f9fff9;
}

/* Mobiltilpasning */
@media (max-width: 768px) {
    .editable-kg,
    .editable-note {
        font-size: 16px; /* Forhindrer zoom på iOS */
        padding: 8px;
    }
}
```

### Rask sjekkliste
- [ ] Bytt ut statisk tekst med input-felt for "Ønsket kg"
- [ ] Implementer `attachEditListeners()` funksjon
- [ ] Implementer `updateHandlelisteItem()` funksjon
- [ ] Legg til CSS for redigerbare felt
- [ ] Test endring av kg-verdi
- [ ] Test at omberegning skjer automatisk
- [ ] Test notatredigering

## 🚀 Komme i gang nå

### Dag 1 (2-3 timer)
Implementer søk og filtrering:
1. Klon repositoriet hvis du ikke allerede har det
2. Følg [IMPLEMENTERINGSGUIDE.md](IMPLEMENTERINGSGUIDE.md)
3. Test grundig
4. Commit og push

### Dag 2 (2-3 timer)
Implementer sortering av handleliste:
1. Følg denne guiden for Forbedring 2
2. Test alle kolonner
3. Verifiser at sortering lagres
4. Commit og push

### Dag 3 (1-2 timer)
Implementer redigering av handleliste:
1. Følg denne guiden for Forbedring 3
2. Test endring av kg-verdier
3. Test omberegning
4. Commit og push

## 📚 Videre ressurser

- **Detaljerte anbefalinger:** [ANBEFALINGER.md](ANBEFALINGER.md)
- **Implementeringsguide for søk:** [IMPLEMENTERINGSGUIDE.md](IMPLEMENTERINGSGUIDE.md)
- **Testing:** Se "Testing"-seksjonen i implementeringsguidene

## 💡 Tips

1. **Test underveis**: Test hver funksjon før du går videre
2. **Bruk konsollen**: Nettleserens utviklerkonsoll er din venn
3. **Commit ofte**: Små, logiske commits er bedre enn store
4. **Dokumenter**: Legg til kommentarer for kompleks logikk
5. **Backup**: Ta backup av filer før større endringer

## ❓ Spørsmål?

Hvis du møter på problemer:
1. Sjekk nettleserens konsoll for feilmeldinger
2. Verifiser at alle filer er korrekt oppdatert
3. Test i en annen nettleser
4. Opprett en issue på GitHub

## 🎉 Neste steg

Når du har implementert disse tre forbedringene, kan du fortsette med:
- Forbedret mobilvisning
- Plantesesongkalender
- Favoritter/merking av planter

Se [ANBEFALINGER.md](ANBEFALINGER.md) for fullstendig oversikt.
