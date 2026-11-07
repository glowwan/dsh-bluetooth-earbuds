# Bluetooth earbud keys (dsh-bluetooth-earbuds)

**Turn Bluetooth earbuds into a voice remote for AI.** Tap the left earbud to start Windows voice typing, speak your prompt, and the text lands in the focused input box. Tap the right earbud to send Backspace and correct a recognition error. No keyboard, no input-method switch, no window stealing.

Works with DeepSeek Harness, ChatGPT/Claude desktop apps, AI pages in a browser, Cursor/VS Code, chat apps, and any Windows text field. The plugin does not integrate with one AI vendor: it works at the system keyboard layer, so **whatever has focus receives the text**.

- **Left earbud gesture** -> start/stop Windows voice typing (`Win+H`)
- **Right earbud gesture** -> send `Backspace`
- Settings page: manual key mapping, test, backspace count, enable/disable, last key
- Windows only, no cloud service of its own; speech recognition is performed by Windows

> 中文文档: [README.md](README.md)

## Why it fits AI and agents

Speaking a long prompt is much faster than typing it, especially for:

| Task | Say |
| --- | --- |
| Ask an agent to edit code | "Change the login page error message to Chinese and add a unit test." |
| Summarize or translate | "Summarize this English email in three points and reply in Chinese." |
| Research | "Check the latest version of this library and list the breaking changes from the version in use." |
| Add constraints mid-task | "Do not touch the database; only change the API layer, then list the files you changed." |
| Chat, support, writing | Dictate directly; use the right earbud to delete a bad phrase without leaving the input box. |

In DSH, voice becomes the natural-language input channel for the agent: speak the task, let the agent execute, use the right earbud to correct a word, and continue.

## What it actually solves

Windows already has voice typing (`Win+H`), but reaching it interrupts the AI workflow. This plugin turns "start talking" and "delete that" into two earbud gestures:

- **No focus stealing**: text goes into the currently focused input box; the plugin has no window of its own.
- **App-agnostic**: browsers, Electron clients, VS Code, Notepad, chat apps.
- **No vendor app integration**: it only uses keys or volume changes Windows can see.
- **Calibratable**: different earbuds use different gestures; map keys manually or use Learn key.

## Install

Once listed in the DSH plugin market, search for **Bluetooth earbud keys** and install it.

Manual install (replace `OWNER` with the GitHub account that owns the repo; the current repo is `glowwan/dsh-bluetooth-earbuds`):

```sh
dsh plugin --profile desktop add github:glowwan/dsh-bluetooth-earbuds
```

Requirements:

- Windows 10 / 11
- DSH desktop (the Host process runs the helper)
- Connected Bluetooth earbuds with an audio endpoint in Windows
- .NET Framework 4.x `csc.exe`, included with Windows 10/11, to compile the helper on first start

## Quick start

1. Connect the earbuds and set Windows audio output to them.
2. Open **Settings > Bluetooth earbud keys** and confirm the status is **Listening**.
3. Make `Win+H` transcribe: press `Win+H` in a text field and speak. If the voice bar appears but no text is written, open **Windows Settings > Privacy & security > Speech > Online speech recognition**. Chinese voice typing usually requires it.
4. Map the left earbud to `Volume down` and the right earbud to `Volume up`; or click **Learn key** and perform the gesture.
5. Focus the target input box. Triple-tap the left earbud and speak; triple-tap the right earbud to delete.

> The plugin does not change Windows privacy settings automatically. Enable online speech yourself in step 3.

## Earbud requirements and limitations

Windows only sees **key/volume commands**, not which earbud produced them. Therefore:

- The two sides must send **different** commands for the plugin to distinguish them.
- If both sides send Play/Pause, no software can tell left from right.
- If a long press only beeps inside the earbuds and sends no Windows event, software cannot use it as a shortcut.

The TWS earbuds used for testing:

- Left triple-tap -> volume down (Windows volume bar appears)
- Right triple-tap -> volume up
- Long press -> beep inside the earbuds only, no Windows event
- Single tap -> very likely Play/Pause on both sides

Default mapping: **left volume-down -> voice, right volume-up -> Backspace**. The helper waits for the gesture to settle, fires exactly once, restores the volume, and applies a 1.6-second cooldown. This prevents a slow triple-tap from firing twice and immediately toggling `Win+H` closed. The Windows volume bar may flash briefly; the volume level is restored.

If your earbud vendor app can map a **single or double tap** to volume down/up, you can use a gentler gesture. The plugin only cares about the resulting key, not the number of taps.

## Privacy and permissions

- The plugin does not record audio, run a cloud service, or upload audio.
- Speech recognition is performed by Windows voice typing. With **Online speech recognition** enabled, audio is sent to Microsoft under Microsoft's privacy policy. Turning it off may prevent Chinese `Win+H` from transcribing.
- The local helper does three things: watches keys/volume changes, injects `Win+H`, injects `Backspace`.
- The helper is compiled locally from the included source: `helper/EarbudHelper.cs`.
- It uses low-level keyboard hooks, Raw Input, volume-change detection, and `SendInput`; these operate only on the local Windows session.
- Closing DSH stops the helper and the earbud shortcuts.

## Known limitations

- Windows only; requires DSH to be running.
- Earbuds that send the same key from both sides cannot be distinguished.
- A long-press beep that never reaches Windows cannot be used.
- At 0% or 100% volume the corresponding direction may not be detected.
- Keyboard volume keys also trigger the same gestures; disable shortcuts if that is unwanted.
- The plugin cannot inject keys into elevated windows unless it runs with the same elevation.
- Speech quality, language support, and online/offline behavior are controlled by Windows, not this plugin.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Status says Not running | Click **Restart helper** and read the error. |
| Triple-tap only shows the volume bar | Confirm left/right are mapped to Volume down/up and the helper is listening; avoid 0%/100% volume. |
| Left triggers voice but no text | Test `Win+H` manually; check online speech recognition and the default microphone. |
| Right does not delete | The cursor must be in a text field with text before it. |
| Long press does nothing | Long press sends no Windows event; it cannot be detected. |
| Volume bar flashes | Windows system feedback; the plugin restores the level but cannot hide the bar. |
| Some apps do not react | If the target runs elevated, the plugin needs matching elevation. |

## Development

- `index.js` - Host: helper lifecycle, state file, settings HTTP API, agent tool.
- `client.js` - DSH settings page (React, no build step).
- `helper/EarbudHelper.cs` - Windows helper source; compiled on first start with the in-box `csc.exe`.
- `cordis.patch.yml` - bundle plugin row.

State file:

```
%USERPROFILE%\.dsh\plugin-data\bluetooth-earbuds.json
```

## License

MIT
