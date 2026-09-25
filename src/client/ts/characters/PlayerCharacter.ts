import * as THREE from 'three';
import { Camera } from "../Camera";
import { Character } from "./Character";
import { Weapon } from '../Weapon';

export class PlayerCharacter extends Character {
  private static readonly CAMERA_ORIGIN = new THREE.Vector3(0, 2, 0);
  private static readonly WEAPON_OFFSET = new THREE.Vector3(-0.55, 0.25, 0.25);

  private camera: Camera;
  private weapon: Weapon;
  private grounded: boolean;

  public constructor(model: THREE.Object3D, camera: Camera, weapon: Weapon) {
    super(model);
    this.camera = camera;
    this.object.add(camera.getCamera());
    this.camera.setOrigin(PlayerCharacter.CAMERA_ORIGIN);
    this.weapon = weapon;
    this.model.add(weapon.getObject3D());
    this.weapon.setPosition(PlayerCharacter.WEAPON_OFFSET);
    this.grounded = false;
  }

  public updateRotation() {
    const cameraOffset = this.camera.getPosition();
    const playerLookDirection = new THREE.Vector3(-cameraOffset.x, 0, -cameraOffset.z);
    const weaponLookDirection = new THREE.Vector3().copy(cameraOffset).multiplyScalar(-1);

    if (playerLookDirection.lengthSq() === 0 || weaponLookDirection.lengthSq() === 0) {
      return;
    }

    const playerLookTarget = this.object.position.clone().add(playerLookDirection);
    const weaponLookTarget = this.model.position.clone().add(weaponLookDirection).add(PlayerCharacter.CAMERA_ORIGIN);
    weaponLookTarget.multiplyScalar(1000)

    this.model.lookAt(playerLookTarget);
    this.weapon.lookAt(weaponLookTarget);
  }

  override setPosition(position: THREE.Vector3) {
    super.setPosition(position);
    this.camera.setOrigin(position.clone().add(PlayerCharacter.CAMERA_ORIGIN));
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
      this.velocity.y -= 0.05 * deltaTime / 1000;
    }
  }

  public jump() {
    if (this.grounded) {
      this.velocity.y = 0.015;
      this.grounded = false;
    }
  }

  /**
   * Update the position of the character model (add velocity to position)
   */
  override updatePosition() {
    super.updatePosition();
    this.camera.setOrigin(
      this.object.position.clone().add(PlayerCharacter.CAMERA_ORIGIN)
    );

    if (this.object.position.y <= 0) {
      this.object.position.y = 0;
      this.velocity.y = 0;
      this.grounded = true;
    }
  }
}
