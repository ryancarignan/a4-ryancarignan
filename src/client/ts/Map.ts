import * as THREE from 'three';
import type { BoxGeometryDTO, MapDTO, PlaneGeometryDTO, SphereGeometryDTO } from './types';
import { degToRad, dtoToVector3 } from './utils';

export class Map {
  private lights: THREE.DirectionalLight[];
  private colliders: THREE.Object3D[];
  private map: THREE.Object3D; // Parent object to all others

  public constructor() {
    this.lights = [];
    this.colliders = [];
    this.map = new THREE.Object3D();
  }

  /**
   * Get the map object (and its children).
   * @returns Object3D parent of all the maps objects
   */
  public getMap(): THREE.Object3D {
    return this.map;
  }

  /**
   * Clear the map and all its children.
   */
  public clearMap() {
    this.lights = [];
    this.colliders = [];
    this.map = new THREE.Object3D();
  }

  private isBoxGeometryDTO(geometryDTO: unknown): geometryDTO is BoxGeometryDTO {
    return (
      typeof geometryDTO === 'object' &&
      geometryDTO !== null &&
      'width' in geometryDTO &&
      'height' in geometryDTO &&
      'depth' in geometryDTO
    );
  }

  private isPlaneGeometryDTO(geometryDTO: unknown): geometryDTO is PlaneGeometryDTO {
    return (
      typeof geometryDTO === 'object' &&
      geometryDTO !== null &&
      'width' in geometryDTO &&
      'height' in geometryDTO
    );
  }

  private isSphereGeometryDTO(geometryDTO: unknown): geometryDTO is SphereGeometryDTO {
    return (
      typeof geometryDTO === 'object' &&
      geometryDTO !== null &&
      'radius' in geometryDTO &&
      'widthSegments' in geometryDTO &&
      'heightSegments' in geometryDTO
    );
  }

  /**
   * Loads a JSON MapDTO into the map.
   * @param filename filename of the JSON map in /public
   */
  public async loadMap(filename: string) {
    const response = await fetch(filename);
    if (!response.ok) {
      throw new Error(`Could not load map ${filename}: ${response.status} ${response.statusText}`);
    }

    const mapData = await response.json() as MapDTO;
    this.clearMap();

    const ambientLight = new THREE.AmbientLight(0x404040, 0.3)
    this.map.add(ambientLight);

    for (const light of mapData.lights) {
      this.createLight(
        new THREE.Vector3(light.pos.x, light.pos.y, light.pos.z),
        new THREE.Vector3(light.lookAt.x, light.lookAt.y, light.lookAt.z),
        light.color,
        light.intensity,
      );
    }

    for (const collider of mapData.colliders) {
      const dtoGeo = collider.geometry;
      let geometry: THREE.BufferGeometry;
      if (collider.geometryType === 'box' && this.isBoxGeometryDTO(dtoGeo)) {
        geometry = new THREE.BoxGeometry(dtoGeo.width, dtoGeo.height, dtoGeo.depth);
      } else if (collider.geometryType === 'plane' && this.isPlaneGeometryDTO(dtoGeo)) {
        geometry = new THREE.PlaneGeometry(dtoGeo.width, dtoGeo.height);
      } else if (collider.geometryType === 'sphere' && this.isSphereGeometryDTO(dtoGeo)) {
        geometry = new THREE.SphereGeometry(dtoGeo.radius, dtoGeo.widthSegments, dtoGeo.heightSegments);
      } else {
        throw new TypeError('Invalid GeometryDTO type.')
      }

      const material = new THREE.MeshPhongMaterial(collider.material);
      
      const mesh = new THREE.Mesh(geometry, material);

      if (collider.rotation !== undefined) {
        mesh.rotation.x = degToRad(collider.rotation.x);
        mesh.rotation.y = degToRad(collider.rotation.y);
        mesh.rotation.z = degToRad(collider.rotation.z);
      }

      this.createCollider(dtoToVector3(collider.pos), mesh);
    }
  }

  public createLight(pos: THREE.Vector3, lookAt: THREE.Vector3, color?: THREE.ColorRepresentation, intensity?: number) {
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.copy(pos);
    light.lookAt(lookAt);
    this.map.add(light);
    this.lights.push(light);
  }

  public createCollider(pos: THREE.Vector3, mesh: THREE.Mesh) {
    mesh.position.copy(pos);
    this.map.add(mesh);
    this.colliders.push(mesh);
  }
}
