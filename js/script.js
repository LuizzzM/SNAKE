const tela = document.getElementById('gameCanvas');
const contexto = tela.getContext('2d');
const tamanhoGrade = 20;
const qtdGrade = tela.width / tamanhoGrade;

let cobra = [];
let cobraComputador = [];
let comida = {};
let pontuacao = 0;
let modoVersus = false;
let nomeJogador = '';
let jogoIniciado = false;

const velocidadeCobra = 5;
let ultimoTempoRenderizacao = 0;

class Cobra {
  constructor(x, y, corCabeca = '#FF007F', corCorpo = '#00FF00') {
    this.corpo = [{ x, y }];
    this.direcao = 'right';
    this.corCabeca = corCabeca;
    this.corCorpo = corCorpo;
  }
  desenhar() {
    this.corpo.forEach((segmento, indice) => {
      contexto.fillStyle = indice === 0 ? this.corCabeca : this.corCorpo;
      contexto.fillRect(segmento.x * tamanhoGrade, segmento.y * tamanhoGrade, tamanhoGrade - 2, tamanhoGrade - 2);
    });
  }
  mover() {
    const cabeca = { ...this.corpo[0] };
    switch (this.direcao) {
      case 'up':
        cabeca.y--;
        break;
      case 'down':
        cabeca.y++;
        break;
      case 'left':
        cabeca.x--;
        break;
      case 'right':
        cabeca.x++;
        break;
    }
    cabeca.x = (cabeca.x + qtdGrade) % qtdGrade;
    cabeca.y = (cabeca.y + qtdGrade) % qtdGrade;
    this.corpo.unshift(cabeca);
    this.corpo.pop();
  }
  verificarColisao() {
    const cabeca = this.corpo[0];
    return this.corpo.slice(1).some(segmento => segmento.x === cabeca.x && segmento.y === cabeca.y);
  }
}

function criarComida() {
  comida = {
    x: Math.floor(Math.random() * qtdGrade),
    y: Math.floor(Math.random() * qtdGrade)
  };
}

function desenharComida() {
  contexto.fillStyle = '#FFEE00';
  contexto.fillRect(comida.x * tamanhoGrade, comida.y * tamanhoGrade, tamanhoGrade - 2, tamanhoGrade - 2);
}

function atualizar() {
  if (!jogoIniciado) return;
  let comidaComida = false;
  
  cobra.mover();
  const cabeca = cobra.corpo[0];
  if (cabeca.x === comida.x && cabeca.y === comida.y) {
    aumentarTamanho(cobra);
    pontuacao += 10;
    document.getElementById('score').textContent = pontuacao;
    comidaComida = true;
  }
  
  if (modoVersus) {
    IAComputador();
    cobraComputador.mover();
    const cabecaComputador = cobraComputador.corpo[0];
    if (cabecaComputador.x === comida.x && cabecaComputador.y === comida.y) {
      aumentarTamanho(cobraComputador);
      comidaComida = true;
    }
  }
  
  if (comidaComida) {
    criarComida();
  }
  
  if (
    cobra.verificarColisao() ||
    (modoVersus && cobraComputador.verificarColisao()) ||
    (modoVersus && verificarColisaoEntreCobras(cobra, cobraComputador))
  ) {
    finalizarJogo();
  }
}

function aumentarTamanho(cobraObj) {
  const cauda = cobraObj.corpo[cobraObj.corpo.length - 1];
  let dx = 0, dy = 0;
  
  if (cobraObj.corpo.length > 1) {
    const penultimo = cobraObj.corpo[cobraObj.corpo.length - 2];
    dx = cauda.x - penultimo.x;
    dy = cauda.y - penultimo.y;
  } else {
    switch (cobraObj.direcao) {
      case 'up':    dx = 0;  dy = 1; break;
      case 'down':  dx = 0;  dy = -1; break;
      case 'left':  dx = 1;  dy = 0; break;
      case 'right': dx = -1; dy = 0; break;
    }
  }
  
  const novoSegmento = {
    x: (cauda.x + dx + qtdGrade) % qtdGrade,
    y: (cauda.y + dy + qtdGrade) % qtdGrade
  };
  
  cobraObj.corpo.push(novoSegmento);
}

function IAComputador() {
  const cabeca = cobraComputador.corpo[0];
  let novaDirecao = cobraComputador.direcao;
  
  if (comida.x > cabeca.x && cobraComputador.direcao !== 'left') novaDirecao = 'right';
  else if (comida.x < cabeca.x && cobraComputador.direcao !== 'right') novaDirecao = 'left';
  else if (comida.y > cabeca.y && cobraComputador.direcao !== 'up') novaDirecao = 'down';
  else if (comida.y < cabeca.y && cobraComputador.direcao !== 'down') novaDirecao = 'up';
  
  cobraComputador.direcao = novaDirecao;
}

function verificarColisaoEntreCobras(cobra1, cobra2) {
  const cabeca = cobra1.corpo[0];
  return cobra2.corpo.some(segmento => segmento.x === cabeca.x && segmento.y === cabeca.y);
}

function desenhar() {
  contexto.clearRect(0, 0, tela.width, tela.height);
  cobra.desenhar();
  if (modoVersus) cobraComputador.desenhar();
  desenharComida();
}

function gameLoop(tempoAtual) {
  if (!jogoIniciado) return;
  const segundosDesdeUltimo = (tempoAtual - ultimoTempoRenderizacao) / 1000;
  if (segundosDesdeUltimo < 1 / velocidadeCobra) {
    requestAnimationFrame(gameLoop);
    return;
  }
  ultimoTempoRenderizacao = tempoAtual;
  atualizar();
  desenhar();
  requestAnimationFrame(gameLoop);
}

function mudarDirecao(novaDirecao) {
  if (novaDirecao.startsWith('Arrow')) {
    novaDirecao = novaDirecao.replace('Arrow', '').toLowerCase();
  }
  const direcoesOpostas = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left'
  };
  if (direcoesOpostas[novaDirecao] !== cobra.direcao) {
    cobra.direcao = novaDirecao;
  }
}

function finalizarJogo() {
  jogoIniciado = false;
  document.getElementById('game-over').classList.remove('hidden');
  document.getElementById('final-score').textContent = pontuacao;
  document.getElementById('player-name').textContent = nomeJogador;
  document.getElementById('controls').style.display = 'none';
}

function iniciarJogo() {
  nomeJogador = document.getElementById('name-input').value || 'Jogador';
  modoVersus = document.getElementById('mode-btn').textContent.includes('Versus');
  cobra = new Cobra(5, 5, '#FF007F', '#00FF00');
  if (modoVersus) {
    cobraComputador = new Cobra(15, 15, '#00FFFF', '#FFFF00');
  }
  pontuacao = 0;
  document.getElementById('score').textContent = pontuacao;
  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('game-over').classList.add('hidden');
  document.getElementById('controls').style.display = 'grid';
  criarComida();
  jogoIniciado = true;
  ultimoTempoRenderizacao = 0;
  requestAnimationFrame(gameLoop);
}

document.getElementById('mode-btn').addEventListener('click', () => {
  modoVersus = !modoVersus;
  document.getElementById('mode-btn').textContent =
    `Modo: ${modoVersus ? 'Versus Computador' : 'Single Player'}`;
});

document.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault();
    mudarDirecao(e.key);
  }
});

document.getElementById('start-screen').classList.remove('hidden');
