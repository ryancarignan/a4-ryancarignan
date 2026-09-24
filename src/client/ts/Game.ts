import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/Addons.js';
import { Camera } from './Camera';
import { debug, degToRad, extractErrorMessage } from './utils';
import { PlayerCharacter } from './characters/PlayerCharacter';
import { Controller } from './Controller';
import { Map } from './Map';

export class Game {

  public debugOn = false;

  private game: THREE.Object3D;
  private camera: Camera;
  private controller: Controller;
  private player: PlayerCharacter;
  private map: Map;
  private previousTime;

  private constructor(canvas: HTMLCanvasElement, gameWindowWidth: number, gameWindowHeight: number, playerMesh: THREE.Object3D) {
    this.game = new THREE.Object3D();
    this.camera = new Camera(gameWindowWidth, gameWindowHeight);
    this.camera.debugOn = true;
    this.controller = new Controller(canvas, 'mouse', 'keyboard');
    this.player = new PlayerCharacter(playerMesh, this.camera);
    this.game.add(this.player.getObject3D());
    this.map = new Map();
    this.previousTime = 0;
  }

  public static async create(canvas: HTMLCanvasElement, gameWindowWidth: number, gameWindowHeight: number): Promise<Game> {
    const loader = new FBXLoader();
    const inklingFilepath = '/Player01/Player01.fbx';
    const playerMesh = await Game.loadModel(loader, inklingFilepath) ?? Game.createFallbackMesh();
    return new Game(canvas, gameWindowWidth, gameWindowHeight, playerMesh);
  }

  private static createFallbackMesh(): THREE.Object3D {
    const bodyGeometry = new THREE.CapsuleGeometry(0.5, 1, 4, 12);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xF67280, side: THREE.DoubleSide })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);

    const eyeGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.3);
    const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0xC06C84, side: THREE.DoubleSide })
    const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eye1.position.set(0.15, 0.6, 0.35);
    eye1.rotation.x = degToRad(90);
    const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eye2.position.set(-0.15, 0.6, 0.35);
    eye2.rotation.x = degToRad(90);

    const object = new THREE.Object3D();
    object.add(body, eye1, eye2);
    return object;
  }

  public getGameObject(): THREE.Object3D {
    return this.game;
  }

  public getGameCamera(): THREE.PerspectiveCamera {
    return this.camera.getCamera();
  }

  public updateGameState(time: number) {
    const deltaTime = (this.previousTime === 0)
      ? 0
      : (time - this.previousTime);
    this.previousTime = time;

    this.controller.read();
    //this.camera.moveAbsolute(window.innerWidth / 2 + 1 * this.controller.getLookX(), window.innerHeight / 2 + 1 * this.controller.getLookY());
    this.camera.moveRelative(this.controller.getLookX(), this.controller.getLookY());
    this.controller.debugOn = true;

    const velocity = new THREE.Vector3(this.controller.getMoveX(), 0, this.controller.getMoveY());
    velocity.multiplyScalar(0.02);
    this.player.setVelocity(velocity);

    if (this.controller.getJump()) {
      this.player.jump();
    }
    this.player.applyGravity(deltaTime);

    this.player.updatePosition();
    this.camera.updateCameraPosition();
    this.player.updateRotation();
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

  public async start() {
    await this.map.loadMap('trainingRoom.json');
    this.game.add(this.map.getMap());
  }
}
