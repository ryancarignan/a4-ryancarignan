export type LookMethod = 'mouse' | 'stick' | 'gyro';
export type MoveMethod = 'keyboard' | 'stick';
export type ControllerInput = 'moveY' | 'moveX' | 'lookY' | 'lookX' | 'jump' | 'swim' | 'fire';
export type ControllerLayout = 'switchPro';
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