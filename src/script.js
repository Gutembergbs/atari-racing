// --- CONFIGURAÇÕES E ESTADO ---
const container = document.getElementById('game-container');
const car = document.getElementById('player-car');
const distDisplay = document.getElementById('dist-val');
const sky = document.getElementById('sky');

const lineCount = 150;
const lines = [];
let keys = {};

// Física
let speed = 0, playerX = 0, targetX = 0, offset = 0;
const maxSpeed = 6, acceleration = 0.0015, friction = 0.98;

// Pista e Obstáculos
let roadCurve = 0, targetCurve = 0, curveTimer = 0;
let npcs = [];
const maxNpcs = 3;

// --- INICIALIZAÇÃO ---
function init() {
    // Criar linhas da estrada
    for (let i = 0; i < lineCount; i++) {
        const line = document.createElement('div');
        line.className = 'road-line';
        container.appendChild(line);
        lines.push(line);
    }

    // Criar slots de NPCs
    for (let i = 0; i < maxNpcs; i++) {
        let el = document.createElement('div');
        el.className = 'npc-car';
        el.innerHTML = '<div style="width:80%; height:10px; background:#444; margin:5px auto; border-radius:2px"></div>';
        container.appendChild(el);
        npcs.push({ element: el, x: 0, z: -1, active: false, npcSpeed: 0 });
    }

    window.addEventListener('keydown', e => keys[e.key] = true);
    window.addEventListener('keyup', e => keys[e.key] = false);
    
    update();
}

// --- FUNÇÕES REUTILIZÁVEIS ---

function updatePhysics() {
    const offRoad = Math.abs(playerX) > 0.45;

    // Aceleração e Atrito
    if (keys['ArrowUp']) speed += acceleration;
    else speed *= friction;

    if (offRoad) {
        speed *= 0.98;
        if (speed > 0.5) car.classList.add('shake');
    } else {
        car.classList.remove('shake');
    }

    speed = Math.max(0, Math.min(speed, maxSpeed));
    offset -= speed;

    // Movimentação Lateral e Curva
    curveTimer -= speed;
    if (curveTimer <= 0) {
        targetCurve = [-380, 0, 380][Math.floor(Math.random() * 3)];
        curveTimer = 1500 + Math.random() * 2000;
    }
    roadCurve += (targetCurve - roadCurve) * (speed * 0.0015);
    
    // Força centrífuga e Input do Jogador
    targetX -= (roadCurve / 350) * (speed * 0.004); 
    if (keys['ArrowLeft']) targetX -= 0.015;
    if (keys['ArrowRight']) targetX += 0.015;
    playerX += (targetX - playerX) * 0.08;
}

function updateEnvironment() {
    const distance = Math.floor(Math.abs(offset / 10));
    distDisplay.innerText = distance;

    // Sistema de Ciclo a cada 1000m
    // 0-999: Dia, 1000-1999: Tarde, 2000-2999: Noite, 3000-3999: Neve
    const cycle = Math.floor(distance / 1000) % 4;
    
    switch(cycle) {
        case 0: // DIA
            sky.style.background = 'linear-gradient(#4080ff, #afeeee)';
            container.style.background = '#1a5e1a'; // Grama verde
            break;
        case 1: // TARDE
            sky.style.background = 'linear-gradient(#ff4500, #ff8c00)';
            container.style.background = '#4d2600'; // Grama seca
            break;
        case 2: // NOITE
            sky.style.background = 'linear-gradient(#000010, #101030)';
            container.style.background = '#051a05'; // Grama escura
            break;
        case 3: // NEVE
            sky.style.background = 'linear-gradient(#abc, #fff)';
            container.style.background = '#f0f0f0'; // Neve
            break;
    }
}

