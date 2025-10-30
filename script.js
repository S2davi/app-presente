// script.js - Lógica Central do App (Metas, Mensagens, Hidratação, Humor)

// --- ESTADO GLOBAL (SALVAMENTO) ---
// Versão do cache para forçar a atualização se algo mudar drasticamente
const STATE_KEY = 'florescer_state_v4'; 
const initialState = {
  messageIndex: 0,
  goals: [], 
  waterCount: 0,
  moodToday: null,
  moodDate: null // Para resetar a água e o humor diariamente
};

let state = loadState();

function loadState() {
  const savedState = localStorage.getItem(STATE_KEY);
  if (savedState) {
    let loaded = JSON.parse(savedState);
    
    // Logica para resetar a água e o humor no início de um novo dia
    const today = new Date().toDateString();
    if (loaded.moodDate !== today) {
        loaded.waterCount = 0;
        loaded.moodToday = null;
        loaded.moodDate = today;
    }
    return loaded;
  }
  initialState.moodDate = new Date().toDateString();
  return initialState;
}

function saveState(newState) {
  localStorage.setItem(STATE_KEY, JSON.stringify(newState));
  state = newState;
}

// --- CONFIGURAÇÕES ---
const MESSAGES = [
  "Você é a mulher mais forte e incrível que eu conheço! Eu te amo muito!",
  "Lembre-se de beber água e dar um tempo para você hoje. Seu Davi te ama!",
  "Seu sorriso ilumina meu dia. Não esqueça de sorrir!",
  "Quando a saudade bater, saiba que estou pensando em você.",
  "Estou torcendo por você em todas as suas metas. Você vai longe!",
  "Você é linda, de dentro para fora. Nunca duvide disso."
];

// --- 1. METAS E MENSAGENS ---

function renderGoals() {
  const goalsList = document.getElementById("goals-list");
  if (!goalsList) return;

  goalsList.innerHTML = '';
  state.goals.forEach((goal, index) => {
    const li = document.createElement('li');
    li.classList.add('goal-item');
    li.innerHTML = `
      <label>
        <input type="checkbox" ${goal.done ? 'checked' : ''} onchange="toggleGoal(${index})">
        <span class="goal-text ${goal.done ? 'done' : ''}">${goal.text}</span>
      </label>
      <button class="del-btn" onclick="deleteGoal(${index})">❌</button>
    `;
    goalsList.appendChild(li);
  });
}

function toggleGoal(index) {
  state.goals[index].done = !state.goals[index].done;
  saveState(state);
  renderGoals();
}

function deleteGoal(index) {
  state.goals.splice(index, 1);
  saveState(state);
  renderGoals();
}

function showMessage() {
  const el = document.getElementById("motivate");
  if (el) { el.textContent = MESSAGES[state.messageIndex % MESSAGES.length]; }
}

// --- 2. WATER TRACKER ---

const WATER_GOAL = 8; // Meta de 8 copos por dia

function renderWaterTracker() {
  const waterDisplay = document.getElementById("water-display");
  if (!waterDisplay) return;
  
  let display = '';
  if (state.waterCount === 0) {
      display = '<p class="water-placeholder">Beba seu primeiro copo! (0/8)</p>';
  } else {
      // 💧 = copo cheio, ▫️ = copo vazio
      const fullCups = '💧'.repeat(state.waterCount);
      const emptyCups = '▫️'.repeat(WATER_GOAL - state.waterCount);
      display = `<span class="water-cups">${fullCups}${emptyCups}</span> (${state.waterCount}/${WATER_GOAL})`;
  }

  waterDisplay.innerHTML = display;

  const addButton = document.getElementById("add-water-btn");
  if (addButton) {
      addButton.disabled = state.waterCount >= WATER_GOAL;
      addButton.textContent = state.waterCount >= WATER_GOAL ? "Meta Atingida! 🎉" : "+ 1 Copo";
  }
}

function addWater() {
  if (state.waterCount < WATER_GOAL) {
    state.waterCount++;
    saveState(state);
    renderWaterTracker();
  }
}

// --- 3. MOOD TRACKER ---

const MOODS = [
    { emoji: '😭', name: 'Triste' },
    { emoji: '😔', name: 'Desanimada' },
    { emoji: '😐', name: 'Neutro' },
    { emoji: '😊', name: 'Feliz' },
    { emoji: '😍', name: 'Apaixonada' },
];

function renderMoodTracker() {
    const moodEmojis = document.getElementById("mood-emojis");
    if (!moodEmojis) return;

    if (state.moodToday) {
        // Se o humor já foi escolhido, mostra apenas o escolhido
        const currentMood = MOODS.find(m => m.emoji === state.moodToday);
        moodEmojis.innerHTML = `<span style="font-size: 3.5em;">${currentMood.emoji}</span><p style="font-size: 1.1em; color: var(--accent); margin-top: 5px;">Você está se sentindo ${currentMood.name} hoje!</p>`;
        return;
    }
    
    // Se o humor não foi escolhido, mostra as opções
    moodEmojis.innerHTML = '';
    MOODS.forEach(mood => {
        const span = document.createElement('span');
        span.textContent = mood.emoji;
        span.title = mood.name;
        span.style.cursor = 'pointer';
        span.style.transition = 'transform 0.1s';
        span.onclick = () => setMood(mood.emoji);
        span.onmouseover = () => span.style.transform = 'scale(1.2)';
        span.onmouseout = () => span.style.transform = 'scale(1)';
        moodEmojis.appendChild(span);
    });
}

function setMood(emoji) {
    state.moodToday = emoji;
    saveState(state);
    renderMoodTracker();
}


// --- INICIALIZAÇÃO E EVENT LISTENERS ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mensagens: Listener para o botão 'Próxima Mensagem'
    const nextMsgBtn = document.getElementById("next-msg");
    if (nextMsgBtn) {
        nextMsgBtn.addEventListener("click", () => {
          state.messageIndex = (state.messageIndex + 1) % MESSAGES.length;
          saveState(state);
          showMessage();
        });
    }
    
    // 2. Metas: Listener para adicionar nova meta
    const newGoalInput = document.getElementById("new-goal");
    const addGoalBtn = document.getElementById("add-goal-btn"); // ID CORRETO
    if (addGoalBtn && newGoalInput) {
        addGoalBtn.addEventListener("click", () => {
            const v = newGoalInput.value.trim();
            if (v) {
                state.goals.push({text: v, done: false});
                newGoalInput.value = "";
                saveState(state);
                renderGoals();
            }
        });
        
        // Permite adicionar metas com a tecla Enter
        newGoalInput.addEventListener("keypress", (e) => {
             if (e.key === 'Enter') {
                 addGoalBtn.click();
                 e.preventDefault(); 
             }
        });
    }
    
    // 3. Hidratação: Listener para o botão 'Adicionar Copo'
    const addWaterBtn = document.getElementById("add-water-btn");
    if (addWaterBtn) {
        addWaterBtn.addEventListener("click", addWater);
    }

    // --- Renderização Inicial ---
    renderGoals();
    showMessage();
    renderWaterTracker();
    renderMoodTracker();
});