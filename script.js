// script.js - Lógica completa (Funcionalidades existentes + Troca de Página)

// --- 1. VARIÁVEIS E ESTADO ---
const STORAGE_KEY = 'letis_app_state_v2';
const MESSAGES = [
    "A vida é um presente, e eu amo dividir ela com você.",
    "Lembre-se: você é forte, inteligente e a pessoa mais linda que conheço. Eu te amo!",
    "Se precisar de um abraço hoje, me procure! Estou aqui para você.",
    "O nosso futuro é construído com os seus sorrisos de hoje. Te amo!",
    "Um lembrete fofo do Davi: você é incrível. 💖"
];

let state = {
    waterCount: 0,
    goals: [
        { text: "Beber pelo menos 8 copos de água", done: false },
        { text: "Dormir 7 horas seguidas", done: false },
        { text: "Ler 10 páginas de um livro", done: false },
        { text: "Me exercitar por 30 minutos", done: false },
        { text: "Passar 10 minutos longe das telas", done: false }
    ],
    messageIndex: 0
};

// --- 2. FUNÇÕES DE ARMAZENAMENTO ---

function loadState() {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
        // Mescla o estado salvo com o estado padrão para garantir que novas chaves existam
        const loaded = JSON.parse(savedState);
        state = { ...state, ...loaded };
        // Garante que o array de metas seja carregado corretamente
        if (!state.goals || state.goals.length === 0) {
             state.goals = [
                { text: "Beber pelo menos 8 copos de água", done: false },
                { text: "Dormir 7 horas seguidas", done: false },
                { text: "Ler 10 páginas de um livro", done: false }
            ];
        }
    }
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// --- 3. FUNCIONALIDADES DE HIDRATAÇÃO ---

function renderWater() {
    const display = document.getElementById('water-display');
    if (!display) return;
    
    let html = '';
    const max = 8;
    for (let i = 0; i < max; i++) {
        const isFilled = i < state.waterCount;
        // Use emojis para os copos
        html += `<span class="water-cup" style="font-size: 30px; opacity: ${isFilled ? 1 : 0.4}; margin-right: 5px;">💧</span>`;
    }
    
    if (state.waterCount > 0) {
        display.innerHTML = `<p style="font-size: 18px; font-weight: bold; color: var(--cor-detalhe);">Você bebeu ${state.waterCount} de ${max} copos! 💙</p>${html}`;
    } else {
        display.innerHTML = `<p class="water-placeholder">Beba seu primeiro copo! (0/${max})</p>`;
    }
}

function addWater() {
    state.waterCount = Math.min(state.waterCount + 1, 12); // Limita para não ter copos infinitos
    renderWater();
    saveState();
}

// --- 4. FUNCIONALIDADES DE METAS ---

function renderGoals() {
    const list = document.getElementById('goals-list');
    if (!list) return;

    list.innerHTML = state.goals.map((goal, index) => `
        <li>
            <input type="checkbox" id="goal-${index}" class="goal-checkbox" ${goal.done ? 'checked' : ''} onchange="toggleGoal(${index})">
            <span class="goal-text ${goal.done ? 'done' : ''}">${goal.text}</span>
            <button class="del-btn" onclick="deleteGoal(${index})">❌</button>
        </li>
    `).join('');
}

function toggleGoal(index) {
    state.goals[index