import * as THREE from 'three';
import { Camera } from "../Camera";
import { Character } from "./Character";

export class PlayerCharacter extends Character {
  private camera: Camera;

  public constructor(model: THREE.Mesh, camera: Camera) {
    super(model);
    this.camera = camera;
    this.model.add(this.camera.getCamera());
    this.camera.setOrigin(new THREE.Vector3(0, 2, 0));
  }
}