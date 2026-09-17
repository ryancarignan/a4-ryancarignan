import * as THREE from 'three';
import { clamp, debug } from './utils';

export class Camera {
  private static readonly DEFAULT_THETA = 0;
  private static readonly DEFAULT_PHI = 0;
  private static readonly DEFAULT_RHO = 5;
  private static readonly MIN_THETA = -2 * Math.PI;
  private static readonly MAX_THETA = 0 * Math.PI;
  private static readonly ORIGIN = new THREE.Vector3(0, 0, 0);

  private fov: number;
  private aspectRatio: number;
  private nearPlane: number;
  private farPlane: number;
  private camera: THREE.PerspectiveCamera;

  private theta: number;
  private phi: number;
  private rho: number;
  
  private x!: number;
  private y!: number;
  private z!: number;

  public debugOn: boolean = false;

  public constructor() {
    this.fov = 60;
    this.aspectRatio = window.innerWidth / window.innerHeight;
    this.nearPlane = 0.1;
    this.farPlane = 1000;

    this.camera = new THREE.PerspectiveCamera(
      this.fov, 
      this.aspectRatio, 
      this.nearPlane, 
      this.farPlane
    );

    this.theta = Camera.DEFAULT_THETA;
    this.phi = Camera.DEFAULT_PHI;
    this.rho = Camera.DEFAULT_RHO;

    this.setCartesianCoords();
  }

  /** Get the Three.js camera object */
  public getCamera() {
    return this.camera;
  }

  /**
   * Move according to an absolute position of a controller.
   * @param x absolute X-position of the controller
   * @param y absolute Y-position of the controller
   */
  public moveAbsolute(x: number, y: number) {
    this.phi = ((x / window.innerHeight) - 0.5) * 2 * Math.PI;
    this.theta = ((y / window.innerWidth) - 0.5) * 2 * Math.PI;
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
    throw new Error('Not yet implemented.');
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
    this.camera.lookAt(Camera.ORIGIN);

    if (this.debugOn) {
      debug('x', this.x);
      debug('y', this.y);
      debug('z', this.z);
    }
  }
}
