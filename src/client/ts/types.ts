import * as THREE from 'three';

export type LookMethod = 'mouse' | 'stick' | 'gyro';
export type MoveMethod = 'keyboard' | 'stick';
export type ControllerInput = 'moveY' | 'moveX' | 'lookY' | 'lookX' | 'jump' | 'swim' | 'fire';
export type ControllerLayout = 'switchPro' | 'xboxOne';
export type ControllerButtonMap = {
  moveX: number,
  moveY: number,
  lookX: number,
  lookY: number,
  jump: number,
  swim: number,
  fire: number,
};
export type ControllerInputs = {
  moveX: number,
  moveY: number,
  lookX: number,
  lookY: number,
  jump: boolean,
  swim: boolean,
  fire: boolean,
};
export type Vector3DTO = {
  x: number,
  y: number,
  z: number,
};
export type BoxGeometryDTO = {
  width: number,
  height: number,
  depth: number,
};
export type SphereGeometryDTO = {
  radius: number,
  widthSegments: number,
  heightSegments: number,
};
export type PlaneGeometryDTO = {
  width: number,
  height: number,
}
export type LightDTO = {
  name?: string,
  pos: Vector3DTO,
  lookAt: Vector3DTO,
  color: THREE.ColorRepresentation,
  intensity: number,
};
export type ColliderDTO = {
  name?: string,
  pos: Vector3DTO,
  geometryType: 'box' | 'sphere' | 'plane',
  geometry: BoxGeometryDTO | SphereGeometryDTO | PlaneGeometryDTO,
  material: THREE.MeshPhongMaterialParameters,
  rotation?: Vector3DTO,
}
export type MapDTO = {
  lights: LightDTO[],
  colliders: ColliderDTO[],
};
