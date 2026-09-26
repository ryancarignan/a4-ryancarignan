import * as THREE from 'three';
import { degToRad } from './utils';

export class Weapon {
  private static readonly DEFAULT_RANGE = 100;

  private model: THREE.Object3D;
  private range: number;
  private lookTarget?: THREE.Vector3;

  public constructor(model: THREE.Object3D, range?: number) {
    this.model = model;
    this.range = range ?? Weapon.DEFAULT_RANGE;
  }

  public getObject3D() {
    return this.model;
  }

  public getRange() {
    return this.range;
  }

  public setRange(range: number) {
    this.range = range;
  }

  public setPosition(pos: THREE.Vector3) {
    this.model.position.copy(pos);
  }

  public setRotation(rot: THREE.Euler) {
    this.model.rotation.copy(rot);
  }

  public lookAt(lookTarget: THREE.Vector3) {
    this.lookTarget = lookTarget;
    this.model.lookAt(lookTarget);
    this.model.rotateOnAxis(new THREE.Vector3(1, 0, 0), degToRad(90));
    this.model.rotateOnAxis(new THREE.Vector3(0, 1, 0), degToRad(-90));
  }

  public getLookTarget() {
    if (this.lookTarget) return this.lookTarget.clone();
    return new THREE.Vector3(0, 0, -1).applyEuler(this.model.rotation); // dunno if this actually works
  }
}
