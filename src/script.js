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

// --- AABB ---
function checkAABB(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function getPlayerHitbox() {
    const r = car.getBoundingClientRect();
    return {
        x: r.left,
        y: r.top,
        width: r.width,
        height: r.height
    };
}

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
    const playerBox = getPlayerHitbox();

    npcs.forEach(npc => {
        if (!npc.active && speed > 0.5 && Math.random() < 0.01) {
            npc.active = true;
            npc.z = 1;
            npc.x = Math.random() - 0.5;
            npc.npcSpeed = speed * 0.5;
            npc.element.style.display = 'block';
        }

        if (!npc.active) return;

        npc.z -= (speed - npc.npcSpeed) * 0.002;

        if (npc.z < -0.5 || npc.z > 1) {
            npc.active = false;
            npc.element.style.display = 'none';
            return;
        }

        let p = Math.max(0.01, 1 - npc.z);
        let scale = 0.05 + (p * 0.95);
        let curveFactor = Math.pow(1 - p, 3);
        let xShift = (curveFactor * roadCurve) - (playerX * p * 400);
        let x = 400 + xShift + (npc.x * p * 400);
        let y = 200 + (p * 300);

        npc.element.style.left = x + 'px';
        npc.element.style.top = y + 'px';
        npc.element.style.transform = `translateX(-50%) scale(${scale})`;
        npc.element.style.zIndex = Math.floor(p * 100);

        // --- HITBOX NPC ---
        const r = npc.element.getBoundingClientRect();
        const npcBox = { x: r.left, y: r.top, width: r.width, height: r.height };

        // --- COLISÃO AABB ---
        if (checkAABB(playerBox, npcBox)) {
            speed *= 0.2;
            npc.npcSpeed += 1.2;
            npc.element.style.boxShadow = "0 0 25px red";

            if (npcBox.x > playerBox.x) targetX -= 0.15;
            else targetX += 0.15;
        } else {
            npc.element.style.boxShadow = "none";
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