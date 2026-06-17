import * as THREE from 'three';

// Creates a glowing material for DevOps icons
function glowMaterial(color = 0x0066ff, emissive = 0x003399) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive,
    emissiveIntensity: 0.8,
    metalness: 0.4,
    roughness: 0.3,
    transparent: true,
    opacity: 0.85,
  });
}

function wireframeMaterial(color = 0x00aaff) {
  return new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.6 });
}

// ─── Terminal Symbol >_ ─────────────────────────────────────
function createLinuxIcon() {
  const group = new THREE.Group();
  // '>' shape from triangles
  const arrowGeo = new THREE.ConeGeometry(0.18, 0.28, 3);
  const arrowMesh = new THREE.Mesh(arrowGeo, glowMaterial(0x00aaff, 0x005577));
  arrowMesh.rotation.z = -Math.PI / 2;
  arrowMesh.position.x = -0.05;
  group.add(arrowMesh);
  // '_' underline bar
  const barGeo = new THREE.BoxGeometry(0.28, 0.06, 0.06);
  const barMesh = new THREE.Mesh(barGeo, glowMaterial(0x00aaff, 0x005577));
  barMesh.position.set(0.18, -0.18, 0);
  group.add(barMesh);
  return group;
}

// ─── Git Branch Fork ────────────────────────────────────────
function createGitIcon() {
  const group = new THREE.Group();
  const nodeMat = glowMaterial(0xff6600, 0x993300);
  const lineMat = new THREE.LineBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.7 });

  const sphereGeo = new THREE.SphereGeometry(0.1, 8, 8);
  const positions = [
    [0, -0.3, 0], [0, 0.1, 0], [-0.25, 0.35, 0], [0.25, 0.35, 0]
  ];
  positions.forEach(([x, y, z]) => {
    const m = new THREE.Mesh(sphereGeo, nodeMat);
    m.position.set(x, y, z);
    group.add(m);
  });

  // lines connecting nodes
  [[0, 1], [1, 2], [1, 3]].forEach(([a, b]) => {
    const pts = [new THREE.Vector3(...positions[a]), new THREE.Vector3(...positions[b])];
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    group.add(new THREE.Line(geo, lineMat));
  });
  return group;
}

// ─── Docker Whale ───────────────────────────────────────────
function createDockerIcon() {
  const group = new THREE.Group();
  const mat = glowMaterial(0x2496ed, 0x1155aa);
  // Body — rounded box
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.28, 0.18), mat);
  group.add(body);
  // Containers on back (stacked small boxes)
  for (let i = 0; i < 3; i++) {
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.14), mat);
    box.position.set(-0.16 + i * 0.16, 0.19, 0);
    group.add(box);
  }
  // Tail
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.02, 0.2, 6), mat);
  tail.rotation.z = -Math.PI / 3;
  tail.position.set(0.3, 0.12, 0);
  group.add(tail);
  return group;
}

// ─── Kubernetes Helm Wheel ──────────────────────────────────
function createKubernetesIcon() {
  const group = new THREE.Group();
  const mat = glowMaterial(0x326ce5, 0x1133aa);
  // Center hub
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), mat);
  group.add(hub);
  // 6 spokes (helm wheel)
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.38, 6), mat);
    spoke.rotation.z = Math.PI / 2;
    spoke.rotation.y = angle;
    spoke.position.set(Math.cos(angle) * 0.19, Math.sin(angle) * 0.19, 0);
    group.add(spoke);
    // Rim segment
    const rim = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), mat);
    rim.position.set(Math.cos(angle) * 0.38, Math.sin(angle) * 0.38, 0);
    group.add(rim);
  }
  // Outer ring
  const ringGeo = new THREE.TorusGeometry(0.38, 0.03, 8, 32);
  const ring = new THREE.Mesh(ringGeo, mat);
  group.add(ring);
  return group;
}

// ─── Terraform Diamond ──────────────────────────────────────
function createTerraformIcon() {
  const group = new THREE.Group();
  const mat = glowMaterial(0x7b42f6, 0x4400bb);
  const geo = new THREE.OctahedronGeometry(0.28, 0);
  const mesh = new THREE.Mesh(geo, mat);
  group.add(mesh);
  // Wireframe overlay
  const wf = new THREE.Mesh(geo.clone(), wireframeMaterial(0x9966ff));
  wf.scale.setScalar(1.05);
  group.add(wf);
  return group;
}

// ─── AWS Cloud ──────────────────────────────────────────────
function createAWSIcon() {
  const group = new THREE.Group();
  const mat = glowMaterial(0xff9900, 0x885500);
  // Cloud bubbles
  const sizes = [[0, 0.1, 0, 0.18], [-0.18, 0.0, 0, 0.13], [0.18, 0.0, 0, 0.13], [0, -0.08, 0, 0.14]];
  sizes.forEach(([x, y, z, r]) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 10), mat);
    m.position.set(x, y, z);
    group.add(m);
  });
  return group;
}

// ─── CI/CD Pipeline arrows ──────────────────────────────────
function createCICDIcon() {
  const group = new THREE.Group();
  const mat = glowMaterial(0x00ffaa, 0x007755);
  // Circular arrow rings
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.04, 8, 20, Math.PI * 1.6), mat);
  ring1.rotation.z = Math.PI * 0.2;
  group.add(ring1);
  const arrowHead = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.12, 6), mat);
  arrowHead.position.set(0.22, 0.05, 0);
  group.add(arrowHead);
  return group;
}

// ─── Main factory ───────────────────────────────────────────
const ICON_FACTORIES = [
  createLinuxIcon,
  createGitIcon,
  createDockerIcon,
  createKubernetesIcon,
  createTerraformIcon,
  createAWSIcon,
  createCICDIcon,
];

export function createFloatingIcons(scene) {
  const icons = [];
  const count = 22; // enough to fill the whole background

  for (let i = 0; i < count; i++) {
    const factory = ICON_FACTORIES[i % ICON_FACTORIES.length];
    const group = factory();

    // Spread across full screen — wider X, taller Y, varied Z depth
    group.position.set(
      (Math.random() - 0.5) * 28,
      (Math.random() - 0.5) * 18,
      (Math.random() - 0.5) * 10 - 2
    );

    // Varied scale — some bigger, some smaller for depth feel
    const scale = 0.6 + Math.random() * 1.0;
    group.scale.setScalar(scale);

    group.userData = {
      floatOffset:  Math.random() * Math.PI * 2,
      floatSpeed:   0.25 + Math.random() * 0.35,
      rotateSpeed:  (Math.random() - 0.5) * 0.5,
      rotateAxis:   new THREE.Vector3(
        Math.random(), Math.random(), Math.random()
      ).normalize(),
      originY: group.position.y,
      originX: group.position.x,
    };

    scene.add(group);
    icons.push(group);
  }

  return icons;
}

export function updateFloatingIcons(icons, elapsed, mouseX, mouseY) {
  icons.forEach((icon) => {
    const { floatOffset, floatSpeed, rotateSpeed, rotateAxis, originY } = icon.userData;
    // Float up/down gently
    icon.position.y = originY + Math.sin(elapsed * floatSpeed + floatOffset) * 0.6;
    // Slow rotation
    icon.rotateOnAxis(rotateAxis, rotateSpeed * 0.012);
    // Mouse parallax — closer icons move more
    const depth = Math.abs(icon.position.z);
    const parallaxStrength = 0.003 / (depth * 0.1 + 0.5);
    icon.position.x += (mouseX * 1.5 - icon.position.x * 0.1) * parallaxStrength;
  });
}
