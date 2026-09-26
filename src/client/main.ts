import * as THREE from 'three';
import { Game } from './ts/Game';
import { debug } from './ts/utils';

const GAME_TIME_SECONDS = 30;

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

// create a game object
async function main() {
  const game = await Game.create(renderer.domElement, gameWindowWidth, gameWindowHeight);
  scene.add(game.getGameObject());
  await game.start();
  let gameOverFlag = false;

  let startTime = 0;
  function animate(time: number) {
    let endTime = time;
    
    if (!gameOverFlag) game.updateGameState(time);

    renderer.render(scene, game.getGameCamera());

    if (debugOn) debug('fps', endTime - startTime);
    startTime = time;

    if (!gameOverFlag) setClock((time / 1000).toFixed(2));
    if (time / 1000 >= GAME_TIME_SECONDS) {
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
  const gameOver = document.createElement('div');
  gameOver.id = 'game-over';
  gameOver.innerText = `Game over! Score: ${score}`;
  document.body.appendChild(gameOver);
}

main();
