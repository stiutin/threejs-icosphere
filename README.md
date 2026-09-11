# Three.js Interactive 3D Scene

A small interactive 3D scene built with **Three.js**, **Vite**, and **JavaScript**.

The project focuses on creating a polished real-time WebGL scene with animated geometry, dynamic lighting, particles, energy rings, and interactive camera controls.

## ✨ Features

- Interactive 3D camera controls with `OrbitControls`
- Animated icosahedron with flat shading
- Independent animated wireframe layer
- Layered cyan and magenta glow effects
- Animated energy rings around the main object
- 900 randomly distributed particles
- Dynamic cyan and magenta point lights
- Subtle breathing animation
- Responsive canvas resizing
- Capped device pixel ratio for better performance
- ACES filmic tone mapping
- Clean, modular JavaScript structure
- No frameworks - only Three.js and Vite

## 🛠️ Tech Stack

- **JavaScript**
- **Three.js**
- **Vite**
- **WebGL**
- **OrbitControls**

## 📦 Installation

Clone the repository:

```bash
git clone <repository-url>
cd <project-directory>
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open the URL provided by Vite, usually:

```text
http://localhost:5173
```

## 🏗️ Project Structure

The project intentionally keeps the architecture simple while separating responsibilities inside the main module.

```text
.
├── index.html
├── package.json
├── src/
│   ├── main.js
│   └── style.css
└── README.md
```

The main JavaScript file is organized into several responsibilities:

```text
Configuration
    ↓
Renderer
    ↓
Scene
    ↓
Camera
    ↓
Controls
    ↓
Scene objects
    ├── Main object
    ├── Wireframe
    ├── Glow effects
    ├── Energy rings
    ├── Particles
    ├── Lights
    └── Ground
    ↓
Animation
    ↓
Resize handling
```

## 🎨 Scene Composition

The central object is an `IcosahedronGeometry` with two visual layers:

- a `MeshStandardMaterial` for the main surface
- a `MeshBasicMaterial` wireframe slightly scaled above the surface

Additional visual layers create the final look:

```text
                 ✦ particles ✦

             ╭───────────────╮
             │   energy ring │
             │       ◇       │
             │    icosahedron│
             │   + wireframe  │
             │  cyan/magenta  │
             ╰───────────────╯

                 ground plane
```

The scene uses multiple light sources to create contrast between the violet object and cyan/magenta highlights.

## ⚡ Animation

The animation loop uses `THREE.Timer` and `renderer.setAnimationLoop()`.

Different scene elements have independent animation:

| Element           | Animation                 |
| ----------------- | ------------------------- |
| Main object       | Continuous X/Y rotation   |
| Wireframe         | Independent rotation      |
| Main object scale | Subtle breathing effect   |
| Energy ring(s)    | Rotation on multiple axes |
| Particles         | Slow orbital movement     |
| Cyan light        | Circular movement         |
| Magenta light     | Independent movement      |
| Glow              | Pulsating opacity         |

This keeps the scene visually dynamic without relying on heavy post-processing.

## 🎛️ Configuration

Visual and animation parameters are centralized in a `CONFIG` object.

For example:

```js
const CONFIG = {
  colors: {
    core: 0x795cff,
    cyan: 0x00d9ff,
    magenta: 0xff4fd8,
  },

  particles: {
    count: 900,
    size: 0.016,
    opacity: 0.55,
  },
};
```

This makes it easy to experiment with the visual style without searching through the animation and scene creation code for individual magic numbers.

## 📱 Responsive Rendering

The renderer automatically adapts to the browser viewport.

The device pixel ratio is capped to avoid unnecessarily expensive rendering on high-density displays:

```js
Math.min(window.devicePixelRatio, 2);
```

The camera projection matrix and renderer size are updated whenever the window is resized.

## 🚀 Production Build

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

The generated production files are placed in:

```text
dist/
```

## 🧠 Architecture Decisions

The project intentionally avoids excessive abstraction.

Instead of creating a separate class for every Three.js object, the code uses small factory functions such as:

```js
createMainObject();
createEnergyRings();
createParticles();
createLights();
```

Animation responsibilities are also separated:

```js
animateMainObject();
animateRings();
animateParticles();
animateLights();
```

This keeps the code easy to navigate while avoiding unnecessary complexity for a relatively small demo.

## 🔮 Possible Improvements

Possible future extensions include:

- Post-processing and bloom effects
- Mouse-based parallax
- Interactive object hover effects
- GUI controls for real-time parameter tweaking
- More sophisticated particle shaders
- Custom GLSL materials
- Procedural particle animation
- Performance monitoring
- Object/resource disposal for mounting/unmounting
- Splitting scene creation into separate modules as the project grows
