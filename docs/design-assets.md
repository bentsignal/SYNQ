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

`3d/3.0/` holds everything needed to change it:

- `demo-library/`: the made-up albums, artists, and playlists, with Unsplash photos for covers
  (`SOURCES.txt`). It uses the same format as `apps/mobile/dev/sample-library`, so
  `synqDev.seed()` loads it into a simulator.
- `screens/`: the captured screens, and `textures/`, the same screens with a Dynamic Island,
  which the phone model doesn't have.
- `SYNQ_app_store_3.0.blend`: five phones in one scene. `build_scene.py` makes it from
  `3d/SYNQ_app_store_ad_1.blend`.
- `panorama.png`: the render, 6600×2868, with no captions.
- `store/blender/`: the panorama cut into five 1320×2868 images, in App Store order.
- `store/flat/`: plain screenshots, resized from the simulator's 1206×2622 to 1320×2868.

The album and artist names are made up, and real album art stays out of the images. Artist photos
are silhouettes or turned away from the camera, since Unsplash has no model releases.

Put new sources in that folder rather than committing them here.
