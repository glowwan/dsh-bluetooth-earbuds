window.__ModuleLoader__.load({
  id: 'dsh-bluetooth-earbuds',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useCallback, useEffect, useMemo, useState } = React

    const ROUTE = '/bluetooth-earbuds'
    const SELECTABLE_KEYS = ['VolumeDown', 'VolumeUp', 'MediaPlayPause', 'MediaPrevTrack', 'MediaNextTrack', 'MediaStop']

    const DICT = {
      en: {
        section: 'Bluetooth earbud keys',
        title: 'Bluetooth earbud keys',
        intro: 'Tap the left earbud to start Windows voice typing. Tap the right earbud to send Backspace. Works in any focused app, including browsers, chat windows, and AI tools.',
        listening: 'Listening',
        stopped: 'Not running',
        unsupported: 'Windows only',
        helperStopped: 'The background helper is not running.',
        restart: 'Restart helper',
        leftTitle: 'Left earbud',
        leftAction: 'Start Windows voice typing (Win+H)',
        rightTitle: 'Right earbud',
        rightAction: 'Send Backspace',
        keyLabel: 'Detected key',
        manualKey: 'Choose key manually',
        volumeModeTitle: 'Volume-key gestures',
        volumeMode: 'Your earbuds report touches as volume changes. Left triple-tap lowers the volume, right triple-tap raises it. The helper recognizes the gesture, restores the volume, and may briefly show the Windows volume bar.',
        longPress: 'A long-press beep is internal to the earbuds and is not sent to Windows, so it cannot be used as a shortcut trigger.',
        learn: 'Learn key',
        learning: 'Touch the left earbud now…',
        learningRight: 'Touch the right earbud now…',
        test: 'Test',
        testing: 'Test sent',
        notLearned: 'Not calibrated',
        backspaces: 'Backspaces per tap',
        backspaceHelp: 'Hold-free taps repeat the key; choose how many characters one tap removes.',
        options: 'Behavior',
        enabled: 'Enable shortcuts',
        enabledHelp: 'Turn off to let media keys behave normally without uninstalling.',
        swallow: 'Block the original media key',
        swallowHelp: 'Recommended. Stops the earbud tap from also pausing music or changing tracks.',
        lastEvent: 'Last earbud event',
        noEvent: 'No earbud key received yet.',
        conflict: 'Both earbuds sent the same key. Windows cannot tell left from right for that gesture. In the earbud app, give one side a different gesture (for example previous/next track), then learn both sides again.',
        learnConflict: 'That is the key already used by the other earbud. Choose a different gesture for this side, then learn again.',
        learnTimeout: 'No earbud key arrived. Touch the earbud again, or check that it is connected and sends media keys to Windows.',
        warningTitle: 'Important: Windows sees media/volume keys, not left/right earbuds',
        warning: 'Most Bluetooth earbuds send the same command from both buds, and Windows cannot tell which ear touched. This plugin can separate them only when the two sides send different keys. Your earbuds send volume down from the left triple-tap and volume up from the right triple-tap, so use triple-tap. Long-press beeps stay inside the earbuds and never reach Windows.',
        setupTitle: 'Before first use',
        setup: '1. Connect the earbuds and set Windows as the audio output. 2. Press Win+H once in a text field. If the voice bar appears but no text is written, open Windows Settings → Privacy & security → Speech and turn on Online speech recognition. 3. Choose each earbud key manually or use Learn key. 4. If your earbuds send volume keys, use triple-tap: left = volume down, right = volume up.',
        privacy: 'Keys are handled locally. The plugin does not record or upload audio; Windows performs speech recognition.',
        lastLearned: 'Learned',
        error: 'Something went wrong',
        loading: 'Reading status…',
        renderError: 'The settings panel failed to render.',
        dismiss: 'Dismiss',
        voiceTestHint: 'Win+H will be sent in 2.5 seconds. Click into the text field where you want to dictate now.',
        backspaceTestHint: 'Backspace sent. Click into a text field to try it again.',
        stateFile: 'Saved mapping',
        copy: 'Copy',
        copied: 'Copied',
        key_MediaPlayPause: 'Play / pause',
        key_MediaNextTrack: 'Next track',
        key_MediaPrevTrack: 'Previous track',
        key_MediaStop: 'Stop',
        key_MediaSelect: 'Media select',
        key_VolumeMute: 'Mute',
        key_VolumeDown: 'Volume down',
        key_VolumeUp: 'Volume up',
        key_BrowserBack: 'Browser back',
        key_BrowserForward: 'Browser forward',
        key_Enter: 'Enter',
        key_Space: 'Space',
        key_Tab: 'Tab',
        key_Escape: 'Escape',
        key_Backspace: 'Backspace',
        key_Delete: 'Delete',
      },
      zh: {
        section: '蓝牙耳机语音键',
        title: '蓝牙耳机语音键',
        intro: '轻触左耳启动 Windows 语音输入，轻触右耳发送回删。对任何获得焦点的程序都有效，包括浏览器、聊天窗口和 AI 工具。',
        listening: '监听中',
        stopped: '未运行',
        unsupported: '仅支持 Windows',
        helperStopped: '后台按键助手没有运行。',
        restart: '重新启动助手',
        leftTitle: '左耳',
        leftAction: '启动 Windows 语音输入（Win+H）',
        rightTitle: '右耳',
        rightAction: '发送回删（Backspace）',
        keyLabel: '识别到的按键',
        manualKey: '手动选择按键',
        volumeModeTitle: '音量键手势模式',
        volumeMode: '你的耳机用音量变化传递触摸：左侧三击=音量减，右侧三击=音量加。插件识别手势后会还原音量，Windows 音量条可能短暂出现。',
        longPress: '长按的“嘟”声是耳机内部提示，不会发送给 Windows，因此不能作为快捷键触发条件。',
        learn: '学习按键',
        learning: '现在请轻触左耳…',
        learningRight: '现在请轻触右耳…',
        test: '测试',
        testing: '已发送测试',
        notLearned: '尚未校准',
        backspaces: '每次回删字符数',
        backspaceHelp: '每轻触一次右耳，连续发送多少次 Backspace。',
        options: '行为设置',
        enabled: '启用快捷键',
        enabledHelp: '关闭后媒体键恢复正常，不需要卸载插件。',
        swallow: '拦截原始媒体键',
        swallowHelp: '建议开启，避免轻触耳机时同时暂停音乐或切换歌曲。',
        lastEvent: '最近一次耳机按键',
        noEvent: '还没有收到耳机按键。',
        conflict: '左右耳发送了同一个按键。Windows 无法凭这个手势区分左右耳。请在耳机 App 中给一侧换一个手势（例如上一曲/下一曲），然后重新学习左右耳。',
        learnConflict: '这个按键已经被另一侧使用。请给这一侧换一个手势，然后重新学习。',
        learnTimeout: '没有收到耳机按键。请再轻触一次，或确认耳机已连接并且会向 Windows 发送媒体键。',
        warningTitle: '重要：Windows 看到的是媒体键/音量键，不是左耳或右耳',
        warning: '大多数蓝牙耳机左右耳会发送相同的命令，Windows 无法知道是哪一侧。只有两侧发送不同按键时，插件才能区分。你的耳机左侧三击发送“音量减”，右侧三击发送“音量加”，所以请用三击。长按的“嘟”声只存在于耳机内部，不会传给 Windows。',
        setupTitle: '首次使用前',
        setup: '1. 连接耳机，并把 Windows 设为音频输出。2. 在任意输入框按一次 Win+H；如果只弹出语音条但没有文字，请打开 Windows 设置 → 隐私和安全性 → 语音，开启“在线语音识别”。3. 在卡片里手动选择左右耳按键，或点“学习按键”。4. 如果你的耳机用音量键传递触摸，请用三击：左侧=音量减，右侧=音量加。',
        privacy: '按键在本地处理。插件不会录音或上传音频；语音识别由 Windows 完成。',
        lastLearned: '已学习',
        error: '出现问题',
        loading: '正在读取状态…',
        renderError: '设置页面渲染失败。',
        dismiss: '关闭',
        voiceTestHint: '2.5 秒后会发送 Win+H。现在请点击要语音输入的文本框。',
        backspaceTestHint: '已发送 Backspace。点击文本框后可以再试。',
        stateFile: '已保存的映射',
        copy: '复制',
        copied: '已复制',
        key_MediaPlayPause: '播放 / 暂停键',
        key_MediaNextTrack: '下一曲键',
        key_MediaPrevTrack: '上一曲键',
        key_MediaStop: '停止键',
        key_MediaSelect: '媒体选择键',
        key_VolumeMute: '静音键',
        key_VolumeDown: '音量减键',
        key_VolumeUp: '音量加键',
        key_BrowserBack: '浏览器后退键',
        key_BrowserForward: '浏览器前进键',
        key_Enter: '回车键',
        key_Space: '空格键',
        key_Tab: 'Tab 键',
        key_Escape: 'Esc 键',
        key_Backspace: '退格键',
        key_Delete: 'Delete 键',
      },
    }

    const UI_IS_ZH = (typeof document !== 'undefined' && /^zh/i.test(document.documentElement.lang || ''))
      || (typeof navigator !== 'undefined' && /^zh/i.test(navigator.language || ''))
    const FALLBACK_DICT = UI_IS_ZH ? DICT.zh : DICT.en
    const fallbackT = (key) => FALLBACK_DICT[key] || DICT.en[key] || key

    const STYLE = `      .dsh-bt-page { max-width: 780px; margin: 0 auto; padding: 8px 2px 40px; color: var(--dsw-alias-label-primary); }
      .dsh-bt-hero { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 20px; }
      .dsh-bt-mark { width: 44px; height: 44px; flex: 0 0 auto; border-radius: 12px; background: var(--dsw-alias-bg-layer-2); display: grid; place-items: center; }
      .dsh-bt-title { margin: 0; font-size: 20px; line-height: 1.3; font-weight: 650; }
      .dsh-bt-intro { margin: 5px 0 0; font-size: 13px; line-height: 1.55; color: var(--dsw-alias-label-secondary); }
      .dsh-bt-status { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-layer-1); margin-bottom: 16px; font-size: 13px; }
      .dsh-bt-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--dsw-alias-state-idle-primary); flex: 0 0 auto; }
      .dsh-bt-dot.on { background: var(--dsw-alias-state-success-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-state-success-primary) 16%, transparent); }
      .dsh-bt-dot.warn { background: var(--dsw-alias-state-warn-primary); }
      .dsh-bt-status-text { flex: 1; min-width: 0; }
      .dsh-bt-status-sub { color: var(--dsw-alias-label-secondary); font-size: 12px; margin-top: 1px; }
      .dsh-bt-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
      @media (max-width: 640px) { .dsh-bt-grid { grid-template-columns: 1fr; } }
      .dsh-bt-card { border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px; background: var(--dsw-alias-bg-layer-1); padding: 16px; min-width: 0; }
      .dsh-bt-card-head { display: flex; align-items: center; gap: 9px; margin-bottom: 4px; }
      .dsh-bt-side-icon { width: 26px; height: 26px; border-radius: 8px; background: var(--dsw-alias-bg-layer-2); display: grid; place-items: center; flex: 0 0 auto; }
      .dsh-bt-side-title { font-size: 14px; font-weight: 650; }
      .dsh-bt-action { font-size: 12px; color: var(--dsw-alias-label-secondary); margin: 0 0 12px; line-height: 1.45; }
      .dsh-bt-key-box { display: flex; align-items: center; justify-content: space-between; gap: 8px; border: 1px dashed var(--dsw-alias-border-l2); border-radius: 8px; padding: 9px 10px; margin-bottom: 12px; min-height: 38px; }
      .dsh-bt-key-label { font-size: 11px; color: var(--dsw-alias-label-secondary); }
      .dsh-bt-key-value { font-size: 13px; font-weight: 600; overflow-wrap: anywhere; text-align: right; }
      .dsh-bt-key-value.muted { color: var(--dsw-alias-label-secondary); font-weight: 400; }
      .dsh-bt-manual { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin: -4px 0 12px; }
      .dsh-bt-manual .dsh-bt-select { max-width: 58%; }
      .dsh-bt-actions { display: flex; gap: 8px; flex-wrap: wrap; }
      .dsh-bt-btn { appearance: none; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); border-radius: 7px; padding: 6px 11px; font: inherit; font-size: 12px; line-height: 1.3; cursor: pointer; }
      .dsh-bt-btn:hover:not(:disabled) { background: var(--dsw-alias-bg-layer-2); }
      .dsh-bt-btn:disabled { opacity: .5; cursor: not-allowed; }
      .dsh-bt-btn.primary { background: var(--dsw-alias-brand-primary); border-color: transparent; color: var(--dsw-alias-bg-base); font-weight: 600; }
      .dsh-bt-btn.primary:hover:not(:disabled) { filter: brightness(1.06); background: var(--dsw-alias-brand-primary); }
      .dsh-bt-learn-hint { margin: 10px 0 0; font-size: 12px; line-height: 1.45; color: var(--dsw-alias-state-warn-primary); }
      .dsh-bt-panel { margin-top: 16px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px; background: var(--dsw-alias-bg-layer-1); padding: 6px 16px; }
      .dsh-bt-row { display: flex; align-items: center; gap: 18px; padding: 13px 0; border-bottom: 1px solid var(--dsw-alias-border-l1); }
      .dsh-bt-row:last-child { border-bottom: 0; }
      .dsh-bt-row-copy { flex: 1; min-width: 0; }
      .dsh-bt-row-title { font-size: 13px; font-weight: 550; }
      .dsh-bt-row-help { margin-top: 2px; font-size: 12px; color: var(--dsw-alias-label-secondary); line-height: 1.45; }
      .dsh-bt-switch { width: 38px; height: 22px; flex: 0 0 auto; border-radius: 999px; border: 1px solid var(--dsw-alias-border-l2); padding: 2px; background: var(--dsw-alias-bg-layer-2); cursor: pointer; transition: background .15s ease, border-color .15s ease; position: relative; box-sizing: border-box; }
      .dsh-bt-switch.on { background: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary); }
      .dsh-bt-switch:disabled { opacity: .5; cursor: not-allowed; }
      .dsh-bt-knob { display: block; width: 16px; height: 16px; border-radius: 50%; background: var(--dsw-alias-label-secondary); transition: transform .15s ease, background .15s ease; }
      .dsh-bt-switch.on .dsh-bt-knob { transform: translateX(16px); background: var(--dsw-alias-bg-base); }
      .dsh-bt-select { font: inherit; font-size: 12px; color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-base); border: 1px solid var(--dsw-alias-border-l2); border-radius: 7px; padding: 5px 8px; }
      .dsh-bt-note { margin-top: 16px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px; background: var(--dsw-alias-bg-layer-1); padding: 14px 16px; font-size: 12px; line-height: 1.6; color: var(--dsw-alias-label-secondary); }
      .dsh-bt-note strong { color: var(--dsw-alias-label-primary); font-weight: 600; }
      .dsh-bt-note.warn { border-color: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 38%, var(--dsw-alias-border-l1)); }
      .dsh-bt-note.warn strong { color: var(--dsw-alias-state-warn-primary); }
      .dsh-bt-note + .dsh-bt-note { margin-top: 10px; }
      .dsh-bt-last { display: flex; align-items: center; gap: 8px; padding: 9px 0 2px; font-size: 12px; color: var(--dsw-alias-label-secondary); border-top: 1px solid var(--dsw-alias-border-l1); margin-top: 3px; }
      .dsh-bt-last code { font-family: var(--dsw-font-mono, monospace); font-size: 11px; color: var(--dsw-alias-label-primary); }
      .dsh-bt-toast { margin-bottom: 14px; border-radius: 9px; padding: 10px 12px; font-size: 12px; line-height: 1.5; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-1); display: flex; gap: 10px; align-items: flex-start; }
      .dsh-bt-toast.error { border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 40%, var(--dsw-alias-border-l1)); color: var(--dsw-alias-state-error-primary); }
      .dsh-bt-toast.success { border-color: color-mix(in srgb, var(--dsw-alias-state-success-primary) 40%, var(--dsw-alias-border-l1)); }
      .dsh-bt-toast-body { flex: 1; min-width: 0; }
      .dsh-bt-toast-close { border: 0; background: transparent; color: inherit; cursor: pointer; font: inherit; padding: 0 2px; opacity: .75; }
      .dsh-bt-path { font-family: var(--dsw-font-mono, monospace); font-size: 11px; overflow-wrap: anywhere; }
    `

    function tFactory(ctx) {
      const fallback = fallbackT
      const namespace = 'dsh-bluetooth-earbuds-ui'
      try {
        ctx.effect(() => ctx.locale.register(namespace, { en: DICT.en, zh: DICT.zh }))
        const bound = ctx.locale.bind(namespace)
        return (key) => {
          try {
            const value = bound(key)
            return value === undefined || value === null ? fallback(key) : value
          } catch {
            return fallback(key)
          }
        }
      } catch {
        try {
          ctx.locale.register(namespace, { en: DICT.en, zh: DICT.zh })
          const bound = ctx.locale.bind(namespace)
          return (key) => {
            try {
              const value = bound(key)
              return value === undefined || value === null ? fallback(key) : value
            } catch {
              return fallback(key)
            }
          }
        } catch {
          return fallback
        }
      }
    }

    function keyName(t, key) {
      if (!key) return t('notLearned')
      if (String(key).startsWith('vk:')) return key
      return t(`key_${key}`) || key
    }

    function formatTime(value) {
      if (!value) return ''
      try {
        return new Date(value).toLocaleTimeString()
      } catch {
        return ''
      }
    }

    function Icon({ children, size = 20 }) {
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.7,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
      }, children)
    }

    function MarkIcon() {
      return h(Icon, { size: 26 },
        h('path', { d: 'M6 9.5v5a3 3 0 0 0 3 3h1' }),
        h('path', { d: 'M18 9.5v5a3 3 0 0 1-3 3h-1' }),
        h('path', { d: 'M6 10.5H4.8A1.8 1.8 0 0 0 3 12.3v1.4a1.8 1.8 0 0 0 1.8 1.8H6z' }),
        h('path', { d: 'M18 10.5h1.2a1.8 1.8 0 0 1 1.8 1.8v1.4a1.8 1.8 0 0 1-1.8 1.8H18z' }),
      )
    }

    function MicIcon() {
      return h(Icon, { size: 15 },
        h('rect', { x: 9, y: 3, width: 6, height: 11, rx: 3 }),
        h('path', { d: 'M5 11a7 7 0 0 0 14 0' }),
        h('path', { d: 'M12 18v3' }),
      )
    }

    function BackspaceIcon() {
      return h(Icon, { size: 15 },
        h('path', { d: 'M21 6H9l-6 6 6 6h12z' }),
        h('path', { d: 'M13 10l4 4' }),
        h('path', { d: 'M17 10l-4 4' }),
      )
    }

    function Switch({ checked, disabled, onChange, label }) {
      return h('button', {
        type: 'button',
        role: 'switch',
        'aria-checked': checked,
        'aria-label': label,
        className: `dsh-bt-switch${checked ? ' on' : ''}`,
        disabled,
        onClick: onChange,
      }, h('span', { className: 'dsh-bt-knob' }))
    }

    function Toast({ notice, onClose, t }) {
      if (!notice) return null
      return h('div', { className: `dsh-bt-toast ${notice.kind || ''}`, role: 'status' },
        h('div', { className: 'dsh-bt-toast-body' }, notice.text),
        h('button', { type: 'button', className: 'dsh-bt-toast-close', onClick: onClose, 'aria-label': t('dismiss') }, '×'),
      )
    }

    function SettingsPage() {
      const t = useSettingsLocale()
      const [status, setStatus] = useState(null)
      const [notice, setNotice] = useState(null)
      const [busy, setBusy] = useState('')
      const [copyState, setCopyState] = useState('')
      const [backspaceDraft, setBackspaceDraft] = useState(null)

      const refresh = useCallback(async (signal) => {
        try {
          const response = await fetch(`${ROUTE}/status`, { cache: 'no-store', signal })
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          const data = await response.json()
          setStatus(data)
          return data
        } catch (error) {
          if (error && error.name === 'AbortError') return undefined
          setNotice({ kind: 'error', text: `${t('error')}: ${error instanceof Error ? error.message : String(error)}` })
          return undefined
        }
      }, [t])

      useEffect(() => {
        const controller = new AbortController()
        refresh(controller.signal)
        const timer = setInterval(() => refresh(controller.signal), 1500)
        return () => {
          controller.abort()
          clearInterval(timer)
        }
      }, [refresh])

      useEffect(() => {
        if (!notice) return undefined
        const timer = setTimeout(() => setNotice(null), 7000)
        return () => clearTimeout(timer)
      }, [notice])

      const config = status?.config
      const helper = status?.helper
      const running = Boolean(helper?.running)
      const conflict = Boolean(status?.conflict)
      const pending = status?.pendingLearn
      const lastLearned = status?.lastLearned
      const lastEvent = status?.lastEvent
      const lastError = helper?.error

      useEffect(() => {
        if (config && backspaceDraft === null) setBackspaceDraft(config.backspaceCount)
      }, [config, backspaceDraft])

      const post = useCallback(async (path, body, signal) => {
        const response = await fetch(`${ROUTE}${path}`, {
          method: 'POST',
          cache: 'no-store',
          signal,
          headers: {
            'content-type': 'application/json',
            'x-dsh-earbuds': '1',
          },
          body: JSON.stringify(body || {}),
        })
        const data = await response.json().catch(() => ({}))
        if (!response.ok || data.ok === false) {
          throw new Error(data.error || `HTTP ${response.status}`)
        }
        return data
      }, [])

      const run = useCallback(async (name, task) => {
        setBusy(name)
        try {
          await task()
        } catch (error) {
          setNotice({ kind: 'error', text: error instanceof Error ? error.message : String(error) })
        } finally {
          setBusy('')
        }
      }, [])

      const learn = useCallback((side) => {
        run(`learn:${side}`, async () => {
          await post('/learn', { side })
          setNotice({ kind: 'success', text: side === 'left' ? t('learning') : t('learningRight') })
          await refresh()
        })
      }, [post, refresh, run, t])

      const test = useCallback((side) => {
        run(`test:${side}`, async () => {
          await post('/test', { side })
          setNotice({ kind: 'success', text: side === 'left' ? t('voiceTestHint') : t('backspaceTestHint') })
          await refresh()
        })
      }, [post, refresh, run, t])

      const save = useCallback((patch) => {
        run('save', async () => {
          await post('/config', patch)
          await refresh()
        })
      }, [post, refresh, run])

      const restart = useCallback(() => {
        run('restart', async () => {
          await post('/restart', {})
          setNotice({ kind: 'success', text: t('listening') })
          await new Promise((resolve) => setTimeout(resolve, 1800))
          await refresh()
        })
      }, [post, refresh, run, t])

      const copyPath = useCallback(async () => {
        if (!status?.stateFile) return
        try {
          await navigator.clipboard.writeText(status.stateFile)
          setCopyState('copied')
          setTimeout(() => setCopyState(''), 1800)
        } catch {
          setCopyState('')
        }
      }, [status?.stateFile])

      const statusText = !status
        ? (notice?.kind === 'error' ? t('error') : t('loading'))
        : !status.supported ? t('unsupported') : running ? t('listening') : t('stopped')
      const statusSub = running
        ? (conflict ? t('conflict') : (lastEvent ? `${t('lastEvent')}: ${lastEvent.side === 'left' ? t('leftTitle') : t('rightTitle')} · ${keyName(t, lastEvent.key)}` : t('noEvent')))
        : (helper?.compileError || lastError || t('helperStopped'))

      const learnLabel = (side) => pending?.side === side
        ? (side === 'left' ? t('learning') : t('learningRight'))
        : t('learn')

      const optionsFor = (key) => {
        const values = SELECTABLE_KEYS.slice()
        if (key && !values.includes(key)) values.push(key)
        return values
      }
      const volumeMode = ['VolumeUp', 'VolumeDown'].includes(config?.leftKey)
        || ['VolumeUp', 'VolumeDown'].includes(config?.rightKey)

      return h('section', { className: 'dsh-bt-page' },
        h('style', null, STYLE),
        h('div', { className: 'dsh-bt-hero' },
          h('div', { className: 'dsh-bt-mark' }, h(MarkIcon)),
          h('div', null,
            h('h1', { className: 'dsh-bt-title' }, t('title')),
            h('p', { className: 'dsh-bt-intro' }, t('intro')),
          ),
        ),
        h(Toast, { notice, onClose: () => setNotice(null), t }),
        conflict ? h('div', { className: 'dsh-bt-toast error', role: 'alert' }, h('div', { className: 'dsh-bt-toast-body' }, t('conflict'))) : null,
        lastLearned?.conflict ? h('div', { className: 'dsh-bt-toast error', role: 'alert' }, h('div', { className: 'dsh-bt-toast-body' }, t('learnConflict'))) : null,
        !running && status ? h('div', { className: 'dsh-bt-toast error' },
          h('div', { className: 'dsh-bt-toast-body' },
            h('div', null, lastError || helper?.compileError || t('helperStopped')),
            helper?.compileError ? h('div', { className: 'dsh-bt-path' }, helper.compileError) : null,
          ),
          h('button', { type: 'button', className: 'dsh-bt-btn', onClick: restart, disabled: busy === 'restart' }, t('restart')),
        ) : null,
        h('div', { className: 'dsh-bt-status' },
          h('span', { className: `dsh-bt-dot${running ? (conflict ? ' warn' : ' on') : ''}` }),
          h('div', { className: 'dsh-bt-status-text' },
            h('div', null, statusText),
            h('div', { className: 'dsh-bt-status-sub' }, statusSub),
          ),
          !running ? h('button', { type: 'button', className: 'dsh-bt-btn', onClick: restart, disabled: busy === 'restart' }, t('restart')) : null,
        ),
        h('div', { className: 'dsh-bt-grid' },
          h('article', { className: 'dsh-bt-card' },
            h('div', { className: 'dsh-bt-card-head' },
              h('span', { className: 'dsh-bt-side-icon' }, h(MicIcon)),
              h('div', null,
                h('div', { className: 'dsh-bt-side-title' }, t('leftTitle')),
                h('div', { className: 'dsh-bt-action' }, t('leftAction')),
              ),
            ),
            h('div', { className: 'dsh-bt-key-box' },
              h('span', { className: 'dsh-bt-key-label' }, t('keyLabel')),
              h('span', { className: `dsh-bt-key-value${!config ? ' muted' : ''}` }, keyName(t, config?.leftKey)),
            ),
            h('div', { className: 'dsh-bt-manual' },
              h('span', { className: 'dsh-bt-key-label' }, t('manualKey')),
              h('select', {
                className: 'dsh-bt-select',
                value: config?.leftKey || '',
                disabled: !running || busy === 'save',
                onChange: (event) => save({ leftKey: event.target.value }),
              }, optionsFor(config?.leftKey).map((key) => h('option', { key, value: key }, keyName(t, key)))),
            ),
            h('div', { className: 'dsh-bt-actions' },
              h('button', {
                type: 'button',
                className: 'dsh-bt-btn primary',
                disabled: !running || Boolean(pending) || busy === 'learn:left',
                onClick: () => learn('left'),
              }, learnLabel('left')),
              h('button', {
                type: 'button',
                className: 'dsh-bt-btn',
                disabled: !running || busy === 'test:left',
                onClick: () => test('left'),
              }, busy === 'test:left' ? t('testing') : t('test')),
            ),
            pending?.side === 'left' ? h('p', { className: 'dsh-bt-learn-hint' }, t('learning')) : null,
            lastLearned?.side === 'left' && !lastLearned.conflict ? h('div', { className: 'dsh-bt-last' }, `${t('lastLearned')}: `, h('code', null, keyName(t, lastLearned.key))) : null,
          ),
          h('article', { className: 'dsh-bt-card' },
            h('div', { className: 'dsh-bt-card-head' },
              h('span', { className: 'dsh-bt-side-icon' }, h(BackspaceIcon)),
              h('div', null,
                h('div', { className: 'dsh-bt-side-title' }, t('rightTitle')),
                h('div', { className: 'dsh-bt-action' }, t('rightAction')),
              ),
            ),
            h('div', { className: 'dsh-bt-key-box' },
              h('span', { className: 'dsh-bt-key-label' }, t('keyLabel')),
              h('span', { className: `dsh-bt-key-value${!config ? ' muted' : ''}` }, keyName(t, config?.rightKey)),
            ),
            h('div', { className: 'dsh-bt-manual' },
              h('span', { className: 'dsh-bt-key-label' }, t('manualKey')),
              h('select', {
                className: 'dsh-bt-select',
                value: config?.rightKey || '',
                disabled: !running || busy === 'save',
                onChange: (event) => save({ rightKey: event.target.value }),
              }, optionsFor(config?.rightKey).map((key) => h('option', { key, value: key }, keyName(t, key)))),
            ),
            h('div', { className: 'dsh-bt-actions' },
              h('button', {
                type: 'button',
                className: 'dsh-bt-btn primary',
                disabled: !running || Boolean(pending) || busy === 'learn:right',
                onClick: () => learn('right'),
              }, learnLabel('right')),
              h('button', {
                type: 'button',
                className: 'dsh-bt-btn',
                disabled: !running || busy === 'test:right',
                onClick: () => test('right'),
              }, busy === 'test:right' ? t('testing') : t('test')),
            ),
            pending?.side === 'right' ? h('p', { className: 'dsh-bt-learn-hint' }, t('learningRight')) : null,
            lastLearned?.side === 'right' && !lastLearned.conflict ? h('div', { className: 'dsh-bt-last' }, `${t('lastLearned')}: `, h('code', null, keyName(t, lastLearned.key))) : null,
          ),
        ),
        h('div', { className: 'dsh-bt-panel' },
          h('div', { className: 'dsh-bt-row' },
            h('div', { className: 'dsh-bt-row-copy' },
              h('div', { className: 'dsh-bt-row-title' }, t('backspaces')),
              h('div', { className: 'dsh-bt-row-help' }, t('backspaceHelp')),
            ),
            h('select', {
              className: 'dsh-bt-select',
              value: backspaceDraft ?? config?.backspaceCount ?? 1,
              disabled: !running,
              onChange: (event) => {
                const value = Number(event.target.value)
                setBackspaceDraft(value)
                save({ backspaceCount: value })
              },
            }, [1, 2, 3, 4, 5, 10].map((value) => h('option', { key: value, value }, String(value)))),
          ),
          h('div', { className: 'dsh-bt-row' },
            h('div', { className: 'dsh-bt-row-copy' },
              h('div', { className: 'dsh-bt-row-title' }, t('enabled')),
              h('div', { className: 'dsh-bt-row-help' }, t('enabledHelp')),
            ),
            h(Switch, {
              checked: Boolean(config?.enabled),
              disabled: !running || busy === 'save',
              onChange: () => save({ enabled: !config?.enabled }),
              label: t('enabled'),
            }),
          ),
          h('div', { className: 'dsh-bt-row' },
            h('div', { className: 'dsh-bt-row-copy' },
              h('div', { className: 'dsh-bt-row-title' }, t('swallow')),
              h('div', { className: 'dsh-bt-row-help' }, t('swallowHelp')),
            ),
            h(Switch, {
              checked: Boolean(config?.swallow),
              disabled: !running || busy === 'save',
              onChange: () => save({ swallow: !config?.swallow }),
              label: t('swallow'),
            }),
          ),
        ),
        volumeMode ? h('div', { className: 'dsh-bt-note' },
          h('strong', null, t('volumeModeTitle')),
          h('div', null, t('volumeMode')),
          h('div', { style: { marginTop: 6 } }, t('longPress')),
        ) : null,
        h('div', { className: 'dsh-bt-note warn' },
          h('strong', null, t('warningTitle')),
          h('div', null, t('warning')),
        ),
        h('div', { className: 'dsh-bt-note' },
          h('strong', null, t('setupTitle')),
          h('div', null, t('setup')),
        ),
        h('div', { className: 'dsh-bt-note' },
          h('div', null, t('privacy')),
          status?.stateFile ? h('div', { className: 'dsh-bt-last' },
            h('span', null, t('stateFile')),
            h('code', { className: 'dsh-bt-path' }, status.stateFile),
            h('button', { type: 'button', className: 'dsh-bt-btn', onClick: copyPath }, copyState === 'copied' ? t('copied') : t('copy')),
          ) : null,
        ),
      )
    }

    function useSettingsLocale() {
      return SettingsPage.t || fallbackT
    }

    class PageBoundary extends React.Component {
      constructor(props) {
        super(props)
        this.state = { error: null }
      }

      static getDerivedStateFromError(error) {
        return { error }
      }

      componentDidCatch(error, info) {
        try {
          fetch(`${ROUTE}/client-error`, {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'x-dsh-earbuds': '1',
            },
            body: JSON.stringify({
              message: error && error.message ? error.message : String(error),
              stack: error && error.stack ? error.stack : (info && info.componentStack) || '',
            }),
          }).catch(() => {})
        } catch {}
      }

      render() {
        if (this.state.error) {
          const t = this.props.t
          const detail = this.state.error && this.state.error.stack
            ? this.state.error.stack
            : String(this.state.error)
          return h('section', { className: 'dsh-bt-page' },
            h('style', null, STYLE),
            h('h1', { className: 'dsh-bt-title' }, t('renderError')),
            h('pre', { className: 'dsh-bt-path', style: { whiteSpace: 'pre-wrap', marginTop: 12 } }, detail),
          )
        }
        return this.props.children
      }
    }

    function Page(props) {
      return h(PageBoundary, { t: fallbackT }, h(SettingsPage, props))
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        const t = tFactory(ctx)
        SettingsPage.t = t
        ctx.slots.inject('settings.section', () => ctx.slots.register({
          name: 'settings.section',
          id: 'bluetooth-earbuds',
          order: 30,
          label: () => t('section'),
        }, Page))
      },
      dispose() {
        SettingsPage.t = undefined
      },
    }
  },
})
