import * as THREE from 'three';
import { Game } from './ts/Game';

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

  function animate(time: number) {
    game.updateGameState();

    renderer.render(scene, game.getGameCamera());
  }

  renderer.setAnimationLoop(animate);
}

main();
