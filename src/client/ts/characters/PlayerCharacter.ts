import * as THREE from 'three';
import { Camera } from "../Camera";
import { Character } from "./Character";

export class PlayerCharacter extends Character {
  private static readonly CAMERA_ORIGIN = new THREE.Vector3(0, 2, 0);

  private camera: Camera;

  public constructor(model: THREE.Object3D, camera: Camera) {
    super(model);
    this.camera = camera;
    this.camera.setOrigin(PlayerCharacter.CAMERA_ORIGIN);
  }

  public updateRotation() {
    const camPos = this.camera.getPosition();
    camPos.multiply(new THREE.Vector3(-1, 0, -1)); // opposite direction of camera, except y always 0
    this.model.lookAt(camPos);
  }

  override setPosition(position: THREE.Vector3) {
    super.setPosition(position);
    this.camera.setOrigin(position.add(PlayerCharacter.CAMERA_ORIGIN));
  }

  /**
   * Update the position of the character model (add velocity to position)
   */
  override updatePosition() {
    super.updatePosition();
    this.camera.setOrigin(this.model.position.add(this.velocity));
  }
}