function renderRoad() {
    lines.forEach((line, i) => {
        let p = i / lineCount; 
        let perspectiveY = 200 + (p * 300);
        let width = 30 + (p * 850);
        let isDark = (Math.floor((i * 0.5) + (offset * 0.2)) % 2 === 0);
        
        line.style.background = isDark ? '#444' : '#323232';
        let sideColor = isDark ? '#fff' : '#f00';
        
        // Ajuste visual para Noite (Zebra brilha menos) ou Neve (Zebra azulada)
        const cycle = Math.floor(Math.floor(Math.abs(offset / 10)) / 1000) % 4;
        if(cycle === 2) line.style.opacity = "0.7"; else line.style.opacity = "1";

        line.style.borderLeft = `${Math.max(2, p * 20)}px solid ${sideColor}`;
        line.style.borderRight = `${Math.max(2, p * 20)}px solid ${sideColor}`;
        
        let curveFactor = Math.pow(1 - p, 3);
        let xShift = (curveFactor * roadCurve) - (playerX * p * 400);
        
        line.style.width = width + 'px';
        line.style.top = perspectiveY + 'px';
        line.style.transform = `translateX(calc(-50% + ${xShift}px))`;
    });
}

function updateNPCs() {
    let activeNpcs = npcs.filter(n => n.active).length;

    npcs.forEach(npc => {
        // Nascimento do NPC
        if (!npc.active && activeNpcs === 0 && speed > 0.5 && Math.random() < 0.01) {
            npc.active = true;
            npc.z = 1.0; // Inicia no horizonte virtual
            npc.x = (Math.random() * 1.0) - 0.5;
            npc.npcSpeed = speed * 0.5;
            npc.element.style.display = 'block';
            npc.element.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 40%)`;
            npc.element.style.boxShadow = "none";
        }

        if (npc.active) {
            let relativeSpeed = (speed - npc.npcSpeed) * 0.002;
            npc.z -= relativeSpeed;

            // Detecção de colisão (mantida a lógica anterior refinada)
            if (npc.z <= 0.12 && npc.z > -0.08) {
                let dx = npc.x - playerX;
                if (Math.abs(dx) < 0.28) { 
                    speed *= 0.2;
                    npc.npcSpeed += 1.2;
                    npc.element.style.boxShadow = "0 0 30px yellow";
                    if (dx > 0) { targetX -= 0.15; npc.x += 0.1; }
                    else { targetX += 0.15; npc.x -= 0.1; }
                    if (npc.z > 0) speed = 0;
                }
            }

            // AJUSTE DE SUMIÇO E POSIÇÃO Y
            if (npc.z < -0.5 || npc.z > 1.0) {
                npc.active = false;
                npc.element.style.display = 'none';
            } else {
                let p = Math.max(0.01, 1 - npc.z);
                
                // AJUSTE SOLICITADO: Subtraímos 20px do cálculo de Y para elevar o ponto de fuga
                // O (1-p) garante que a elevação seja maior quanto mais longe o carro estiver
                let horizonOffset = (1 - p) * 20; 
                let perspectiveY = (200 - horizonOffset) + (p * 300); 

                let scale = 0.05 + (p * 0.95);
                let curveFactor = Math.pow(1 - p, 3);
                let xShift = (curveFactor * roadCurve) - (playerX * p * 400);
                let npcScreenX = 400 + xShift + (npc.x * p * 400);

                // Aplica a nova posição vertical
                npc.element.style.top = (perspectiveY - (40 * scale)) + 'px';
                npc.element.style.left = npcScreenX + 'px';
                npc.element.style.transform = `translateX(-50%) scale(${scale})`;
                npc.element.style.zIndex = Math.floor(p * 100);
            }
        }
    });
}

function updatePlayerView() {
    car.style.left = `calc(50% + ${playerX * 300}px)`;
    car.style.transform = `translateX(-50%) rotate(${(targetX - playerX) * 80}deg)`;
}

// --- LOOP PRINCIPAL ---
function update() {
    updatePhysics();
    updateEnvironment();
    renderRoad();
    updateNPCs();
    updatePlayerView();

    requestAnimationFrame(update);
}

// Iniciar o Game
init();