import * as THREE from 'three';
import { Camera } from './ts/Camera';
import { debug } from './ts/utils';
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
const game = new Game(gameWindowWidth, gameWindowHeight);
scene.add(game.getGameObject());
game.start();

function animate(time: number) {
  game.updateGameState();

  renderer.render(scene, game.getGameCamera());
}

renderer.setAnimationLoop(animate);
