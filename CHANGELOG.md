# Changelog

All notable changes to `dsh-bluetooth-earbuds` are recorded here.
Version numbers follow the plugin's `package.json`; each release is published as a GitHub Release with a prebuilt tarball.

## 1.0.4 — 2026-11-18

**Major fix: the plugin no longer hijacks the system volume.**

### Fixed

- The volume watcher treated *any* change of the Windows master volume as an earbud gesture. Pressing the keyboard volume key, dragging the volume slider in the Windows flyout, or another application changing the volume could therefore start voice typing (`Win+H`) or send `Backspace`, and the plugin then reverted the level. This is the defect users reported as "changing the volume randomly types or deletes text".
- Volume changes caused by a real `VK_VOLUME_UP` / `VK_VOLUME_DOWN` key event are now attributed to that key and are never reverted and never double-fired. Attribution is recorded by all three detection paths: the low-level keyboard hook, Raw Input, and the `GetAsyncKeyState` poller.
- A single slow triple-tap could be counted as two gestures, which toggled `Win+H` open and immediately closed again. One gesture now fires exactly once and restores the pre-gesture level.
- Large level jumps (slider drags, app-driven changes) are adopted instead of reverted.

### Changed

- **Key-less volume gestures are now opt-in.** The fallback is off by default (`volumeGesture: false`) and only exists for earbuds whose firmware changes the host volume without sending a key event. Enable it in Settings → Bluetooth earbud keys → *Key-less volume gestures (fallback)*.
- The default mapping is media keys (`MediaPlayPause` / `MediaNextTrack`) instead of volume keys, so a fresh install never touches the volume.
- `event` messages now carry `source: "key" | "volume"`, so it is visible which path triggered an action.

### Added

- Settings switch for the key-less volume fallback, with an explanation of when it is needed.
- Troubleshooting entries for "changing the volume triggers voice typing" and "triple-tap only shows the volume bar".

## 1.0.3 — 2026-11-09

### Fixed

- The settings page returned HTTP 404 because the Host registered its status route before the web server existed. The plugin now declares `inject: ['webServer']` and waits for the service.
- The status line showed "Listening" before the first status read; it now shows "Reading status…" and a real error when the read fails.

## 1.0.2 — 2026-11-07

### Changed

- First public release after the plugin market listing was merged.
- Market entry: prebuilt tarball, clarified speech-privacy wording.

## 1.0.0 — 2026-11-07

### Added

- Left earbud gesture sends `Win+H` (Windows voice typing); right earbud gesture sends `Backspace`.
- DSH settings page: manual key mapping, Learn key, test actions, Backspace count, enable/disable, last event, conflict detection.
- Local Windows helper compiled on first start from `helper/EarbudHelper.cs` with the in-box `csc.exe`.
- Detection through a low-level keyboard hook, Raw Input, and `GetAsyncKeyState` polling.
- `bluetooth_earbuds` agent tool and a local HTTP status/control route.
