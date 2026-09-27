# CLAUDE.md

Working notes for AI assistants (and humans) on this repository. Read this first: what the project is, how it is built, which rules must not be broken, and how to verify a change. When something here gets out of date, fix this file in the same change.

## 1. What this is

**Icosphere** is a small Three.js study. A flat-shaded icosahedron sits inside a counter-rotating wireframe shell, with glow shells, a tumbling ring, two orbiting coloured lights and 900 particles. A slider rebuilds the geometry live from subdivision level 0 (20 triangles) to 5 (720), and the triangle count is read back from the geometry.

- Live: `https://stiutin.github.io/threejs-icosphere/`
- It is a **portfolio project**: a focused study of geometry, lighting and transparency, with no textures. Everything is generated in code.

## 2. Toolchain

| Tool    | Version                                                                                                    | Notes                                       |
| ------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Node.js | 24 (`.nvmrc`), `engines` `>=22.22.3`                                                                       |                                             |
| three   | 0.186                                                                                                      | `OrbitControls` from `three/addons`         |
| Vite    | 8                                                                                                          | relative `base: './'`; preview on port 4175 |
| Tests   | Playwright 1.63                                                                                            | smoke tests against the production build    |
| Lint    | ESLint 10 (`eslint.config.mjs`, JavaScript rules), Stylelint 17 (CSS, alphabetical properties), Prettier 3 |                                             |

Plain JavaScript (ES modules), no framework, no TypeScript. JSDoc where it helps. A TypeScript migration is on the roadmap.

## 3. Commands

```bash
npm start              # Vite dev server
npm run build          # production build into dist/
npm run serve          # serve dist/ (port 4175)
npm run e2e            # build, then the Playwright smoke tests (desktop + Pixel 7); `npm run e2e:install` once
npm run e2e:run        # the tests only, against the existing build
npm run screenshots    # .github/screenshots/*.png from a fresh build
npm run lint           # ESLint + Stylelint
npm run format         # Prettier
npm run check          # format:check + lint  ← before finishing
```

**Definition of done:** `npm run check` is green, `npm run e2e` is green, and the README and this file are still accurate. Visual changes: regenerate the screenshots.

## 4. Repository map

```
src/main.js      CONFIG, renderer/scene/camera/controls factories, main object and detail control,
                 wireframe, glow shells, energy rings, particles, lights, ground, animation, init
src/style.css    page reset, the panel, the WebGL fallback message
index.html       the panel markup (#detail slider, #detail-level, #face-count) and #fallback
e2e/             Playwright smoke tests
scripts/         README screenshots
```

## 5. Architecture

- **`CONFIG`** holds the renderer, camera, controls, colours, main object, particles and animation settings. The factories (`create*`) read from it, and `init()` wires everything together.
- **Subdivision.** `setDetail(mainObject, detail)` replaces the core's `IcosahedronGeometry`, disposes the old geometry, and shares the new one with the wireframe shell. `countFaces()` reads the triangle count back from the geometry, and `#face-count` is an `aria-live` region.
- **Transparency.** The glow shells and the wireframe are transparent with `depthWrite: false`, so they layer without hiding each other. The README explains the choices.
- **Animation** is driven by elapsed time: breathing scale, counter-rotation, pulsing glow opacity out of phase, lights on separate periods.
- **Reduced motion.** When `prefers-reduced-motion` is set, the scene is composed at a chosen timestamp and drawn once, then redrawn only when the camera moves.
- **Unsupported WebGL 2** shows `#fallback` instead of a blank page.

## 6. Invariants - do not break

1. Dispose the old geometry when rebuilding (`setDetail`); a slider that leaks GPU memory on every step is the classic bug here.
2. Keep the panel keyboard-operable, and keep `#face-count` announcing through `aria-live`.
3. Respect reduced motion: no continuous animation loop in that mode.
4. The ids `#detail`, `#detail-level`, `#face-count` and `#fallback` are used by the tests.
5. Pixel ratio is capped at 2.

## 7. Conventions (project-specific)

- **One config:** colours, camera, geometry, particle counts and animation speeds live in `CONFIG`; nothing else holds a magic number.
- **Time, not frames:** every animated property is a function of elapsed time, so any moment of the scene can be drawn on its own.
- **GPU resources:** whatever is replaced is disposed in the same step; geometry shared between meshes is repointed first.
- **Plain JavaScript:** ES modules, no framework, no textures; everything in the scene is generated in code.

