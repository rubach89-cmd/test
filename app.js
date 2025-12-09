// Global variables
let cropsData = [];
let climateZonesData = [];
let handleliste = [];
let currentCalculation = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    loadHandleliste();
    initializeEventListeners();
    renderPlants();
    renderHandleliste();
    updateHeaderStats();
    initializeScrollBehavior();
    initializeSearchAndFilter();
});

// Load crops and climate zones data
async function loadData() {
    try {
        const [cropsResponse, climateResponse] = await Promise.all([
            fetch('data/crops.json'),
            fetch('data/climate_zones.json')
        ]);
        
        cropsData = await cropsResponse.json();
        climateZonesData = await climateResponse.json();
        
        populatePlantSelect();
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Kunne ikke laste plantdata. Vennligst sjekk at datafilene finnes.');
    }
}

// Populate plant select dropdown
function populatePlantSelect() {
    const select = document.getElementById('plant-select');
    cropsData.forEach(plant => {
        const option = document.createElement('option');
        option.value = plant.id;
        option.textContent = plant.common_name;
        select.appendChild(option);
    });
}

// Initialize event listeners
function initializeEventListeners() {
    // Calculator button
    document.getElementById('calculate-btn').addEventListener('click', handleCalculate);
    
    // Add calculation to list button
    document.getElementById('add-calc-to-list').addEventListener('click', addCalculationToList);
    
    // Export buttons
    document.getElementById('export-csv-btn').addEventListener('click', exportToCSV);
    document.getElementById('export-pdf-btn').addEventListener('click', exportToPDF);
    
    // Clear list button
    document.getElementById('clear-list-btn').addEventListener('click', () => {
        if (confirm('Er du sikker på at du vil tømme hele handlelisten?')) {
            clearHandleliste();
        }
    });
    
    // Modal close
    const modal = document.getElementById('plant-modal');
    const closeBtn = document.querySelector('.close');
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Slugify function for icon filenames
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/æ/g, 'ae')
        .replace(/ø/g, 'o')
        .replace(/å/g, 'a')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

// Get icon path for plant
function getIconPath(commonName) {
    const slug = slugify(commonName);
    return `assets/icons/${slug}.svg`;
}

// Render plants grid
function renderPlants() {
    const grid = document.getElementById('plants-grid');
    grid.innerHTML = '';
    
    cropsData.forEach(plant => {
        const card = createPlantCard(plant);
        grid.appendChild(card);
    });
}

// Create plant card element
function createPlantCard(plant) {
    const card = document.createElement('div');
    card.className = 'plant-card';
    
    const iconPath = getIconPath(plant.common_name);
    
    card.innerHTML = `
        <div class="plant-card-header">
            <img src="${iconPath}" alt="${plant.common_name}" class="plant-icon" 
                 onerror="this.src='assets/icons/generic.svg'">
            <div>
                <h3>${plant.common_name}</h3>
                <p class="scientific-name">${plant.scientific_name}</p>
            </div>
        </div>
        <div class="plant-card-info">
            <p><strong>Avling:</strong> ${plant.yield_kg_per_m2} kg/m²</p>
            <p><strong>Frøbehov:</strong> ${plant.seed_rate} ${plant.seed_unit}/m²</p>
            <p><strong>Frosttålighet:</strong> ${getFrostToleranceText(plant.frost_tolerance)}</p>
        </div>
        <div class="plant-card-footer">
            <button class="btn-secondary btn-small" onclick="openPlantModal(${plant.id})">Se detaljer</button>
            <button class="btn-add btn-small" onclick="addPlantToList(${plant.id})">Legg til i handleliste</button>
        </div>
    `;
    
    return card;
}

// Get frost tolerance text in Norwegian
function getFrostToleranceText(tolerance) {
    const toleranceMap = {
        'none': 'Ingen',
        'light': 'Lett',
        'moderate': 'Moderat',
        'high': 'Høy'
    };
    return toleranceMap[tolerance] || tolerance;
}

