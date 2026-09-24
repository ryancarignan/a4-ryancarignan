import * as THREE from 'three';

export class Character {
  protected model: THREE.Object3D;
  protected velocity: THREE.Vector3;

  public debugOn = false;

  public constructor(model: THREE.Object3D, position?: THREE.Vector3) {
    this.model = model;
    position = (position === undefined) ? new THREE.Vector3(0, 0, 0) : position;
    this.model.position.copy(position);
    this.velocity = new THREE.Vector3(0, 0, 0);
  }

  public getObject3D(): THREE.Object3D {
    return this.model;
  }

  public setPosition(position: THREE.Vector3) {
    this.model.position.copy(position);
  }

  public setVelocity(velocity: THREE.Vector3) {
    this.velocity.copy(velocity);
  }

  public setRotation(rotation: THREE.Euler) {
    this.model.rotation.copy(rotation);
  }

  /**
   * Update the position of the character model (add velocity to position)
   */
  public updatePosition() {
    this.model.position.add(this.velocity);
  }
}