## 8. Testing guide

`e2e/smoke.spec.js`: the scene renders without errors and the fallback stays hidden; moving the slider to 5 updates the level and changes the triangle count. Each test fails on any uncaught error or console error.

## 9. Recipes

- **New effect:** add its settings to `CONFIG`, a `createX()` factory and an `animateX()` function, and call them from `init()` and the loop. Keep the reduced-motion path in mind.
- **New control:** markup in `index.html` (with a label and keyboard support), wiring in a `create...Control()` function, and a smoke test.

## 10. CI/CD

The jobs are _Lint and types_ (formatting and lint), _Build_ (uploads `dist/`), _End-to-end_ (the smoke tests against that exact build), and _Deploy to GitHub Pages_, which publishes the same artifact from `master` after the gates pass. One-time setup is listed at the top of `.github/workflows/ci.yml`: Pages source "GitHub Actions", and the `github-pages` environment allowing `master`.

## 11. Troubleshooting

| Symptom                                                         | Cause / fix                                                                                                                                           |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| E2E: `ERR_HTTP_RESPONSE_CODE_FAILURE` or the wrong app          | another project's preview server is still on the port (`reuseExistingServer`); each repository has its own port (4175 here), so stop the stray server |
| Playwright: "Executable doesn't exist"                          | `npm run e2e:install`, or `CHROMIUM_PATH=/path/to/chrome`                                                                                             |
| Black canvas in headless screenshots                            | software WebGL is slow; the scripts wait for the first frames, so increase the wait before adding flags                                               |
| Deploy rejected: "branch not allowed to deploy to github-pages" | Settings → Environments → github-pages → allow `master`                                                                                               |

## 12. Known limitations

- Materials and textures are not disposed on teardown; the scene is not meant to be embedded yet (see the roadmap in the README).

## House style (identical in every repository of this portfolio)

