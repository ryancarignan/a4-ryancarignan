import * as THREE from 'three';

export class Character {
  protected model: THREE.Object3D;

  public debugOn = false;

  public constructor(model: THREE.Object3D) {
    this.model = model;
  }

  public getObject3D(): THREE.Object3D {
    return this.model;
  }
}