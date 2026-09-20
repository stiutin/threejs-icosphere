import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import WebGL from 'three/addons/capabilities/WebGL.js';

// --------------------------------------------------
// Configuration
// --------------------------------------------------

const CONFIG = {
  renderer: {
    maxPixelRatio: 2,
    toneMappingExposure: 1.25,
  },

  camera: {
    fov: 55,
    near: 0.1,
    far: 100,
    position: [0, 0.15, 3.4],
  },

  controls: {
    dampingFactor: 0.035,
    minDistance: 2.2,
    maxDistance: 6,
  },

  colors: {
    background: 0x05030d,
    core: 0x795cff,
    wireframe: 0xb9a7ff,
    cyan: 0x00d9ff,
    magenta: 0xff4fd8,
    particles: 0xb8a8ff,
    ground: 0x03050d,
    hemisphereSky: 0xb9a7ff,
    hemisphereGround: 0x08030f,
  },

  mainObject: {
    radius: 1,
    detail: 2,
    opacity: 0.9,
    roughness: 0.24,
    metalness: 0.35,
    wireframeScale: 1.008,
  },

  particles: {
    count: 900,
    minRadius: 2.2,
    maxRadius: 4.7,
    size: 0.016,
    opacity: 0.55,
  },

  animation: {
    coreRotationX: 0.08,
    coreRotationY: 0.22,
    wireframeRotationX: -0.13,
    wireframeRotationY: 0.17,
    breathingSpeed: 1.3,
    breathingAmount: 0.018,
    particlesRotation: 0.018,
    cyanLightSpeed: 0.6,
    magentaLightSpeed: 0.45,
    // Timestamp used to compose the single frame shown when the visitor asks
    // for reduced motion: far enough in for the lights to be off-axis.
    staticPose: 2.4,
  },
};

// --------------------------------------------------
// Renderer
// --------------------------------------------------

function createRenderer() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });

  renderer.setPixelRatio(getPixelRatio());
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = CONFIG.renderer.toneMappingExposure;
  document.body.appendChild(renderer.domElement);

  return renderer;
}

function getPixelRatio() {
  return Math.min(window.devicePixelRatio, CONFIG.renderer.maxPixelRatio);
}

// --------------------------------------------------
// Scene
// --------------------------------------------------

function createScene() {
  const scene = new THREE.Scene();

  scene.background = new THREE.Color(CONFIG.colors.background);

  return scene;
}

// --------------------------------------------------
// Camera
// --------------------------------------------------

function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    CONFIG.camera.fov,
    getAspectRatio(),
    CONFIG.camera.near,
    CONFIG.camera.far,
  );

  camera.position.set(...CONFIG.camera.position);

  return camera;
}

function getAspectRatio() {
  return window.innerWidth / window.innerHeight;
}

// --------------------------------------------------
// Controls
// --------------------------------------------------

function createControls(camera, renderer) {
  const controls = new OrbitControls(camera, renderer.domElement);

  controls.enableDamping = true;
  controls.dampingFactor = CONFIG.controls.dampingFactor;
  controls.minDistance = CONFIG.controls.minDistance;
  controls.maxDistance = CONFIG.controls.maxDistance;
  controls.enablePan = false;

  return controls;
}

// --------------------------------------------------
// Main object
// --------------------------------------------------

function createMainObject() {
  const geometry = new THREE.IcosahedronGeometry(
    CONFIG.mainObject.radius,
    CONFIG.mainObject.detail,
  );
  const material = new THREE.MeshStandardMaterial({
    color: CONFIG.colors.core,
    roughness: CONFIG.mainObject.roughness,
    metalness: CONFIG.mainObject.metalness,
    flatShading: true,
    transparent: true,
    opacity: CONFIG.mainObject.opacity,
  });
  const mesh = new THREE.Mesh(geometry, material);
  const wireframe = createWireframe(geometry);
  const glow = createGlow();
  const innerGlow = createInnerGlow();

  mesh.add(wireframe, glow, innerGlow);

  return { mesh, wireframe, glow, innerGlow };
}

