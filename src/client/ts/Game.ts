import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/Addons.js';
import { Camera } from './Camera';
import { debug, degToRad, extractErrorMessage } from './utils';
import { PlayerCharacter } from './characters/PlayerCharacter';
import { Controller } from './Controller';
import { Map } from './Map';
import { Weapon } from './Weapon';
import { Character } from './characters/Character';

export class Game {

  public debugOn = true;

  private game: THREE.Object3D;
  private camera: Camera;
  private controller: Controller;
  private player: PlayerCharacter;
  private targets: Character[];
  private map: Map;
  private previousTime;

  private constructor(canvas: HTMLCanvasElement, gameWindowWidth: number, gameWindowHeight: number, playerMesh: THREE.Object3D) {
    this.game = new THREE.Object3D();
    this.camera = new Camera(gameWindowWidth, gameWindowHeight);
    this.camera.debugOn = true;
    this.controller = new Controller(canvas, 'stick', 'stick');
    const weaponModel = Game.createFallbackWeaponMesh();
    const weapon = new Weapon(weaponModel);
    this.player = new PlayerCharacter(playerMesh, this.camera, weapon);
    this.game.add(this.player.getObject3D());
    const target1 = new Character(this.createFallbackTargetMesh());
    const target2 = new Character(this.createFallbackTargetMesh());
    target1.setPosition(new THREE.Vector3(8, 4, 0));
    target2.setPosition(new THREE.Vector3(8, 4, 3));
    this.targets = [];
    this.addTarget(target1);
    this.addTarget(target2);
    this.map = new Map();
    this.previousTime = 0;
    this.createReticle();
  }

  public static async create(canvas: HTMLCanvasElement, gameWindowWidth: number, gameWindowHeight: number): Promise<Game> {
    const loader = new FBXLoader();
    const inklingFilepath = '/Player01/Player01.fbx';
    const playerMesh = await Game.loadModel(loader, inklingFilepath) ?? Game.createFallbackPlayerMesh();
    return new Game(canvas, gameWindowWidth, gameWindowHeight, playerMesh);
  }

  private static createFallbackPlayerMesh(): THREE.Object3D {
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

  private static createFallbackWeaponMesh(): THREE.Object3D {
    const barrelGeometry = new THREE.CylinderGeometry(0.045, 0.05, 2);
    const stockGeometry = new THREE.BoxGeometry(0.15, 1, 0.125);
    const gripGeometry = new THREE.BoxGeometry(0.3, 0.06, 0.06);
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 2, 0), new THREE.Vector3(0, 100, 0)]);

    const material = new THREE.MeshPhongMaterial({ color: 0x6C5B7B, side: THREE.DoubleSide });
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xF67280 });

    const barrel = new THREE.Mesh(barrelGeometry, material);
    const stock = new THREE.Mesh(stockGeometry, material);
    const grip = new THREE.Mesh(gripGeometry, material);
    const line = new THREE.Line(lineGeometry, lineMaterial);

    barrel.position.y = 1;
    stock.position.y = -0.25;
    grip.position.x = 0.1;
    grip.rotation.z = degToRad(-20);

    const object = new THREE.Object3D();
    object.add(barrel, stock, grip); // TODO add line back when zeroing properly
    return object;
  }

  private createReticle() {
    const CANVAS_WIDTH = 50;
    const CANVAS_HEIGHT = 50;
    const CANVAS_X_CENTER = CANVAS_WIDTH / 2;
    const CANVAS_Y_CENTER = CANVAS_HEIGHT / 2;
    const RETICLE_WIDTH = 20;
    const RETICLE_HEIGHT = 20;

    const reticle = document.createElement('canvas');
    reticle.id = 'reticle';
    reticle.width = CANVAS_WIDTH;
    reticle.height = CANVAS_HEIGHT;

    const ctx = reticle.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(CANVAS_X_CENTER, CANVAS_Y_CENTER + RETICLE_HEIGHT / 2);
    ctx.lineTo(CANVAS_X_CENTER, CANVAS_Y_CENTER - RETICLE_HEIGHT / 2);
    ctx.moveTo(CANVAS_X_CENTER + RETICLE_WIDTH / 2, CANVAS_Y_CENTER);
    ctx.lineTo(CANVAS_X_CENTER - RETICLE_WIDTH / 2, CANVAS_Y_CENTER);
    ctx.stroke();

    document.body.appendChild(reticle);
  }

  private createFallbackTargetMesh(): THREE.Object3D {
    const geometry = new THREE.SphereGeometry(0.75, 8, 8);
    geometry.scale(0.5, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0xF8B195, side: THREE.DoubleSide });
    const target = new THREE.Mesh(geometry, material);
    return target;
  }

  private addTarget(target: Character) {
    this.targets.push(target);
    this.game.add(target.getObject3D());
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

    if (this.controller.getFire()) {
      for (const target of this.targets) {
        if (this.player.hitTarget(target.getObject3D())) {
          if (this.debugOn) {
            debug('hit-target', true);
            this.moveTarget(target);
          }
        }
      }
    }
  }

  private moveTarget(target: Character) {
    const x = 8;
    const y = Math.random() * (6 - 1) + 1;
    const z = Math.random() * (6 - -6) + -6
    target.setPosition(new THREE.Vector3(x, y, z));
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
