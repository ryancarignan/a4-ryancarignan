import * as THREE from 'three';
import { Game } from './ts/Game';
import { debug } from './ts/utils';
import { LookMethod, MoveMethod } from './ts/types';

const GAME_TIME_SECONDS = 30;
let startTime: number | null = null;

// debug log settings
const debugOn = false;

// game window size
const gameWindowWidth = window.innerWidth;
const gameWindowHeight = window.innerHeight;

// create scene
const scene = new THREE.Scene();

// create renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(gameWindowWidth, gameWindowHeight);
document.body.appendChild(renderer.domElement);

// get user input
const settings = document.getElementById('settings');
const lookSensitivity = document.getElementById('lookSensitivity') as HTMLInputElement;
const targetCount = document.getElementById('targetCount') as HTMLInputElement;
const targetRadius = document.getElementById('targetRadius') as HTMLInputElement;

// create a game object
async function main(inputMethodValue = document.querySelector<HTMLInputElement>('input[name="inputMethod"]:checked')?.value ?? 'mk') {

  let lookMethod: LookMethod;
  let moveMethod: MoveMethod;
  switch (inputMethodValue) {
    case 'mk':
      lookMethod = 'mouse';
      moveMethod = 'keyboard';
      break;
    case 'st':
      lookMethod = 'stick';
      moveMethod = 'stick';
      break;
    default:
      lookMethod = 'mouse';
      moveMethod = 'keyboard'
      break;
  }

  const game = await Game.create(
    renderer.domElement,
    gameWindowWidth,
    gameWindowHeight,
    lookMethod,
    moveMethod,
    lookSensitivity?.valueAsNumber ?? 0,
    targetCount?.valueAsNumber ?? 1,
    targetRadius?.valueAsNumber ?? 0.75
  );
  scene.add(game.getGameObject());

  if (settings) document.body.removeChild(settings);

  await game.start();
  let gameOverFlag = false;
  let previousFrameTime: number | null = null;

  function animate(time: number) {
    if (startTime === null) startTime = time;
    
    if (!gameOverFlag) game.updateGameState(time);

    renderer.render(scene, game.getGameCamera());

    if (debugOn && previousFrameTime !== null) debug('fps', time - previousFrameTime);
    previousFrameTime = time;

    const gameTime = time - startTime;
    if (!gameOverFlag) setClock((gameTime / 1000).toFixed(2));
    if (!gameOverFlag && gameTime / 1000 >= GAME_TIME_SECONDS) {
      gameOver(game.getScore());
      gameOverFlag = true;
    }
  }

  renderer.setAnimationLoop(animate);
}

function setClock(time: string) {
  let clock = document.getElementById('clock') as HTMLDivElement;
  if (!clock) {
    clock = document.createElement('div');
    clock.id = 'clock';
    document.body.appendChild(clock);
  }
  clock.innerText = `Time: ${time}`;
}

function gameOver(score: number) {
  if (document.pointerLockElement) document.exitPointerLock();

  const gameOver = document.createElement('div');
  gameOver.id = 'game-over';
  const scoreText = document.createElement('div');
  scoreText.innerText = `Game over! Score: ${score}`;
  const restartButton = document.createElement('button');
  restartButton.type = 'button';
  restartButton.id = 'restart-game';
  restartButton.innerText = 'Restart Game';
  restartButton.addEventListener('click', () => window.location.reload());
  gameOver.append(scoreText, restartButton);
  document.body.appendChild(gameOver);
}

const startGameButton = document.getElementById('start-game') as HTMLButtonElement;
if (!startGameButton) {
  void main();
} else {
  startGameButton.addEventListener('click', () => {
    const inputMethod = document.querySelector<HTMLInputElement>('input[name="inputMethod"]:checked');
    if (inputMethod?.value === 'mk') {
      void renderer.domElement.requestPointerLock().catch((error: unknown) => {
        console.warn('Unable to lock pointer:', error);
      });
    }
    void main(inputMethod?.value);
  });
}
