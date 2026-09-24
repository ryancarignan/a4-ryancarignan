import * as THREE from 'three';
import { Camera } from "../Camera";
import { Character } from "./Character";

export class PlayerCharacter extends Character {
  private static readonly CAMERA_ORIGIN = new THREE.Vector3(0, 2, 0);

  private camera: Camera;
  private grounded: boolean;

  public constructor(model: THREE.Object3D, camera: Camera) {
    super(model);
    this.camera = camera;
    this.object.add(camera.getCamera());
    this.camera.setOrigin(PlayerCharacter.CAMERA_ORIGIN);
    this.grounded = false;
  }

  public updateRotation() {
    const cameraOffset = this.camera.getPosition();
    const lookDirection = new THREE.Vector3(-cameraOffset.x, 0, -cameraOffset.z);

    if (lookDirection.lengthSq() === 0) {
      return;
    }

    const lookTarget = this.object.position.clone().add(lookDirection);
    this.model.lookAt(lookTarget);
  }

  override setPosition(position: THREE.Vector3) {
    super.setPosition(position);
    position.add(PlayerCharacter.CAMERA_ORIGIN)
    this.camera.setOrigin(position);
  }

  override setVelocity(velocity: THREE.Vector3) {
    const cameraPosition = this.camera.getPosition();
    const forward = new THREE.Vector3(-cameraPosition.x, 0, -cameraPosition.z);
    if (forward.lengthSq() > 0) {
      forward.normalize();
    } else {
      forward.set(0, 0, 1);
    }

    const right = new THREE.Vector3(-forward.z, 0, forward.x);

    const up = new THREE.Vector3(0, 1, 0);

    const newVelocity = new THREE.Vector3()
      .addScaledVector(right, velocity.x)
      .addScaledVector(up, velocity.y)
      .addScaledVector(forward, velocity.z);

    this.velocity.x = newVelocity.x;
    this.velocity.z = newVelocity.z;
  }

  public applyGravity(deltaTime: number) {
    if (!this.grounded) {
      this.velocity.y -= 2.5 * deltaTime / 1000;
    }
  }

  public jump() {
    if (this.grounded) {
      this.velocity.y = 0.5;
      this.grounded = false;
    }
  }

  /**
   * Update the position of the character model (add velocity to position)
   */
  override updatePosition() {
    super.updatePosition();
    this.camera.setOrigin(this.object.position.add(this.velocity));

    if (this.object.position.y <= 0) {
      this.object.position.y = 0;
      this.velocity.y = 0;
      this.grounded = true;
    }
  }
}