// Open plant modal
function openPlantModal(plantId) {
    const plant = cropsData.find(p => p.id === plantId);
    if (!plant) return;
    
    const modal = document.getElementById('plant-modal');
    const modalBody = document.getElementById('modal-body');
    
    const iconPath = getIconPath(plant.common_name);
    
    modalBody.innerHTML = `
        <div class="modal-plant-header">
            <img src="${iconPath}" alt="${plant.common_name}" class="modal-plant-icon" 
                 onerror="this.src='assets/icons/generic.svg'">
            <div>
                <h2>${plant.common_name}</h2>
                <p class="scientific-name">${plant.scientific_name}</p>
            </div>
        </div>
        <div class="modal-plant-info">
            <p><strong>Avling per m²:</strong> ${plant.yield_kg_per_m2} kg</p>
            <p><strong>Frøbehov per m²:</strong> ${plant.seed_rate} ${plant.seed_unit}</p>
            <p><strong>Frosttålighet:</strong> ${getFrostToleranceText(plant.frost_tolerance)}</p>
            <p><strong>Minimum sone:</strong> ${plant.min_zone}</p>
        </div>
        <div class="modal-calculation">
            <h3>Kalkulator</h3>
            <div class="modal-calc-form">
                <label for="modal-desired-kg">Ønsket avling (kg):</label>
                <input type="number" id="modal-desired-kg" min="0" step="0.1" value="100">
                <button class="btn-primary" onclick="calculateInModal(${plant.id})">Beregn</button>
            </div>
            <div id="modal-calc-result-${plant.id}" style="display: none;"></div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Calculate in modal
function calculateInModal(plantId) {
    const plant = cropsData.find(p => p.id === plantId);
    const desiredKg = parseFloat(document.getElementById('modal-desired-kg').value);
    
    if (!desiredKg || desiredKg <= 0) {
        alert('Vennligst skriv inn ønsket avling.');
        return;
    }
    
    const result = calcAreaAndSeed(plant, desiredKg);
    const resultDiv = document.getElementById(`modal-calc-result-${plant.id}`);
    
    resultDiv.innerHTML = `
        <div class="modal-calc-result">
            <p><strong>Resultat for ${desiredKg} kg ${plant.common_name}:</strong></p>
            <p>📏 <strong>Areal nødvendig:</strong> ${result.neededM2} m²</p>
            <p>🌱 <strong>Frø/sett nødvendig:</strong> ${result.seedNeeded} ${result.seedUnit}</p>
            <button class="btn-add btn-small" onclick="addModalCalculationToList(${plant.id}, ${desiredKg})">
                Legg til i handleliste
            </button>
        </div>
    `;
    resultDiv.style.display = 'block';
}

// Add modal calculation to list
function addModalCalculationToList(plantId, desiredKg) {
    const plant = cropsData.find(p => p.id === plantId);
    const result = calcAreaAndSeed(plant, desiredKg);
    
    addToHandleliste({
        id: Date.now(),
        plantId: plant.id,
        common_name: plant.common_name,
        desiredKg: desiredKg,
        neededM2: result.neededM2,
        seedNeeded: result.seedNeeded,
        seedUnit: result.seedUnit,
        note: ''
    });
    
    alert(`${plant.common_name} lagt til i handlelisten!`);
}

// Handle global calculator
function handleCalculate() {
    const plantId = parseInt(document.getElementById('plant-select').value);
    const desiredKg = parseFloat(document.getElementById('desired-kg').value);
    
    if (!plantId) {
        alert('Vennligst velg en plante.');
        return;
    }
    
    if (!desiredKg || desiredKg <= 0) {
        alert('Vennligst skriv inn ønsket avling.');
        return;
    }
    
    const plant = cropsData.find(p => p.id === plantId);
    const result = calcAreaAndSeed(plant, desiredKg);
    
    currentCalculation = {
        plantId: plant.id,
        common_name: plant.common_name,
        desiredKg: desiredKg,
        neededM2: result.neededM2,
        seedNeeded: result.seedNeeded,
        seedUnit: result.seedUnit
    };
    
    const resultDiv = document.getElementById('calculator-result');
    const detailsDiv = document.getElementById('result-details');
    
    detailsDiv.innerHTML = `
        <p><strong>Plante:</strong> ${plant.common_name}</p>
        <p><strong>Ønsket avling:</strong> ${desiredKg} kg</p>
        <p>📏 <strong>Areal nødvendig:</strong> ${result.neededM2} m²</p>
        <p>🌱 <strong>Frø/sett nødvendig:</strong> ${result.seedNeeded} ${result.seedUnit}</p>
    `;
    
    resultDiv.style.display = 'block';
}

// Add current calculation to list
function addCalculationToList() {
    if (!currentCalculation) return;
    
    addToHandleliste({
        id: Date.now(),
        ...currentCalculation,
        note: ''
    });
    
    alert(`${currentCalculation.common_name} lagt til i handlelisten!`);
}

// Calculate area and seed needed
function calcAreaAndSeed(plant, desiredKg) {
    const yieldPerM2 = plant.yield_kg_per_m2 || 1;
    const seedRate = plant.seed_rate || 0;
    const seedUnit = plant.seed_unit || 'kg';
    
    const neededM2 = (desiredKg / yieldPerM2).toFixed(2);
    const seedNeeded = seedRate > 0 ? (neededM2 * seedRate).toFixed(3) : '—';
    
    return {
        neededM2: neededM2,
        seedNeeded: seedNeeded,
        seedUnit: seedUnit
    };
}

// Add plant to list with prompt
function addPlantToList(plantId) {
    const plant = cropsData.find(p => p.id === plantId);
    const desiredKg = prompt(`Hvor mange kg ${plant.common_name} ønsker du?`, '100');
    
    if (desiredKg === null) return;
    
    const kg = parseFloat(desiredKg);
    if (isNaN(kg) || kg <= 0) {
        alert('Vennligst skriv inn et gyldig tall.');
        return;
    }
    
    const result = calcAreaAndSeed(plant, kg);
    
    addToHandleliste({
        id: Date.now(),
        plantId: plant.id,
        common_name: plant.common_name,
        desiredKg: kg,
        neededM2: result.neededM2,
        seedNeeded: result.seedNeeded,
        seedUnit: result.seedUnit,
        note: ''
    });
    
    alert(`${plant.common_name} lagt til i handlelisten!`);
}

// Handleliste management functions
function loadHandleliste() {
    const stored = localStorage.getItem('handleliste');
    if (stored) {
        try {
            handleliste = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading handleliste:', e);
            handleliste = [];
        }
    }
}

function saveHandleliste() {
    localStorage.setItem('handleliste', JSON.stringify(handleliste));
}

function addToHandleliste(item) {
    handleliste.push(item);
    saveHandleliste();
    renderHandleliste();
}

function removeFromHandleliste(id) {
    handleliste = handleliste.filter(item => item.id !== id);
    saveHandleliste();
    renderHandleliste();
}

function updateHandlelisteItem(id, field, value) {
    const item = handleliste.find(item => item.id === id);
    if (item) {
        item[field] = value;
        saveHandleliste();
    }
}

function clearHandleliste() {
    handleliste = [];
    saveHandleliste();
    renderHandleliste();
}

// Render handleliste table
function renderHandleliste() {
    const tbody = document.getElementById('handleliste-body');
    const emptyMessage = document.getElementById('empty-list-message');
    const table = document.getElementById('handleliste-table');
    
    if (handleliste.length === 0) {
        table.style.display = 'none';
        emptyMessage.style.display = 'block';
        updateHeaderStats();
        return;
    }
    
    table.style.display = 'table';
    emptyMessage.style.display = 'none';
    
    tbody.innerHTML = '';
    
    handleliste.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.common_name}</td>
            <td>${item.desiredKg}</td>
            <td>${item.neededM2}</td>
            <td>${item.seedNeeded}</td>
            <td>${item.seedUnit}</td>
            <td>
                <input type="text" value="${item.note || ''}" 
                       onchange="updateHandlelisteItem(${item.id}, 'note', this.value)"
                       placeholder="Notat...">
            </td>
            <td>
                <button class="btn-remove" onclick="removeFromHandleliste(${item.id})">Fjern</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    updateHeaderStats();
}

// Export to CSV
function exportToCSV() {
    if (handleliste.length === 0) {
        alert('Handlelisten er tom. Legg til planter først.');
        return;
    }
    
    const headers = ['Plante', 'Ønsket_kg', 'm2', 'Frø_sett', 'Frø_enhet', 'Notat'];
    const rows = handleliste.map(item => [
        item.common_name,
        item.desiredKg,
        item.neededM2,
        item.seedNeeded,
        item.seedUnit,
        item.note || ''
    ]);
    
    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    link.setAttribute('href', url);
    link.setAttribute('download', `handleliste-${today}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Export to PDF
async function exportToPDF() {
    if (handleliste.length === 0) {
        alert('Handlelisten er tom. Legg til planter først.');
        return;
    }
    
    // Calculate totals
    let totalM2 = 0;
    let totalSeedKg = 0;
    
    handleliste.forEach(item => {
        totalM2 += parseFloat(item.neededM2) || 0;
        if (item.seedUnit === 'kg' && item.seedNeeded !== '—') {
            totalSeedKg += parseFloat(item.seedNeeded) || 0;
        }
    });
    
    // Create temporary container for PDF
    const pdfContainer = document.createElement('div');
    pdfContainer.style.padding = '20px';
    pdfContainer.style.fontFamily = 'Arial, sans-serif';
    
    pdfContainer.innerHTML = `
        <h1 style="color: #667eea; text-align: center;">Handleliste - Plantekalkulator</h1>
        <p style="text-align: center; color: #666;">Generert: ${new Date().toLocaleDateString('nb-NO')}</p>
        
        <div style="background: #f8f9ff; padding: 15px; margin: 20px 0; border-radius: 8px;">
            <h3 style="color: #667eea; margin-top: 0;">Sammendrag</h3>
            <p><strong>Totalt areal:</strong> ${totalM2.toFixed(2)} m²</p>
            <p><strong>Totalt frø (kg):</strong> ${totalSeedKg.toFixed(3)} kg</p>
            <p><strong>Antall planter:</strong> ${handleliste.length}</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
                <tr style="background: #667eea; color: white;">
                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Plante</th>
                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Ønsket kg</th>
                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">m²</th>
                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Frø/sett</th>
                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Enhet</th>
                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Notat</th>
                </tr>
            </thead>
            <tbody>
                ${handleliste.map(item => `
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">${item.common_name}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${item.desiredKg}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${item.neededM2}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${item.seedNeeded}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${item.seedUnit}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${item.note || ''}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    document.body.appendChild(pdfContainer);
    
    const opt = {
        margin: 10,
        filename: `handleliste-${new Date().toISOString().split('T')[0].replace(/-/g, '')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    try {
        await html2pdf().set(opt).from(pdfContainer).save();
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Kunne ikke generere PDF. Sjekk konsollen for detaljer.');
    } finally {
        document.body.removeChild(pdfContainer);
    }
}

// Update header statistics
function updateHeaderStats() {
    const totalPlantsElement = document.getElementById('total-plants');
    const listItemsElement = document.getElementById('list-items');
    
    if (totalPlantsElement) {
        totalPlantsElement.textContent = cropsData.length;
    }
    
    if (listItemsElement) {
        listItemsElement.textContent = handleliste.length;
    }
}

// Initialize scroll behavior
function initializeScrollBehavior() {
    const scrollTopBtn = document.getElementById('scroll-top-btn');
    
    if (!scrollTopBtn) return;
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });
    
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Smooth scroll for navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offset = 20;
                const targetPosition = targetSection.offsetTop - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize search and filter functionality
function initializeSearchAndFilter() {
    const searchInput = document.getElementById('plant-search');
    const frostFilter = document.getElementById('frost-filter');
    
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    
    if (frostFilter) {
        frostFilter.addEventListener('change', applyFilters);
    }
}

// Apply search and filter to plants
function applyFilters() {
    const searchTerm = document.getElementById('plant-search')?.value.toLowerCase() || '';
    const frostFilterValue = document.getElementById('frost-filter')?.value || '';
    
    const plantCards = document.querySelectorAll('.plant-card');
    let visibleCount = 0;
    
    plantCards.forEach(card => {
        const plantName = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const scientificName = card.querySelector('.scientific-name')?.textContent.toLowerCase() || '';
        const frostInfo = card.querySelector('.plant-card-info')?.textContent.toLowerCase() || '';
        
        const matchesSearch = plantName.includes(searchTerm) || scientificName.includes(searchTerm);
        const matchesFrost = !frostFilterValue || frostInfo.includes(getFrostToleranceText(frostFilterValue).toLowerCase());
        
        if (matchesSearch && matchesFrost) {
            card.classList.remove('hidden');
            visibleCount++;
        } else {
            card.classList.add('hidden');
        }
    });
    
    // Add feedback for no results
    let noResultsMsg = document.getElementById('no-results-message');
    
    if (visibleCount === 0) {
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('p');
            noResultsMsg.id = 'no-results-message';
            noResultsMsg.style.textAlign = 'center';
            noResultsMsg.style.padding = '40px';
            noResultsMsg.style.color = '#666';
            noResultsMsg.style.background = 'white';
            noResultsMsg.style.borderRadius = '12px';
            noResultsMsg.style.fontSize = '1.1rem';
            noResultsMsg.textContent = '🔍 Ingen planter funnet. Prøv et annet søk eller filter.';
            
            const plantsGrid = document.getElementById('plants-grid');
            plantsGrid.parentNode.insertBefore(noResultsMsg, plantsGrid.nextSibling);
        }
        noResultsMsg.style.display = 'block';
    } else if (noResultsMsg) {
        noResultsMsg.style.display = 'none';
    }
}
