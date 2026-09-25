import { ControllerButtonMap } from "./types";

const switchProButtonMap: ControllerButtonMap = {
  moveX: 0,
  moveY: 1,
  lookX: 2,
  lookY: 3,
  jump: 0,
  swim: 6,
  fire: 7,
};

const xboxOneButtonMap: ControllerButtonMap = {
  moveX: 0,
  moveY: 1,
  lookX: 2,
  lookY: 3,
  jump: 0,
  swim: 6,
  fire: 7,
};

export const buttonMaps = {
  switchPro: switchProButtonMap,
  xboxOne: xboxOneButtonMap,
};
