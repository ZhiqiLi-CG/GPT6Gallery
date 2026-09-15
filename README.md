# GPT-6 World Gallery

Interactive 3D worlds written as code by GPT-6 (`gpt-6-astra`, reasoning effort high) inside a spatially adaptive
recursive world-building system. Every scene is a set of JavaScript modules; each module exports
`build(THREE, ctx)` and returns the geometry of one region or object group in world coordinates. The gallery
composes the modules of the chosen scene in the browser with three.js and lets you orbit around the result.

**Live page:** enable GitHub Pages for this repository (Settings → Pages → Deploy from a branch → `main`, `/ (root)`)
and open `https://<user>.github.io/<repo>/`. Nothing is built; the page is static.

**Locally:** modules are ES modules, so the folder must be served over HTTP:

```bash
python3 -m http.server 8080      # then open http://localhost:8080/
```

## Scenes

| id | scene | modules |
|---|---|---|
| `japanese-island-town` | a small Japanese island town, condition "detail: high" — 39 tasks, 5 levels | 39 |
| `japanese-island-town-wide` | the same island town, root split into nine districts with the depth cap at 7 — 31 tasks, 3 levels, 1841 objects | 31 |
| `riverside-village` | a riverside village with a mill, a bridge and a harbor — 27 tasks, 4 levels | 27 |
| `medieval-village` | a medieval village — 4 tasks | 4 |
| `japanese-island-town-v1` | the same island town, first run without the detail condition — 5 tasks | 5 |

Each scene folder holds `scene.json` (title, prompt, conditions, bounds, module order, cameras, run statistics),
`modules/*.js` (the world program, untouched output of the run), `interfaces.json` and `objects.json` (the record
the modules were written against), `preview.png` and the run's `report.md`.

## Adding a scene

Copy a run's `world/modules/`, `world/interfaces.json`, `world/objects.json` and `world/cameras.json` into
`scenes/<id>/`, write `scenes/<id>/scene.json` with `title`, `prompt`, `bounds`, `y`, `modules` (in delivery order,
`root.js` first) and `cameras`, and add `{"id", "title"}` to `scenes/index.json`.
