import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/Addons.js';
import { Camera } from './Camera';
import { debug, extractErrorMessage } from './utils';
import { PlayerCharacter } from './characters/PlayerCharacter';
import { Controller } from './Controller';

export class Game {

  public debugOn = false;

  private game: THREE.Object3D;
  private camera: Camera;
  private controller: Controller;
  private player: PlayerCharacter;

  private constructor(canvas: HTMLCanvasElement, gameWindowWidth: number, gameWindowHeight: number, playerMesh: THREE.Object3D) {
    this.game = new THREE.Object3D();
    this.camera = new Camera(gameWindowWidth, gameWindowHeight);
    this.camera.debugOn = true;
    this.controller = new Controller(canvas, 'mouse', 'keyboard');
    this.player = new PlayerCharacter(playerMesh, this.camera);
    this.game.add(this.player.getObject3D());
  }

  public static async create(canvas: HTMLCanvasElement, gameWindowWidth: number, gameWindowHeight: number): Promise<Game> {
    const loader = new FBXLoader();
    const inklingFilepath = '/Player01/Player01.fbx';
    const playerMesh = await Game.loadModel(loader, inklingFilepath) ?? Game.createFallbackMesh();
    return new Game(canvas, gameWindowWidth, gameWindowHeight, playerMesh);
  }

  private static createFallbackMesh(): THREE.Object3D {
    const r = 1;
    const geometry = new THREE.BoxGeometry(1, 2, 1.2);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffbb });
    return new THREE.Mesh(geometry, material);
  }

  public getGameObject(): THREE.Object3D {
    return this.game;
  }

  public getGameCamera(): THREE.PerspectiveCamera {
    return this.camera.getCamera();
  }

  public updateGameState() {
    this.controller.read();
    //this.camera.moveAbsolute(window.innerWidth / 2 + 1 * this.controller.getLookX(), window.innerHeight / 2 + 1 * this.controller.getLookY());
    this.camera.moveRelative(this.controller.getLookX(), this.controller.getLookY());
    this.controller.debugOn = true;
    this.camera.updateCameraPosition();
  }

  private static async loadModel(loader: FBXLoader, filepath: string): Promise<THREE.Object3D | undefined> {
    try {
      return await loader.loadAsync(filepath);
    } catch (error) {
      const errorMessage = extractErrorMessage(error, 'Unknown error from loadModel');
      debug('load-error', errorMessage);
      console.log(error);
      return undefined;
    }
  }

  public start() {
    // receive mouse movements for camera control
    // document.addEventListener('mousemove', (event: MouseEvent) => {
    //   this.camera.moveAbsolute(event.clientX, event.clientY);
    //   if (this.debugOn) {
    //     debug('mouseX', event.clientX);
    //     debug('mouseY', event.clientY);
    //   }
    // });

    window.addEventListener("gamepadconnected", (e) => {
      console.log(
        "Gamepad connected at index %d: %s. %d buttons, %d axes.",
        e.gamepad.index,
        e.gamepad.id,
        e.gamepad.buttons.length,
        e.gamepad.axes.length,
      );
    });
  }
}
