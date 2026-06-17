import * as THREE from 'three';

let renderer, scene, camera, animationId;
const clock = new THREE.Clock();

export function initScene(canvas) {
  scene  = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha:     true,
    antialias: false,          // OFF — background doesn't need AA, saves GPU
    powerPreference: 'high-performance',
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // cap at 1.5 not 2
  renderer.setClearColor(0x000000, 0);

  const ambient = new THREE.AmbientLight(0x003366, 0.8);
  scene.add(ambient);
  const pointLight1 = new THREE.PointLight(0x0066ff, 2, 50);
  pointLight1.position.set(5, 5, 5);
  scene.add(pointLight1);
  const pointLight2 = new THREE.PointLight(0x00ffff, 1.5, 50);
  pointLight2.position.set(-5, -3, 3);
  scene.add(pointLight2);

  window.addEventListener('resize', onResize, { passive: true });
  return { scene, camera, renderer, clock };
}

export function getScene()    { return scene; }
export function getCamera()   { return camera; }
export function getRenderer() { return renderer; }
export function getClock()    { return clock; }

export function startLoop(onFrame) {
  let paused = false;

  // Pause rendering when tab is hidden — saves CPU/GPU completely
  const onVisibility = () => { paused = document.hidden; };
  document.addEventListener('visibilitychange', onVisibility);

  function loop() {
    animationId = requestAnimationFrame(loop);
    if (paused) return;                    // skip frame when tab hidden
    onFrame(clock.getDelta(), clock.getElapsedTime());
    renderer.render(scene, camera);
  }
  loop();

  return () => {
    cancelAnimationFrame(animationId);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}

export function disposeScene() {
  cancelAnimationFrame(animationId);
  window.removeEventListener('resize', onResize);
  renderer?.dispose();
}

function onResize() {
  if (!renderer || !camera) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
