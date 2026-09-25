import { buttonMaps } from "./buttonMaps";
import type { ControllerButtonMap, ControllerInput, ControllerInputs, ControllerLayout, LookMethod, MoveMethod } from "./types";
import { clamp, debug } from "./utils";

/**
 * Handles controller input and abstracts inputs to a uniform interface and scales.
 */
export class Controller {
  private lookMethod: LookMethod | undefined;
  private moveMethod: MoveMethod | undefined;
  private controllerLayout: ControllerLayout;
  private sensitivity: number;

  private lookX: number;
  private lookY: number;
  private moveX: number;
  private moveY: number;
  private jump: boolean;
  private swim: boolean;
  private fire: boolean;

  private lastLookX: number;
  private lastLookY: number;
  private sameLookNum: number;

  private canvas: HTMLCanvasElement;

  public debugOn = false;
  
  public constructor(
    canvas: HTMLCanvasElement,
    lookMethod: LookMethod,
    moveMethod: MoveMethod,
    controllerLayout?: ControllerLayout
  ) {
    this.keydownHandler = this.keydownHandler.bind(this);
    this.keyupHandler = this.keyupHandler.bind(this);
    this.mousedownHandler = this.mousedownHandler.bind(this);
    this.mouseupHandler = this.mouseupHandler.bind(this);
    this.pointerLockHandler = this.pointerLockHandler.bind(this);
    this.pointerLockChangeHandler = this.pointerLockChangeHandler.bind(this);
    this.mousemoveHandler = this.mousemoveHandler.bind(this);

    this.setLookMethod(lookMethod);
    this.setMoveMethod(moveMethod);
    this.controllerLayout = controllerLayout ?? 'switchPro';
    this.sensitivity = 0;

    this.canvas = canvas;

    this.lookX = 0
    this.lookY = 0
    this.moveX = 0
    this.moveY = 0
    this.jump = false;
    this.swim = false;
    this.fire = false;

    this.lastLookX = 0;
    this.lastLookY = 0;
    this.sameLookNum = 0;
  }

  /**
   * Read and set current input values. Must be done before querying to get up-to-date values.
   */
  public read() {
    // Mouse deltas must be reset after a timeout to avoid drift
    if (this.lookMethod === 'mouse') {
      if (
        (this.lookX !== 0 || this.lookY !== 0) &&
        this.lookX === this.lastLookX && 
        this.lookY === this.lastLookY
      ) {
        if (this.sameLookNum === 3) { // Timeout
          this.sameLookNum = 0;
          this.lookX = 0;
          this.lookY = 0;
        } else {
          this.sameLookNum++;
        }
      }
      this.lastLookX = this.lookX;
      this.lastLookY = this.lookY;
    }

    // We need to query the Gamepad & Gyroscope APIs to set values
    if (this.moveMethod !== 'keyboard' || this.lookMethod !== 'mouse') {
      const gamepads = navigator.getGamepads();
      if (gamepads) {
        const gp = Array.from(gamepads).find((gamepad) => gamepad?.connected);
        const bMap = buttonMaps[this.controllerLayout];

        // helpers
        const getButtonVal = (button: ControllerInput, fallback: boolean): boolean => {
          if (!gp || !(button in bMap)) return fallback;
          const index = bMap[button as keyof ControllerButtonMap];
          return index !== undefined ? (gp.buttons[index]?.pressed ?? fallback) : fallback;
        };
        const getAxesVal = (axes: ControllerInput, fallback: number): number => {
          if (!gp || !(axes in bMap)) return fallback;
          const index = bMap[axes as keyof ControllerButtonMap];
          return index !== undefined ? (gp.axes[index] ?? fallback) : fallback;
        };

        if (this.moveMethod === 'stick') {
          this.moveY = -1 * getAxesVal('moveY', this.moveY);
          this.moveX = getAxesVal('moveX', this.moveX);
          this.jump = getButtonVal('jump', this.jump);
          this.swim = getButtonVal('swim', this.swim);
          this.fire = getButtonVal('fire', this.fire);
        }

        if (this.lookMethod === 'stick') {
          this.lookX = this.applySensitivity(getAxesVal('lookX', this.lookX));
          this.lookY = this.applySensitivity(getAxesVal('lookY', this.lookY));
        }

        if (gp && this.lookMethod === 'gyro') {
          // TODO
        }
      }
    }

    if (this.debugOn) {
      debug('moveX', this.moveX);
      debug('moveY', this.moveY);
      debug('lookX', this.lookX);
      debug('lookY', this.lookY);
      debug('jump', this.jump);
      debug('swim', this.swim);
      debug('fire', this.fire);
    }
  }

  /**
   * Set the sensitivity, on a scale of [-5,5]
   * @param sens the sensitivity to set to
   */
  public setSensitivity(sens: number) {
    this.sensitivity = clamp(sens, -5, 5);
  }

  /* ----------------------------- */
  /* ---------- Getters ---------- */
  /* ----------------------------- */

  /**
   * Get all the current input values.
   * @returns Map of all current input values.
   */
  public getAll(): ControllerInputs {
    return {
      moveX: this.moveX,
      moveY: this.moveY,
      lookX: this.lookX,
      lookY: this.lookY,
      jump: this.jump,
      swim: this.swim,
      fire: this.fire,
    };
  }

  /**
   * Get the current X value for looking, [-1,1] (or more or less for mouse aim).
   * Negative is left, positive is right.
   * @returns lookX
   */
  public getLookX(): number {
    return this.lookX;
  }

