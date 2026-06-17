import * as THREE from 'three';

export function createParticleSphere(scene) {
  const count = 1000; // reduced from 1800 — no visible diff, 44% less GPU

  const positions = new Float32Array(count * 3);
  const colors    = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    // Fibonacci sphere distribution
    const phi   = Math.acos(1 - (2 * i) / count);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;

    const r = 2.2 + (Math.random() - 0.5) * 0.4;
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    // Color gradient: blue → cyan
    const t = i / count;
    colors[i * 3]     = 0    + t * 0;        // R
    colors[i * 3 + 1] = 0.4  + t * 0.6;     // G
    colors[i * 3 + 2] = 1.0;                 // B
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.025,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const points = new THREE.Points(geo, mat);
  points.position.set(3.5, 0, -1);
  scene.add(points);

  // Inner glow sphere
  const innerGeo = new THREE.SphereGeometry(1.8, 32, 32);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0x0033aa,
    transparent: true,
    opacity: 0.08,
    wireframe: false,
    side: THREE.BackSide,
  });
  const innerSphere = new THREE.Mesh(innerGeo, innerMat);
  innerSphere.position.copy(points.position);
  scene.add(innerSphere);

  return { points, innerSphere };
}

export function updateParticles({ points, innerSphere }, elapsed) {
  if (!points) return;
  points.rotation.y = elapsed * 0.08;
  points.rotation.x = elapsed * 0.03;
  if (innerSphere) {
    innerSphere.rotation.y = -elapsed * 0.04;
  }
}

// ─── Starfield background ────────────────────────────────────
export function createStarfield(scene) {
  const count = 400; // reduced from 800

  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 60;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30 - 10;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.04,
    color: 0x88ccff,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const stars = new THREE.Points(geo, mat);
  scene.add(stars);
  return stars;
}
