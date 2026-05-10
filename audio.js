'use strict';
// ─── AUDIO MANAGER (Web Audio API – procedural, no files needed) ─────────────
const AudioManager = (() => {
  let AC = null, master = null, muted = false, bgTimer = null;

  function init() {
    if (AC) return;
    try {
      AC = new (window.AudioContext || window.webkitAudioContext)();
      master = AC.createGain();
      master.gain.value = 0.55;
      master.connect(AC.destination);
    } catch (e) { console.warn('AudioContext unavailable'); }
  }

  function resume() { if (AC && AC.state === 'suspended') AC.resume(); }

  function tone(freq, type, dur, vol, delay = 0, freqEnd = null) {
    if (!AC || muted) return;
    const t = AC.currentTime + delay;
    const osc = AC.createOscillator();
    const g   = AC.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, t + dur);
    g.gain.setValueAtTime(Math.max(0.0001, vol), t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(master);
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  function noise(dur, vol, fc = 1000, delay = 0) {
    if (!AC || muted) return;
    const t   = AC.currentTime + delay;
    const len = Math.ceil(AC.sampleRate * dur);
    const buf = AC.createBuffer(1, len, AC.sampleRate);
    const d   = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = AC.createBufferSource();
    src.buffer = buf;
    const f = AC.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = fc; f.Q.value = 1.5;
    const g = AC.createGain();
    g.gain.setValueAtTime(Math.max(0.0001, vol), t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t);
  }

  const S = {
    slash()       { tone(650,'sawtooth',0.08,0.28); noise(0.09,0.3,2200); },
    doubleSlash() {
      tone(700,'sawtooth',0.07,0.28); noise(0.08,0.28,2000);
      setTimeout(()=>{ tone(900,'sawtooth',0.07,0.28); noise(0.08,0.28,2600); }, 200);
    },
    heavySlash()  { tone(160,'sawtooth',0.28,0.55); tone(80,'square',0.28,0.4); noise(0.22,0.5,500); },
    spinSlash()   { tone(220,'sawtooth',0.5,0.4,0,1000); noise(0.5,0.35,1800); },
    hit()         { noise(0.1,0.45,900); tone(200,'square',0.08,0.28); },
    playerHit()   { tone(100,'square',0.38,0.6); noise(0.2,0.45,350); },
    block()       { tone(520,'square',0.09,0.38); tone(780,'square',0.06,0.22,0.04); },
    enemyDeath()  { tone(260,'sawtooth',0.2,0.35); tone(130,'sawtooth',0.28,0.4,0.07); noise(0.18,0.32,600); },
    swordUpgrade(){
      [523,659,784,1047,1319].forEach((f,i)=>tone(f,'sine',0.55,0.38,i*0.1));
      tone(2093,'sine',0.85,0.45,0.58);
    },
    stageClear()  { [523,659,784,523,659,1047].forEach((f,i)=>tone(f,'triangle',0.35,0.4,i*0.14)); },
    gameOver()    { tone(440,'sawtooth',0.55,0.42); tone(330,'sawtooth',0.55,0.42,0.22); tone(220,'sawtooth',1.1,0.55,0.5); },
    bossAppear()  { tone(55,'sawtooth',0.9,0.65); tone(110,'square',0.55,0.45,0.12); noise(0.55,0.38); },
    jump()        { tone(320,'sine',0.14,0.18); tone(480,'sine',0.1,0.14,0.05); },
    menuClick()   { tone(600,'sine',0.08,0.2); },
  };

  // ── Background ambient drone ─────────────────────────────────────────────
  let beatIdx = 0;
  const BASE_FREQS = [55, 65, 49, 58, 55, 73];
  function playBeat() {
    if (!AC || muted) return;
    const f = BASE_FREQS[beatIdx % BASE_FREQS.length];
    tone(f,'sawtooth',1.8,0.08);
    if (beatIdx % 2 === 0) { noise(0.12,0.06,80); tone(80,'square',0.1,0.05); }
    if (beatIdx % 4 === 3) tone(f*1.5,'triangle',0.6,0.04,0.9);
    beatIdx++;
  }

  function startBg() {
    stopBg(); resume(); playBeat();
    bgTimer = setInterval(playBeat, 1900);
  }
  function stopBg() { if (bgTimer) { clearInterval(bgTimer); bgTimer = null; } }

  function toggleMute() {
    muted = !muted;
    if (master) master.gain.value = muted ? 0 : 0.55;
    if (muted) stopBg(); else startBg();
    return muted;
  }

  function play(name) {
    if (!AC || muted) return;
    resume();
    if (S[name]) S[name]();
  }

  return { init, resume, play, startBg, stopBg, toggleMute };
})();
