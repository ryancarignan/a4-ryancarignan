import * as THREE from 'three';
import { Camera } from './Camera';
import { debug } from './utils';
import { PlayerCharacter } from './characters/PlayerCharacter';

export class Game {

  public debugOn = false;

  private game: THREE.Object3D;
  private camera: Camera;
  private player: PlayerCharacter;

  public constructor(gameWindowWidth: number, gameWindowHeight: number) {
    this.game = new THREE.Object3D();
    this.camera = new Camera(gameWindowWidth, gameWindowHeight);

    // create test cube mesh for the player
    let playerMesh: THREE.Mesh;
    {
      const r = 1;
      const d = r * 2
      const geometry = new THREE.BoxGeometry(d, d, d);
      const material = new THREE.MeshBasicMaterial({ color: 0xffffbb});
      playerMesh = new THREE.Mesh(geometry, material);
    }
    this.player = new PlayerCharacter(playerMesh, this.camera);
    this.game.add(this.player.getObject3D());
  }

  public getGameObject(): THREE.Object3D {
    return this.game;
  }

  public getGameCamera(): THREE.PerspectiveCamera {
    return this.camera.getCamera();
  }

  public updateGameState() {
    this.camera.updateCameraPosition();
  }

  public start() {
    // receive mouse movements for camera control
    document.addEventListener('mousemove', (event: MouseEvent) => {
      this.camera.moveAbsolute(event.clientX, event.clientY);
      if (this.debugOn) {
        debug('mouseX', event.clientX);
        debug('mouseY', event.clientY);
      }
    });
  }
}
