import * as THREE from 'three';

export class Character {
  protected model: THREE.Mesh;

  public debugOn = false;

  public constructor(model: THREE.Mesh) {
    this.model = model;
  }

  public getObject3D(): THREE.Object3D {
    return this.model;
  }
}