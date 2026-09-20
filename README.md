# Icosphere

An animated icosphere built with Three.js and vanilla JavaScript.

A flat-shaded icosahedron sits inside a counter-rotating wireframe shell, lit by a fixed key light and two coloured point lights that orbit it. A field of 900 particles surrounds the object, and the whole thing can be turned and zoomed with the mouse. There is no UI: the scene is the piece.

**[Open the live demo](https://stiutin.github.io/threejs-icosphere/)**

## Features

- Flat-shaded `IcosahedronGeometry` core with a standard PBR material
- Wireframe shell sharing the core's geometry, rotating on its own axes
- Two nested glow shells whose opacity pulses out of phase
- A thin torus ring tumbling around the object
- 900 particles distributed evenly through a spherical shell
- Cyan and magenta point lights orbiting on separate periods
- Subtle breathing scale on the core
- ACES filmic tone mapping with sRGB output
- Orbit controls with damping, clamped zoom and panning disabled
- Device pixel ratio capped at 2
- Static single frame when the visitor prefers reduced motion
- Explicit message when WebGL 2 is unavailable

## Tech stack

Vanilla JavaScript, [Three.js](https://threejs.org/), [Vite](https://vitejs.dev/), WebGL.
No framework, no UI library, no textures: everything in the scene is generated in code.

## How it works

### Composition

Every tunable value lives in a single `CONFIG` object: colours, camera, geometry detail, particle counts, and the speed of each animated property. Nothing else in the file holds a magic number, so the whole look of the scene can be retuned from one place.

The object is built from four meshes that share one centre:

```
Mesh (icosahedron core, flat-shaded, slightly transparent)
  ├── Mesh (wireframe shell, same geometry, scaled 1.008)
  ├── Mesh (outer glow sphere, cyan)
  └── Mesh (inner glow sphere, magenta)
```

The wireframe reuses the core's geometry object rather than building a second one, so the two are guaranteed to stay in step and only one set of vertex buffers is uploaded to the GPU.

### Transparency

The core is semi-transparent and the glow shells sit inside it. Transparent objects are drawn after opaque ones and sorted back to front by their centre, which is the same point for all four meshes here, so their relative order is not something to depend on. The shells therefore render with `depthWrite` disabled: they contribute colour without claiming depth, and whichever is drawn first cannot hide the others.

### Lighting

A hemisphere light fills the shadows with the scene's own violet, a white directional key light gives the facets their definition, and two point lights in cyan and magenta orbit the object on different periods so the highlights never repeat in the same arrangement. Because the facets are flat-shaded, each triangle picks up a single tone and the moving lights read as distinct planes turning through the light rather than a smooth gradient.

### Particles

Positions are generated once into a `Float32Array` using spherical coordinates with `acos(2r - 1)` for the polar angle, which distributes points evenly over a sphere instead of clustering them at the poles. They are drawn as a single `Points` object, so 900 particles cost one draw call.

### Animation

The render loop runs through `renderer.setAnimationLoop()`, which lets the browser stop it when the tab is hidden. Elapsed time comes from `THREE.Timer` connected to the document, so time spent on a hidden tab is discarded rather than arriving as one large jump on return.

Every animated property is a function of elapsed time rather than an accumulation per frame. Rotations, the breathing scale, the pulsing glow opacity and the orbiting lights are all derived from the same clock, which keeps them in phase at any frame rate and makes the whole scene reproducible from a single number.

That last property is what the reduced-motion path uses: instead of a frozen first frame, it composes the scene at a chosen timestamp and draws it once, then redraws only when the camera is dragged.

## Project structure

```
src/
├── main.js          # configuration, scene factories, animation
└── style.css        # page reset and the WebGL fallback message

.github/workflows/
└── deploy.yml       # quality gate, then build and deploy to GitHub Pages
```

## Running locally

```bash
git clone https://github.com/stiutin/threejs-icosphere.git
cd threejs-icosphere
npm install
npm run dev
```

Other scripts:

```bash
npm run build        # production build into dist/
npm run preview      # serve the production build
npm run lint         # ESLint
npm run format       # Prettier
```

## Deployment

Pushing to `master` runs formatting and lint checks first; only if those pass does the second job build the project and publish `dist/` to GitHub Pages. Because the site is served from a sub-path, Vite is configured with `base: '/threejs-icosphere/'`.

## Roadmap

- [ ] Subdivision control, to show the icosphere at detail levels 0 to 5
- [ ] Bloom via `EffectComposer`, which this palette is asking for
- [ ] Mouse parallax on the camera
- [ ] Custom GLSL material for the facets
- [ ] Particle motion beyond the rigid rotation of the whole field
- [ ] Resource disposal, for embedding the scene in a larger app

## License

Released under the [MIT License](LICENSE).

## Author

**Serge Tiutin** — [github.com/stiutin](https://github.com/stiutin)
