// Global state
let cropsData = [];
let handleliste = [];
let lastCalcResult = null;

// DOM Elements
const plantsContainer = document.getElementById('plants-container');
const searchInput = document.getElementById('search-plants');
const calcPlantSelect = document.getElementById('calc-plant');
const calcDesiredKgInput = document.getElementById('calc-desired-kg');
const calcButton = document.getElementById('calc-button');
const calcResultDiv = document.getElementById('calc-result');
const calcResultText = document.getElementById('calc-result-text');
const calcAddToListBtn = document.getElementById('calc-add-to-list');
const handlelisteBody = document.getElementById('handleliste-body');
const handlelisteEmpty = document.getElementById('handleliste-empty');
const handlelisteTable = document.getElementById('handleliste-table');
const exportCsvBtn = document.getElementById('export-csv');
const exportPdfBtn = document.getElementById('export-pdf');
const clearListBtn = document.getElementById('clear-list');
const plantModal = document.getElementById('plant-modal');
const modalBody = document.getElementById('modal-body');

// Utility function: slugify plant name
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/æ/g, 'ae')
        .replace(/ø/g, 'oe')
        .replace(/å/g, 'aa')
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
}

// Load crops data
async function loadCropsData() {
    try {
        const response = await fetch('data/crops.json');
        if (!response.ok) {
            throw new Error('Kunne ikke laste plantedata');
        }
        cropsData = await response.json();
        populateCalcSelect();
        renderPlants();
    } catch (error) {
        console.error('Feil ved lasting av data:', error);
        plantsContainer.innerHTML = '<p class="error">Kunne ikke laste plantedata. Vennligst prøv igjen senere.</p>';
    }
}

// Populate calculator select
function populateCalcSelect() {
    calcPlantSelect.innerHTML = '<option value="">-- Velg plante --</option>';
    cropsData.forEach((crop, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = crop.common_name;
        calcPlantSelect.appendChild(option);
    });
}

// Calculate area and seed needed
function calcAreaAndSeed(crop, desiredKg) {
    const yieldPerM2 = crop.yield_per_m2_kg || 0;
    const seedRatePerM2 = crop.seed_rate_per_m2 || 0;
    const seedUnit = crop.seed_unit || '—';

    if (yieldPerM2 === 0) {
        return {
            neededM2: '—',
            seedNeeded: '—',
            seedUnit: '—'
        };
    }

    const neededM2 = (desiredKg / yieldPerM2).toFixed(2);
    
    if (seedRatePerM2 === 0) {
        return {
            neededM2: neededM2,
            seedNeeded: '—',
            seedUnit: seedUnit
        };
    }

    const seedNeeded = (neededM2 * seedRatePerM2).toFixed(2);

    return {
        neededM2: neededM2,
        seedNeeded: seedNeeded,
        seedUnit: seedUnit
    };
}

// Calculator button handler
calcButton.addEventListener('click', () => {
    const selectedIndex = calcPlantSelect.value;
    const desiredKg = parseFloat(calcDesiredKgInput.value);

    if (selectedIndex === '' || isNaN(desiredKg) || desiredKg <= 0) {
        alert('Vennligst velg en plante og oppgi ønsket avling.');
        return;
    }

    const crop = cropsData[selectedIndex];
    const result = calcAreaAndSeed(crop, desiredKg);

    lastCalcResult = {
        common_name: crop.common_name,
        desiredKg: desiredKg,
        neededM2: result.neededM2,
        seedNeeded: result.seedNeeded,
        seedUnit: result.seedUnit
    };

    calcResultText.innerHTML = `
        <strong>${crop.common_name}</strong><br>
        For å få <strong>${desiredKg} kg</strong> trenger du:<br>
        • <strong>${result.neededM2}</strong> m²<br>
        • <strong>${result.seedNeeded}</strong> ${result.seedUnit}
    `;
    calcResultDiv.style.display = 'block';
});

// Add calc result to handleliste
calcAddToListBtn.addEventListener('click', () => {
    if (!lastCalcResult) return;
    
    const item = {
        id: Date.now(),
        common_name: lastCalcResult.common_name,
        desiredKg: lastCalcResult.desiredKg,
        neededM2: lastCalcResult.neededM2,
        seedNeeded: lastCalcResult.seedNeeded,
        seedUnit: lastCalcResult.seedUnit,
        note: ''
    };

    addToHandleliste(item);
    alert('Lagt til i handleliste!');
});