// --------------------------------------------------
// Wireframe
// --------------------------------------------------

function createWireframe(geometry) {
  const material = new THREE.MeshBasicMaterial({
    color: CONFIG.colors.wireframe,
    wireframe: true,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
  });

  const wireframe = new THREE.Mesh(geometry, material);

  wireframe.scale.setScalar(CONFIG.mainObject.wireframeScale);

  return wireframe;
}

// --------------------------------------------------
// Glow
// --------------------------------------------------

function createGlow() {
  const geometry = new THREE.SphereGeometry(0.82, 32, 32);

  const material = new THREE.MeshBasicMaterial({
    color: CONFIG.colors.cyan,
    transparent: true,
    opacity: 0.08,
    // Both glow shells live inside the transparent core. Writing depth would
    // let whichever is drawn first hide the other, and the sort order between
    // objects sharing a centre is not something to rely on.
    depthWrite: false,
  });

  return new THREE.Mesh(geometry, material);
}

function createInnerGlow() {
  const geometry = new THREE.SphereGeometry(0.58, 32, 32);

  const material = new THREE.MeshBasicMaterial({
    color: CONFIG.colors.magenta,
    transparent: true,
    opacity: 0.035,
    depthWrite: false,
  });

  return new THREE.Mesh(geometry, material);
}

// --------------------------------------------------
// Energy ring
// --------------------------------------------------

function createEnergyRing({
  color,
  opacity,
  radius,
  tube,
  rotation,
  scale = 1,
}) {
  const geometry = new THREE.TorusGeometry(radius, tube, 8, 128);
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
  });
  const ring = new THREE.Mesh(geometry, material);

  ring.rotation.set(...rotation);
  ring.scale.setScalar(scale);

  return ring;
}

function createEnergyRings() {
  const ring = createEnergyRing({
    color: CONFIG.colors.cyan,
    opacity: 0.48,
    radius: 1.35,
    tube: 0.009,
    rotation: [Math.PI / 2.5, 0, 0],
  });

  return { ring };
}

// --------------------------------------------------
// Particles
// --------------------------------------------------

function createParticles() {
  const positions = createParticlePositions();
  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: CONFIG.colors.particles,
    size: CONFIG.particles.size,
    transparent: true,
    opacity: CONFIG.particles.opacity,
    sizeAttenuation: true,
  });

  return new THREE.Points(geometry, material);
}

function createParticlePositions() {
  const { count, minRadius, maxRadius } = CONFIG.particles;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const radius = minRadius + Math.random() * (maxRadius - minRadius);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const sinPhi = Math.sin(phi);

    positions[i * 3] = radius * sinPhi * Math.cos(theta);
    positions[i * 3 + 1] = radius * sinPhi * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }

  return positions;
}

// --------------------------------------------------
// Lights
// --------------------------------------------------

function createLights(scene) {
  const hemisphereLight = new THREE.HemisphereLight(
    CONFIG.colors.hemisphereSky,
    CONFIG.colors.hemisphereGround,
    1.5,
  );
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);

  keyLight.position.set(3, 4, 5);

  const cyanLight = new THREE.PointLight(CONFIG.colors.cyan, 14, 8);

  cyanLight.position.set(-2.5, -1, 2);

  const magentaLight = new THREE.PointLight(CONFIG.colors.magenta, 8, 7);

  magentaLight.position.set(2.5, 1, -2);

  scene.add(hemisphereLight, keyLight, cyanLight, magentaLight);

  return { cyanLight, magentaLight };
}

// --------------------------------------------------
// Ground
// --------------------------------------------------

function createGround(scene) {
  const geometry = new THREE.CircleGeometry(6, 64);
  const material = new THREE.MeshBasicMaterial({
    color: CONFIG.colors.ground,
    transparent: true,
    opacity: 0.7,
  });
  const ground = new THREE.Mesh(geometry, material);

  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.4;

  scene.add(ground);

  return ground;
}

