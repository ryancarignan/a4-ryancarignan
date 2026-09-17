import * as THREE from 'three';
import { Camera } from './ts/Camera';
import { debug } from './ts/utils';

// debug log settings
const debugOn = false;

// create scene
const scene = new THREE.Scene();

// create camera
const camera = new Camera();

// create renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// create cube
let cube: THREE.Object3D;
{
  const r = 1;
  const d = r * 2
  const geometry = new THREE.BoxGeometry(d, d, d);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffbb});
  cube = new THREE.Mesh(geometry, material);
}
scene.add(cube);

// receive mouse movements for camera control
document.addEventListener('mousemove', (event: MouseEvent) => {
  camera.moveAbsolute(event.clientX, event.clientY);
  if (debugOn) {
    debug('mouseX', event.clientX);
    debug('mouseY', event.clientY);
  }
});

function animate(time: number) {
  camera.updateCameraPosition();

  renderer.render(scene, camera.getCamera());
}

renderer.setAnimationLoop(animate);