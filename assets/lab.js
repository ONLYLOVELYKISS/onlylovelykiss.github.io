(() => {
  const clock = document.querySelector('[data-lab-clock]');
  const date = document.querySelector('[data-lab-date]');
  const hue = document.querySelector('[data-hue-range]');
  const output = document.querySelector('[data-hue-output]');
  const swatch = document.querySelector('[data-lab-swatch]');
  const reset = document.querySelector('[data-lab-reset]');
  const play = document.querySelector('[data-voice-play]');
  const stop = document.querySelector('[data-voice-stop]');
  const voiceLabel = document.querySelector('[data-voice-label]');
  const voiceStatus = document.querySelector('[data-voice-status]');

  const applyHue = (value) => {
    const next = Math.min(280, Math.max(160, Number(value) || 212));
    document.documentElement.style.setProperty('--lab-hue', next);
    if (hue) hue.value = next;
    if (output) {
      output.value = `${next}°`;
      output.textContent = `${next}°`;
    }
    if (swatch) swatch.style.background = `hsl(${next} 78% 58%)`;
  };

  if (hue && output && swatch) {
    try { applyHue(localStorage.getItem('mom-lab-hue') || hue.value); } catch { applyHue(hue.value); }
    hue.addEventListener('input', () => {
      applyHue(hue.value);
      try { localStorage.setItem('mom-lab-hue', hue.value); } catch {}
    });
    reset?.addEventListener('click', () => {
      applyHue(212);
      try { localStorage.removeItem('mom-lab-hue'); } catch {}
    });
  }

  const updateClock = () => {
    const now = new Date();
    if (clock) clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (date) date.textContent = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  };
  updateClock();
  window.setInterval(updateClock, 1000);

  const supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const text = 'Mom 是 Kang 的个人空间，记录正在构建的项目、技术实践与数字实验。这里关注实用工具、自动化和那些能让日常问题变简单的小软件。';
  if (!supported) {
    play?.setAttribute('hidden', '');
    stop?.setAttribute('hidden', '');
    if (voiceStatus) voiceStatus.textContent = '当前浏览器不支持本地语音';
  }
  play?.addEventListener('click', () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.95;
    utterance.onstart = () => {
      voiceLabel.textContent = '朗读中';
      play.setAttribute('aria-pressed', 'true');
      if (voiceStatus) voiceStatus.textContent = '正在使用浏览器本地语音';
    };
    utterance.onend = utterance.onerror = () => {
      voiceLabel.textContent = '开始朗读';
      play.setAttribute('aria-pressed', 'false');
      if (voiceStatus) voiceStatus.textContent = '语音仅在本机播放，不会上传内容';
    };
    window.speechSynthesis.speak(utterance);
  });
  stop?.addEventListener('click', () => {
    window.speechSynthesis?.cancel();
    if (voiceLabel) voiceLabel.textContent = '开始朗读';
    play?.setAttribute('aria-pressed', 'false');
    if (voiceStatus) voiceStatus.textContent = '语音仅在本机播放，不会上传内容';
  });
  window.addEventListener('pagehide', () => window.speechSynthesis?.cancel());
})();