// --------------------------------------------------
// Animation
// --------------------------------------------------

function animateMainObject(mainObject, elapsed) {
  const { mesh, wireframe, glow, innerGlow } = mainObject;

  mesh.rotation.x = elapsed * CONFIG.animation.coreRotationX;
  mesh.rotation.y = elapsed * CONFIG.animation.coreRotationY;

  wireframe.rotation.x = elapsed * CONFIG.animation.wireframeRotationX;
  wireframe.rotation.y = elapsed * CONFIG.animation.wireframeRotationY;

  const breathing =
    1 +
    Math.sin(elapsed * CONFIG.animation.breathingSpeed) *
      CONFIG.animation.breathingAmount;

  mesh.scale.setScalar(breathing);

  glow.material.opacity = 0.055 + Math.sin(elapsed * 1.8) * 0.02;
  innerGlow.material.opacity = 0.025 + Math.sin(elapsed * 2.2 + 1) * 0.015;
}

function animateRings(rings, elapsed) {
  const { ring } = rings;

  ring.rotation.z = elapsed * 0.28;
  ring.rotation.y = Math.sin(elapsed * 0.55) * 0.35;
}

function animateParticles(particles, elapsed) {
  particles.rotation.y = elapsed * CONFIG.animation.particlesRotation;
  particles.rotation.x = Math.sin(elapsed * 0.08) * 0.04;
}

function animateLights(lights, elapsed) {
  const { cyanLight, magentaLight } = lights;
  const cyanTime = elapsed * CONFIG.animation.cyanLightSpeed;

  cyanLight.position.x = Math.sin(cyanTime) * 3;
  cyanLight.position.z = Math.cos(cyanTime) * 3;

  const magentaTime = elapsed * CONFIG.animation.magentaLightSpeed;

  magentaLight.position.x = Math.cos(magentaTime) * 3;
  magentaLight.position.y = Math.sin(elapsed * 0.35) * 2;
}

// --------------------------------------------------
// Resize
// --------------------------------------------------

function handleResize(renderer, camera) {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.setPixelRatio(getPixelRatio());
}

// --------------------------------------------------
// Application
// --------------------------------------------------

function showUnsupportedMessage() {
  const fallback = document.getElementById('fallback');

  if (fallback) fallback.hidden = false;
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function init() {
  // The WebGLRenderer constructor throws when no context can be created, so
  // the capability check has to come before anything else is built.
  if (!WebGL.isWebGL2Available()) {
    showUnsupportedMessage();

    return;
  }

  const renderer = createRenderer();
  const scene = createScene();
  const camera = createCamera();
  const controls = createControls(camera, renderer);
  const mainObject = createMainObject();
  const rings = createEnergyRings();
  const particles = createParticles();
  const lights = createLights(scene);

  createGround(scene);

  scene.add(mainObject.mesh, rings.ring, particles);

  window.addEventListener('resize', () => handleResize(renderer, camera));

  function renderFrame(elapsed) {
    animateMainObject(mainObject, elapsed);
    animateRings(rings, elapsed);
    animateParticles(particles, elapsed);
    animateLights(lights, elapsed);
    controls.update();
    renderer.render(scene, camera);
  }

  if (prefersReducedMotion()) {
    // This scene is nothing but motion, so honouring the preference means not
    // running the loop at all. One composed frame is drawn, and redrawn only
    // when the visitor drags the camera, so the object stays explorable.
    renderFrame(CONFIG.animation.staticPose);
    controls.addEventListener('change', () => renderer.render(scene, camera));

    return;
  }

  const timer = new THREE.Timer();

  // Connecting the timer to the document lets it discard the gap accumulated
  // while the tab was hidden, instead of jumping the animation on return.
  timer.connect(document);

  renderer.setAnimationLoop(() => {
    timer.update();
    renderFrame(timer.getElapsed());
  });
}

init();
