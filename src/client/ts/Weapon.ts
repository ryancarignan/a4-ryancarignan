import * as THREE from 'three';
import { degToRad } from './utils';

export class Weapon {
  private model: THREE.Object3D;

  public constructor(model: THREE.Object3D) {
    this.model = model;
  }

  public getObject3D() {
    return this.model;
  }

  public setPosition(pos: THREE.Vector3) {
    this.model.position.copy(pos);
  }

  public setRotation(rot: THREE.Euler) {
    this.model.rotation.copy(rot);
  }

  public lookAt(lookTarget: THREE.Vector3) {
    this.model.lookAt(lookTarget);
    this.model.rotateOnAxis(new THREE.Vector3(1, 0, 0), degToRad(90));
    this.model.rotateOnAxis(new THREE.Vector3(0, 1, 0), degToRad(-90));
  }
}