  /**
   * Get the current Y value for looking, [-1,1] (or more or less for mouse aim).
   * Negative is down, positive is up.
   * @returns lookY
   */
  public getLookY(): number {
    return this.lookY;
  }

  /**
   * Get the current X value for moving, [-1,1].
   * Negative is left, positive is right.
   * @returns moveX
   */
  public getMoveX(): number {
    return this.moveX;
  }

  /**
   * Get the current Y value for moving, [-1,1].
   * Negative is backwards, positive is forwards.
   * @returns moveY
   */
  public getMoveY(): number {
    return this.moveY;
  }

  /**
   * Get if the jump input is being pressed.
   * @returns jump
   */
  public getJump(): boolean {
    return this.jump;
  }

  /**
   * Get if the swim input is being pressed.
   * @returns swim
   */
  public getSwim(): boolean {
    return this.swim;
  }

  /**
   * Get if the fire input is being pressed.
   * @returns fire
   */
  public getFire(): boolean {
    return this.fire;
  }

  /**
   * Get the current look sensitivity, [-5,5].
   * @returns sensitivity
   */
  public getSensitivity(): number {
    return this.sensitivity;
  }

  /* ----------------------------- */
  /* ------- Event Handlers ------ */
  /* ----------------------------- */

  private keydownHandler(ev: KeyboardEvent) {
    switch (ev.code) {
      case 'KeyW':
        this.moveY = 1;
        break;
      case 'KeyA':
        this.moveX = -1;
        break;
      case 'KeyS':
        this.moveY = -1;
        break;
      case 'KeyD':
        this.moveX = 1;
        break;
      case 'ShiftLeft':
        this.swim = true;
        break;
      case 'Space':
        this.jump = true;
        break;
      default:
        break;
    }
  }

  private keyupHandler(ev: KeyboardEvent) {
    switch (ev.code) {
      case 'KeyW':
        this.moveY = 0;
        break;
      case 'KeyA':
        this.moveX = 0;
        break;
      case 'KeyS':
        this.moveY = 0;
        break;
      case 'KeyD':
        this.moveX = 0;
        break;
      case 'ShiftLeft':
        this.swim = false;
        break;
      case 'Space':
        this.jump = false;
        break;
      default:
        break;
    }
  }

  private mousedownHandler(ev: MouseEvent) {
    switch (ev.button) {
      case 0: // LMB
        this.fire = true;
        break;
      case 2: // RMB
        this.swim = true;
        break;
      default:
        break;
    }
  }

  private mouseupHandler(ev: MouseEvent) {
    switch (ev.button) {
      case 0: // LMB
        this.fire = false;
        break;
      case 2: // RMB
        this.swim = false;
        break;
      default:
        break;
    }
  }

  private async pointerLockHandler() {
    await this.canvas.requestPointerLock({
      unadjustedMovement: true,
    });
  }

  private pointerLockChangeHandler() {
    console.log('checking pointer lock...');
    if (document.pointerLockElement === this.canvas) {
      console.log('pointer lock acquired');
      this.canvas.addEventListener('mousemove', this.mousemoveHandler);
    } else {
      this.canvas.removeEventListener('mousemove', this.mousemoveHandler);
    }
  }

  private mousemoveHandler(ev: MouseEvent) {
    // NOTE: these will not be bound between [-1..1]: feels weird for mouse controls to be capped
    this.lookX = this.applySensitivity(ev.movementX);
    this.lookY = this.applySensitivity(ev.movementY);
  }

  /**
   * Set the input method for moving.
   * @param method method to set to
   */
  public setMoveMethod(method: MoveMethod) {
    if (method === this.moveMethod) return;

    // Remove old listeners
    switch (this.moveMethod) {
      case 'keyboard':
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);
        break;
      case 'stick':
        break;
    }

    // Add new listeners
    switch (method) {
      case 'keyboard':
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
        break;
      case 'stick':
        break;
    }

    this.moveMethod = method;
  }

  /**
   * Set the input method for looking/aiming
   * @param method the method to set to
   * @returns 
   */
  public setLookMethod(method: LookMethod) {
    if (method === this.lookMethod) return;

    // Remove old listeners
    switch (this.lookMethod) {
      case 'mouse':
        document.removeEventListener('mousedown', this.mousedownHandler)
        document.removeEventListener('mouseup', this.mouseupHandler)
        this.canvas.removeEventListener('click', this.pointerLockHandler);
        document.removeEventListener('pointerlockchange', this.pointerLockChangeHandler)
        break;
      case 'stick':
        break;
      case 'gyro':
        // TODO gyro
        break;
    }

    // Add new listeners
    switch (method) {
      case 'mouse':
        document.addEventListener('mousedown', this.mousedownHandler)
        document.addEventListener('mouseup', this.mouseupHandler)
        document.addEventListener('click', this.pointerLockHandler);
        document.addEventListener('pointerlockchange', this.pointerLockChangeHandler)
        break;
      case 'stick':
        break;
      case 'gyro':
        // TODO
        break;
    }

    this.lookMethod = method;
  }

  private applySensitivity(lookVal: number): number {
    const sensBaseScale = {
      'mouse': 0.3,
      'stick': 3,
      'gyro': 1,
    };
    const oneCenteredSens = 1 + 0.1 * this.sensitivity;
    return lookVal * oneCenteredSens * sensBaseScale[this.lookMethod ?? 'mouse'];
  }

}