These six repositories are written as one body of work: [cosmos-stories](https://github.com/stiutin/cosmos-stories), [larder](https://github.com/stiutin/larder), [livery](https://github.com/stiutin/livery), [pixi-neon-district](https://github.com/stiutin/pixi-neon-district), [threejs-solar-system](https://github.com/stiutin/threejs-solar-system) and [threejs-icosphere](https://github.com/stiutin/threejs-icosphere). Keep them alike. When a convention changes, change it everywhere.

**Shared files.** `LICENSE` (MIT, Serge Tiutin), `.editorconfig`, `.gitattributes`, `.nvmrc` (`24`), `.prettierrc`, `.prettierignore`, `.gitignore`, `.vscode/`, `.github/dependabot.yml` and the issue and PR templates are identical across the repositories, apart from a clearly marked `# Project` block at the end of the ignore files.

**Formatting.** Prettier: 120 columns, single quotes, no spaces inside braces (`{a, b}`), trailing commas where ES5 allows them, always parenthesised arrow parameters. `npm run format` fixes everything, and `npm run format:check` runs in CI. ESLint does not format.

**Linting.** `eslint.config.mjs` with `defineConfig`, and two shared blocks:

- `HOUSE_RULES`: sorted imports and exports (`simple-import-sort`), no unused imports, `curly: all`, arrow bodies only where needed, no `console` except `warn` and `error`;
- `HOUSE_TS_RULES` in TypeScript projects: explicit `public`/`protected`/`private` on every class member (never on constructors), explicit return types on every exported function, no `any`, `T[]` rather than `Array<T>`, and unused variables allowed only with a leading `_`.

`eslint-config-prettier` comes last. Each project adds its own strictness on top: `typescript-eslint` strict-type-checked in cosmos-stories, livery and pixi-neon-district (livery adds the React hooks and Fast Refresh rules), Larder's own rule set (magic numbers, naming, member ordering, RxJS) in larder. Styles are linted by Stylelint with properties in alphabetical order; `-webkit-backdrop-filter` and `-webkit-user-select` stay, for Safari.

**`package.json`.** The field order is name, version, description, license, author, repository, homepage, keywords, private, type, engines, workspaces (in monorepos), scripts, dependencies, devDependencies. Dependencies are sorted, and `engines.node` is `>=22.22.3`. Scripts use the same names everywhere:

| Script                                       | Meaning                                                                   |
| -------------------------------------------- | ------------------------------------------------------------------------- |
| `start`                                      | dev server                                                                |
| `build`                                      | production build                                                          |
| `serve`                                      | serve the production build like GitHub Pages does                         |
| `test` / `test:watch`                        | unit tests (where the project has them)                                   |
| `e2e` / `e2e:run` / `e2e:ui` / `e2e:install` | Playwright: build and test / test only / UI mode / download Chromium      |
| `screenshots`                                | regenerate `.github/screenshots/*.png` for the README                     |
| `lint` / `lint:fix`                          | ESLint and Stylelint                                                      |
| `typecheck`                                  | TypeScript (TypeScript projects)                                          |
| `format` / `format:check`                    | Prettier                                                                  |
| `check`                                      | everything CI checks before building: formatting, lint, types, unit tests |

**TypeScript.** Every TypeScript project has `strict` plus `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch` and `noUncheckedIndexedAccess`. Projects may add more (cosmos-stories: `noPropertyAccessFromIndexSignature`; pixi-neon-district: `exactOptionalPropertyTypes`, unused locals and parameters).

**Dependencies.** The latest versions, with deliberate exceptions noted in each CLAUDE.md. In particular, TypeScript stays on 6.0 because `typescript-eslint` and Angular 22 do not support 7.0 yet.

**Tests.** Every project has Playwright tests against its production build, on a desktop and a Pixel 7 viewport, served the way GitHub Pages serves it. `CHROMIUM_PATH` points Playwright and the screenshot scripts at a specific browser binary (useful in sandboxes). Projects with logic worth isolating also have Vitest unit tests.

**CI.** `.github/workflows/ci.yml` with the same job names: _Lint and types_, _Unit tests_, _Build_, _End-to-end (Playwright)_, _Lighthouse_ (Angular projects and livery), _Visual regression_ (livery, in the Playwright container), _Deploy to GitHub Pages_. It runs on `ubuntu-24.04`, reads the Node version from `.nvmrc`, and uses the same action versions everywhere. Deploys go from `master` only, and only after the gates pass. The header of the workflow lists the one-time repository settings; the `github-pages` environment must allow `master`.

**Documentation.** The README follows one outline: title, one line, a paragraph, **Open the live demo**, screenshots, then _Features_, _Tech stack_, _How it works_, _Testing_ (a table), _Project structure_, _Running locally_, _Deployment_, _Roadmap_, _Credits_ (only where the project uses other people's content), _License_, _Author_. The roadmap lists only what comes next; what is done is described in the sections above it. The voice is calm and specific, in British English, with no badges and no marketing adjectives. Explain _why_ in prose. `CLAUDE.md` follows one outline too: 1. What this is, 2. Toolchain, 3. Commands, 4. Repository map, 5. Architecture, 6. Invariants - do not break, 7. Conventions (project-specific), 8. Testing guide, 9. Recipes, 10. CI/CD, 11. Troubleshooting, 12. Known limitations, then this section, word for word. Both describe the project as it is, not how it got there. There is no CHANGELOG and no ADR folder: decisions live in _How it works_ and in this file. `.github/social-preview.png` (1280×640) is the repository's social preview, and every project uses the same design.

**Scripts and tooling.** Node scripts are `.mjs`. TypeScript scripts run through Node's type stripping, and are used only when they share code with the app (cosmos-stories, livery). Scripts have a header comment with usage examples.

### Code style

The rules every change follows, in every language of the portfolio. The list grows: add a rule here, in every repository at once.

1. **Comments are meaningful.** A comment says why the code is the way it is, or what a reader could not know from the code: a browser quirk, a spec, a trade-off. When the code already says what it does, it needs no comment.
2. **Names explain themselves.** A variable, a function or a type is named after what it is for (`unpaidInvoices`, `formatMoney`, `TenantRouteData`), so its role is clear without a comment. No abbreviations beyond the common ones (`id`, `url`, `i18n`).
3. **Return early.** Handle the invalid, empty and error cases first and leave the function; the main path then reads without nesting. No `else` after a `return`.
4. **One function, one job.** A function does one thing, and its name says which. When a name needs "and", or a block needs a comment to say what it does, it becomes a function of its own.

**TypeScript.**

- Strict mode is on everywhere, with the extra flags listed above.
- Never use `any`. Use `unknown` for a value whose type is not known yet, and narrow it with a check or a type guard. `no-explicit-any` enforces it.
- Every exported function states its return type, and so does every API route handler, loader and action. `explicit-module-boundary-types` enforces it; an inferred type is fine for local functions.
