export function playToneSequence(frequencies: number[], durationMs = 160): void {
  const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) {
    return;
  }

  const context = new AudioContextCtor();
  let offset = context.currentTime;

  for (const frequency of frequencies) {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gainNode.gain.setValueAtTime(0.0001, offset);
    gainNode.gain.exponentialRampToValueAtTime(0.06, offset + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, offset + durationMs / 1000);
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.start(offset);
    oscillator.stop(offset + durationMs / 1000);
    offset += durationMs / 1200;
  }
}
