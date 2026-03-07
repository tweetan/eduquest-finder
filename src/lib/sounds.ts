// Simple sound generation using Web Audio API
const audioCtx = typeof window !== "undefined" ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

function playTone(frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.15) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

export function playPointEarned() {
  if (!audioCtx) return;
  playTone(523, 0.15, "sine", 0.12);
  setTimeout(() => playTone(659, 0.15, "sine", 0.12), 100);
  setTimeout(() => playTone(784, 0.2, "sine", 0.12), 200);
}

export function playClaim() {
  if (!audioCtx) return;
  playTone(440, 0.1, "square", 0.08);
  setTimeout(() => playTone(554, 0.1, "square", 0.08), 80);
  setTimeout(() => playTone(659, 0.1, "square", 0.08), 160);
  setTimeout(() => playTone(880, 0.25, "sine", 0.1), 240);
}

export function playStarClaim() {
  if (!audioCtx) return;
  const notes = [523, 659, 784, 1047, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, "sine", 0.1), i * 120);
  });
}

export function playList() {
  if (!audioCtx) return;
  playTone(392, 0.12, "triangle", 0.1);
  setTimeout(() => playTone(523, 0.2, "triangle", 0.12), 120);
}

export function playError() {
  if (!audioCtx) return;
  playTone(200, 0.15, "sawtooth", 0.06);
  setTimeout(() => playTone(180, 0.2, "sawtooth", 0.06), 150);
}

export function playSuccess() {
  if (!audioCtx) return;
  playTone(660, 0.1, "sine", 0.1);
  setTimeout(() => playTone(880, 0.15, "sine", 0.1), 100);
  setTimeout(() => playTone(1100, 0.2, "sine", 0.1), 200);
}

export function playClick() {
  if (!audioCtx) return;
  playTone(800, 0.05, "sine", 0.05);
}