// Render plants
function renderPlants(filter = '') {
    plantsContainer.innerHTML = '';
    
    const filteredCrops = filter 
        ? cropsData.filter(crop => 
            crop.common_name.toLowerCase().includes(filter.toLowerCase()) ||
            crop.scientific_name.toLowerCase().includes(filter.toLowerCase())
          )
        : cropsData;

    filteredCrops.forEach((crop, index) => {
        const card = document.createElement('div');
        card.className = 'plant-card';
        
        const iconSlug = slugify(crop.common_name);
        const iconPath = `assets/icons/${iconSlug}.svg`;
        
        card.innerHTML = `
            <img src="${iconPath}" alt="${crop.common_name}" class="plant-icon" 
                 onerror="this.src='assets/icons/generic.svg'">
            <h3>${crop.common_name}</h3>
            <p class="scientific-name">${crop.scientific_name}</p>
            <div class="plant-info">
                <p>🌾 Avling: ${crop.yield_per_m2_kg} kg/m²</p>
                <p>🌱 Planting: ${crop.planting_date_offset_after_frost} dager etter frost</p>
            </div>
            <div class="plant-card-actions">
                <button class="btn btn-primary btn-small view-details-btn" data-index="${cropsData.indexOf(crop)}">
                    Se detaljer
                </button>
                <button class="btn btn-secondary btn-small add-to-list-btn" data-index="${cropsData.indexOf(crop)}">
                    Legg til i handleliste
                </button>
            </div>
        `;
        
        plantsContainer.appendChild(card);
    });

    // Add event listeners
    document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(btn.dataset.index);
            showPlantModal(cropsData[index]);
        });
    });

    document.querySelectorAll('.add-to-list-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(btn.dataset.index);
            promptAddToHandleliste(cropsData[index]);
        });
    });
}

// Search filter
searchInput.addEventListener('input', (e) => {
    renderPlants(e.target.value);
});

// Show plant modal
function showPlantModal(crop) {
    const iconSlug = slugify(crop.common_name);
    const iconPath = `assets/icons/${iconSlug}.svg`;
    
    modalBody.innerHTML = `
        <div class="modal-header">
            <img src="${iconPath}" alt="${crop.common_name}" class="modal-icon"
                 onerror="this.src='assets/icons/generic.svg'">
            <h2>${crop.common_name}</h2>
            <p class="scientific-name">${crop.scientific_name}</p>
        </div>
        <div class="modal-body-content">
            <p><strong>Beskrivelse:</strong> ${crop.description}</p>
            <p><strong>Avling per m²:</strong> ${crop.yield_per_m2_kg} kg</p>
            <p><strong>Planteavstand:</strong> ${crop.spacing_cm} cm</p>
            <p><strong>Planting:</strong> ${crop.planting_date_offset_after_frost} dager etter siste frostdato</p>
            <p><strong>Frøbehov per m²:</strong> ${crop.seed_rate_per_m2 || '—'} ${crop.seed_unit || '—'}</p>
        </div>
        <div class="modal-calculator">
            <h3>Rask kalkulator</h3>
            <div class="form-group">
                <label for="modal-desired-kg">Ønsket avling (kg):</label>
                <input type="number" id="modal-desired-kg" min="1" value="100" step="0.1">
            </div>
            <button id="modal-calc-btn" class="btn btn-primary">Beregn</button>
            <div id="modal-calc-result" style="display: none;"></div>
        </div>
    `;

    plantModal.style.display = 'block';

    // Modal calculator
    const modalCalcBtn = document.getElementById('modal-calc-btn');
    const modalDesiredKgInput = document.getElementById('modal-desired-kg');
    const modalCalcResult = document.getElementById('modal-calc-result');

    modalCalcBtn.addEventListener('click', () => {
        const desiredKg = parseFloat(modalDesiredKgInput.value);
        if (isNaN(desiredKg) || desiredKg <= 0) {
            alert('Vennligst oppgi ønsket avling.');
            return;
        }

        const result = calcAreaAndSeed(crop, desiredKg);
        modalCalcResult.className = 'modal-calc-result';
        modalCalcResult.innerHTML = `
            <p><strong>For ${desiredKg} kg trenger du:</strong></p>
            <p>• ${result.neededM2} m²</p>
            <p>• ${result.seedNeeded} ${result.seedUnit}</p>
            <button id="modal-add-to-list" class="btn btn-secondary" style="margin-top: 1rem;">
                Legg til i handleliste
            </button>
        `;
        modalCalcResult.style.display = 'block';

        // Add to handleliste from modal
        document.getElementById('modal-add-to-list').addEventListener('click', () => {
            const item = {
                id: Date.now(),
                common_name: crop.common_name,
                desiredKg: desiredKg,
                neededM2: result.neededM2,
                seedNeeded: result.seedNeeded,
                seedUnit: result.seedUnit,
                note: ''
            };
            addToHandleliste(item);
            alert('Lagt til i handleliste!');
            plantModal.style.display = 'none';
        });
    });
}

// Close modal
document.querySelector('.modal-close').addEventListener('click', () => {
    plantModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === plantModal) {
        plantModal.style.display = 'none';
    }
});

