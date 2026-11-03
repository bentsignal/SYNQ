# Design assets

SYNQ's design files are too large for this repository and live outside it, on Shawn's Mac:

```
~/projects/SYNQ
```

- `assets/`: logos, icons, and Apple's App Store badge.
- `2d/`, `video/`: earlier App Store art, Photoshop files, and ad videos.
- `3d/`: the Blender phone scenes.
- `3d/3.0/`: the 3.0 App Store art.

## The 3.0 App Store art

`3d/3.0/` holds everything needed to change it. `v5/` is the version on the App Store; the other
`v*` folders and the loose files beside them are earlier rounds.

- `demo-library/`: the made-up albums, artists, and playlists, with Unsplash photos for covers
  (`SOURCES.txt`). It uses the same format as `apps/mobile/dev/sample-library`, so
  `synqDev.seed()` loads it into a simulator.
- `screens/`: the captured screens.
- `store/flat/`: plain screenshots, resized from the simulator's 1206×2622 to 1320×2868.
- `v5/textures/`: the captured screens with a Dynamic Island, which screenshots leave out.
- `v5/SYNQ_app_store_3.0.blend`: all the phones in one scene, each a single object. The images are
  packed into the file. F12 renders the panorama, including the bloom from the compositor.
- `v5/build_scene.py`: makes that file from nothing, and centers each panel's phones by where they
  land in the image. The phone comes from Apple's numbers: the screen outline from the iPhone 17 Pro
  simulator's framebuffer mask, the rest from Apple's
  [iPhone 17 Pro dimensional drawing](https://developer.apple.com/accessories/dimensional-drawings/).
  The back is plain, with no camera plateau or ports, so keep it facing away from the camera.
- `v5/panorama.png`: the render, 6600×2868, with no captions.
- `v5/slice.swift`: run from `v5/`, it cuts the panorama into `store/`, five 1320×2868 images in App
  Store order.

Material Preview shows the phones' metal under Blender's studio lighting; only a render shows the
scene's own lights.

The album and artist names are made up, and real album art stays out of the images. Artist photos
are silhouettes or turned away from the camera, since Unsplash has no model releases.

Put new sources in that folder rather than committing them here.
