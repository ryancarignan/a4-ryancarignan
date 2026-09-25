import * as THREE from 'three';
import { Game } from './ts/Game';
import { debug } from './ts/utils';

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

  let startTime = 0;
  function animate(time: number) {
    let endTime = time;
    game.updateGameState(time);

    renderer.render(scene, game.getGameCamera());
    debug('fps', endTime - startTime);
    startTime = time;
  }

  renderer.setAnimationLoop(animate);
}

main();
