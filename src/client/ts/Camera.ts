import * as THREE from 'three';
import { clamp, debug } from './utils';

export class Camera {
  private static readonly DEFAULT_THETA = 0;
  private static readonly DEFAULT_PHI = 0;
  private static readonly DEFAULT_RHO = 8;
  private static readonly MIN_THETA = -0.75 * Math.PI;
  private static readonly MAX_THETA = -0.10 * Math.PI;

  private gameWindowWidth: number;
  private gameWindowHeight: number;

  private fov: number;
  private aspectRatio: number;
  private nearPlane: number;
  private farPlane: number;
  private camera: THREE.PerspectiveCamera;

  private origin: THREE.Vector3;
  private theta: number;
  private phi: number;
  private rho: number;
  
  // actual camera position
  private x!: number;
  private y!: number;
  private z!: number;

  // last coords of user input
  private lastInputX: number;
  private lastInputY: number;

  public debugOn: boolean = false;

  public constructor(gameWindowWidth: number, gameWindowHeight: number) {
    this.gameWindowWidth = gameWindowWidth;
    this.gameWindowHeight = gameWindowHeight;

    this.fov = 60;
    this.aspectRatio = gameWindowWidth / gameWindowHeight;
    this.nearPlane = 0.1;
    this.farPlane = 1000;

    this.camera = new THREE.PerspectiveCamera(
      this.fov, 
      this.aspectRatio, 
      this.nearPlane, 
      this.farPlane
    );

    this.origin = new THREE.Vector3(0, 0, 0);
    this.theta = Camera.DEFAULT_THETA;
    this.phi = Camera.DEFAULT_PHI;
    this.rho = Camera.DEFAULT_RHO;

    this.lastInputX = 0;
    this.lastInputY = 0;

    this.setCartesianCoords();
  }

  /** Get the Three.js camera object */
  public getCamera() {
    return this.camera;
  }

  /** Get the cartesian position of the camera */
  public getPosition(): THREE.Vector3 {
    return new THREE.Vector3(this.x, this.y, this.z);
  }

  /** Get rho (distance from camera to its origin which it rotates around) */
  public getRho(): number {
    return this.rho;
  }

  /**
   * Move according to an absolute position of a controller.
   * @param x absolute X-position of the controller [-1..1]
   * @param y absolute Y-position of the controller [-1..1]
   */
  public moveAbsolute(x: number, y: number) {
    this.phi = x * 2 * Math.PI;
    this.theta = y * 2 * Math.PI;
    this.theta = clamp(this.theta, Camera.MIN_THETA, Camera.MAX_THETA);

    if (this.debugOn) {
      debug('phi', this.phi);
      debug('theta', this.theta);
      debug('rho', this.rho);
    }

    this.setCartesianCoords();
  }

  /**
   * Move according to a change in position from the previous one.
   * @param deltaX change in X-position of the controller
   * @param deltaY change in Y-position of the controller
   */
  public moveRelative(deltaX: number, deltaY: number) {
    this.phi += this.lastInputX + (deltaX / this.gameWindowHeight) * 2 * Math.PI;
    this.theta += this.lastInputY + (deltaY / this.gameWindowWidth) * 2 * Math.PI;
    this.theta = clamp(this.theta, Camera.MIN_THETA, Camera.MAX_THETA);

    if (this.debugOn) {
      debug('phi', this.phi);
      debug('theta', this.theta);
      debug('rho', this.rho);
    }

    this.setCartesianCoords();
  }

  /**
   * Sets x and y according to the spherical coordinates
   */
  private setCartesianCoords() {
    this.x = this.rho * Math.sin(this.theta) * Math.cos(this.phi);
    this.z = this.rho * Math.sin(this.theta) * Math.sin(this.phi);
    this.y = this.rho * Math.cos(this.theta);
  }

  /**
   * Update the actual position of the Three.js camera object
   */
  public updateCameraPosition() {
    this.camera.position.x = this.x;
    this.camera.position.y = this.y;
    this.camera.position.z = this.z;
    this.camera.lookAt(this.origin);

    if (this.debugOn) {
      debug('x', this.x);
      debug('y', this.y);
      debug('z', this.z);
    }
  }

  public setOrigin(origin: THREE.Vector3) {
    this.origin = origin;
  }
}
