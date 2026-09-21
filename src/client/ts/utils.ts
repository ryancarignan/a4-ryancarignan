/**
 * Clamp a value between a min and max
 * @param val value to be clamped
 * @param min min to clamp val to
 * @param max max to clamp val to
 * @returns clamped value
 */
export function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Print a statement to the screen for debugging
 * @param id CSS-legal ID
 * @param val value to be printed
 */
export function debug(id: string, val: string | number | boolean) {
  let elem = document.getElementById(id) as HTMLDivElement | null;
  if (elem === null) {
    elem = document.createElement('div');
    elem.id = id;
    const debugDiv = document.getElementById('debug-container');
    debugDiv?.appendChild(elem);
  }

  elem.innerText = `${id}: ${val}`;
}

export function extractErrorMessage(e: unknown, defaultMessage: string) {
  if (e instanceof Error) {
    return e.message;
  } else if (typeof e === 'string') {
    return e;
  } else if (typeof e === 'object' && e !== null && 'message' in e && typeof e.message === 'string') {
    return e.message;
  } else {
    return defaultMessage;
  }
}