// Prompt add to handleliste
function promptAddToHandleliste(crop) {
    const desiredKg = prompt('Hvor mange kg ønsker du?', '100');
    if (!desiredKg || isNaN(parseFloat(desiredKg)) || parseFloat(desiredKg) <= 0) {
        return;
    }

    const result = calcAreaAndSeed(crop, parseFloat(desiredKg));
    const item = {
        id: Date.now(),
        common_name: crop.common_name,
        desiredKg: parseFloat(desiredKg),
        neededM2: result.neededM2,
        seedNeeded: result.seedNeeded,
        seedUnit: result.seedUnit,
        note: ''
    };

    addToHandleliste(item);
    alert('Lagt til i handleliste!');
}

// Handleliste functions
function loadHandleliste() {
    const stored = localStorage.getItem('handleliste');
    if (stored) {
        try {
            handleliste = JSON.parse(stored);
        } catch (e) {
            console.error('Feil ved lasting av handleliste:', e);
            handleliste = [];
        }
    }
    renderHandleliste();
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

function updateHandlelisteItem(id, changes) {
    const item = handleliste.find(i => i.id === id);
    if (item) {
        Object.assign(item, changes);
        saveHandleliste();
        renderHandleliste();
    }
}

function clearHandleliste() {
    if (confirm('Er du sikker på at du vil tømme handlelisten?')) {
        handleliste = [];
        saveHandleliste();
        renderHandleliste();
    }
}

function renderHandleliste() {
    handlelisteBody.innerHTML = '';
    
    if (handleliste.length === 0) {
        handlelisteEmpty.style.display = 'block';
        handlelisteTable.style.display = 'none';
        return;
    }

    handlelisteEmpty.style.display = 'none';
    handlelisteTable.style.display = 'table';

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
                       data-id="${item.id}" class="note-input"
                       placeholder="Legg til notat...">
            </td>
            <td>
                <button class="btn btn-danger btn-small remove-btn" data-id="${item.id}">
                    Fjern
                </button>
            </td>
        `;
        handlelisteBody.appendChild(row);
    });

    // Add event listeners
    document.querySelectorAll('.note-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const id = parseInt(e.target.dataset.id);
            updateHandlelisteItem(id, { note: e.target.value });
        });
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            removeFromHandleliste(id);
        });
    });
}

// Export CSV
function exportCSV() {
    if (handleliste.length === 0) {
        alert('Handlelisten er tom. Ingenting å eksportere.');
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
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    link.download = `handleliste-${dateStr}.csv`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Export PDF
async function exportPDF() {
    if (handleliste.length === 0) {
        alert('Handlelisten er tom. Ingenting å eksportere.');
        return;
    }

    // Calculate totals
    let totalM2 = 0;
    let totalSeedKg = 0;

    handleliste.forEach(item => {
        if (item.neededM2 !== '—' && !isNaN(parseFloat(item.neededM2))) {
            totalM2 += parseFloat(item.neededM2);
        }
        if (item.seedUnit === 'kg' && item.seedNeeded !== '—' && !isNaN(parseFloat(item.seedNeeded))) {
            totalSeedKg += parseFloat(item.seedNeeded);
        }
    });

    // Create PDF content
    const pdfContent = document.createElement('div');
    pdfContent.style.padding = '20px';
    pdfContent.style.fontFamily = 'Arial, sans-serif';
    
    pdfContent.innerHTML = `
        <h1 style="color: #2d5016; text-align: center; margin-bottom: 20px;">
            🌱 Handleliste - Dyrkingsplanlegger
        </h1>
        <p style="text-align: center; color: #6c757d; margin-bottom: 30px;">
            Generert: ${new Date().toLocaleDateString('nb-NO')}
        </p>
        ${handlelisteTable.outerHTML}
        <div style="margin-top: 30px; padding: 20px; background: #e8f5e9; border-radius: 4px;">
            <h3 style="color: #2d5016; margin-bottom: 10px;">Totaler</h3>
            <p><strong>Totalt areal:</strong> ${totalM2.toFixed(2)} m²</p>
            <p><strong>Totalt frø (kg):</strong> ${totalSeedKg.toFixed(2)} kg</p>
        </div>
    `;

    const opt = {
        margin: 10,
        filename: `handleliste-${new Date().toISOString().split('T')[0].replace(/-/g, '')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
        await html2pdf().set(opt).from(pdfContent).save();
    } catch (error) {
        console.error('PDF export error:', error);
        alert('Kunne ikke eksportere PDF. Vennligst sørg for at siden kjører over HTTP(S).');
    }
}

// Event listeners for export buttons
exportCsvBtn.addEventListener('click', exportCSV);
exportPdfBtn.addEventListener('click', exportPDF);
clearListBtn.addEventListener('click', clearHandleliste);

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadCropsData();
    loadHandleliste();
});
