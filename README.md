# 🏎️ Retro Road Racer (JS Engine)

Um motor de jogo de corrida pseudo-3D inspirado nos clássicos de fliperama (como OutRun), desenvolvido inteiramente com **JavaScript Vanilla**. O projeto foca em cálculos matemáticos de perspectiva, simulação de física e manipulação dinâmica de elementos do DOM para criar uma sensação de velocidade e profundidade.

## 🔗 Demonstração

Você pode testar suas habilidades de piloto aqui:
👉 ** **

## 🚀 Funcionalidades

* **Motor de Perspectiva Pseudo-3D:** Renderização de estrada baseada em linhas com cálculos de curvatura dinâmica.
* **Ciclo de Ambiente Dinâmico:** O cenário muda a cada 1000m percorridos (Dia, Tarde, Noite e Neve), alterando cores e iluminação.
* **Física de Pilotagem:** Sistema de aceleração, atrito, força centrífuga em curvas e efeito de vibração (*shake*) ao sair da pista.
* **IA de Tráfego (NPCs):** Carros adversários surgem no horizonte com cores aleatórias, velocidades variadas e detecção de colisão.
* **Feedback Visual:** O carro inclina lateralmente conforme a direção e reage visualmente a impactos.

## 🛠️ Tecnologias Utilizadas

* **HTML5:** Estrutura base e containers para o cenário e interface de distância.
* **CSS3:** Estilização, gradientes dinâmicos para o céu e animações de colisão.
* **JavaScript (Vanilla):** Lógica de física, gerenciamento de estados, `requestAnimationFrame` para o loop principal e manipulação do DOM.

## 📂 Estrutura do Projeto

```text
├── assets/
│   └── style.css      # Estilização do cenário, carros e filtros de clima
├── src/
│   └── script.js      # Core Engine: Física, NPCs e Renderização
├── index.html         # Ponto de entrada e containers do jogo
└── README.md          # Documentação do projeto
```
## 🔧 Como Executar
Faça o download ou clone este repositório.

Certifique-se de que a estrutura de pastas está correta conforme a árvore acima.

Abra o arquivo index.html em qualquer navegador moderno.

Controles: * Seta para Cima: Acelerar

Seta para Esquerda / Direita: Mover o carro

## 🧠 Lógica do Motor (Script)
O projeto utiliza funções modulares para manter o desempenho:

updatePhysics(): Gerencia a velocidade real vs. atrito e calcula a posição lateral do jogador.

renderRoad(): Cria a ilusão de profundidade através de cálculos de perspectiva aplicados a cada linha da estrada.

updateEnvironment(): Gerencia a troca de "biomas" (cores do céu e grama) baseada na distância percorrida.

updateNPCs(): Controla o ciclo de vida dos carros adversários, desde o nascimento no horizonte até a física de colisão.

Desenvolvido com 💙 por Gutemberg
