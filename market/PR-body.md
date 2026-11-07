# Add dsh-bluetooth-earbuds

## Summary

Adds `dsh-bluetooth-earbuds`, a Windows-only DSH plugin that turns Bluetooth earbud gestures into system-wide voice dictation and Backspace shortcuts for AI apps and agents.

## What it does

- **Left earbud** (tested as a volume-down gesture) starts or stops Windows voice typing with `Win+H`; transcribed text lands in the focused input box.
- **Right earbud** (tested as a volume-up gesture) sends `Backspace`.
- Works at the system keyboard layer, so it is not tied to one AI vendor: DSH, ChatGPT/Claude desktop, browsers, VS Code/Cursor, chat windows, Notepad.
- DSH settings page: manual mapping, test actions, backspace count, enable/disable, last key, volume-gesture mode.
- Volume gestures are restored and debounced with a 1.6-second cooldown, so one slow triple-tap performs one action instead of toggling `Win+H` twice.
- The helper is compiled on first run from the included `helper/EarbudHelper.cs`; no prebuilt binary is committed.

## Limitations documented in the README

- Windows cannot distinguish left/right when both earbuds send the same command.
- A long-press beep that stays inside the earbuds cannot be used.
- Requires DSH to be running.
- Chinese `Win+H` may require Windows **Online speech recognition**; the plugin does not silently change that privacy setting.
- At 0% or 100% volume, the corresponding direction may not be detected.

## Validation

- Windows 11 build 26200, DSH 0.2.2-rc.1.
- Tested with a TWS earbud set where left triple-tap sends volume down and right triple-tap sends volume up.
- Verified: both gestures are detected as separate sides; one gesture produces one action; `Win+H` opens voice typing and transcribes after online speech was enabled; injected `Backspace` removed a character from a focused test text box.
- UI verified in Chinese and English; settings page renders without errors.

## Checklist

- [x] `package.json` declares `dsh.bundle.patch` and `dsh.client`
- [x] `cordis.patch.yml` at repository root
- [x] `dsh-plugin` topic
- [x] Windows-only behavior and limitations documented
- [x] no npm dependency required
- [x] no build scripts, no install scripts
- [x] no audio recording or upload in plugin code
- [x] MIT license
