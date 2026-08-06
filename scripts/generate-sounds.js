const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const OUT_DIR = path.join(__dirname, '..', 'assets', 'sounds');

fs.mkdirSync(OUT_DIR, { recursive: true });

function writeWav(fileName, samples) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples.length; i++) {
    const value = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(value * 32767), 44 + i * 2);
  }
  fs.writeFileSync(path.join(OUT_DIR, fileName), buffer);
}

function makeBuffer(durationSeconds) {
  return new Float32Array(Math.floor(durationSeconds * SAMPLE_RATE));
}

function envelopeFor(index, total, attackSeconds, releaseSeconds) {
  const attack = Math.min(1, index / Math.max(1, attackSeconds * SAMPLE_RATE));
  const releaseStart = total - releaseSeconds * SAMPLE_RATE;
  const release = index > releaseStart ? Math.max(0, (total - index) / Math.max(1, releaseSeconds * SAMPLE_RATE)) : 1;
  return attack * release;
}

function addTone(buffer, offsetSeconds, durationSeconds, frequency, amplitude, harmonics) {
  const start = Math.floor(offsetSeconds * SAMPLE_RATE);
  const count = Math.floor(durationSeconds * SAMPLE_RATE);
  for (let i = 0; i < count; i++) {
    const index = start + i;
    if (index >= buffer.length) {
      break;
    }
    const t = i / SAMPLE_RATE;
    let value = 0;
    for (const harmonic of harmonics) {
      value += Math.sin(2 * Math.PI * frequency * harmonic[0] * t) * harmonic[1];
    }
    const env = envelopeFor(i, count, Math.min(0.02, durationSeconds * 0.25), Math.min(0.12, durationSeconds * 0.45));
    buffer[index] += value * amplitude * env;
  }
}

function generateFlip() {
  const buffer = makeBuffer(0.14);
  let phase = 0;
  for (let i = 0; i < buffer.length; i++) {
    const t = i / SAMPLE_RATE;
    const frequency = 340 + 620 * (t / 0.11);
    phase += (2 * Math.PI * frequency) / SAMPLE_RATE;
    const env = Math.exp(-t * 42);
    buffer[i] = Math.sin(phase) * 0.5 * env;
  }
  writeWav('flip.wav', buffer);
}

function generateClick() {
  const buffer = makeBuffer(0.07);
  for (let i = 0; i < buffer.length; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 90);
    buffer[i] = Math.sin(2 * Math.PI * 1400 * t) * 0.45 * env;
  }
  writeWav('click.wav', buffer);
}

function generateMatch() {
  const buffer = makeBuffer(0.42);
  const sparkle = [[1, 1], [2, 0.28], [3, 0.1]];
  addTone(buffer, 0.0, 0.16, 659.25, 0.5, sparkle);
  addTone(buffer, 0.16, 0.24, 783.99, 0.5, sparkle);
  writeWav('match.wav', buffer);
}

function generateWrong() {
  const buffer = makeBuffer(0.48);
  const buzz = [[1, 1], [3, 0.35], [5, 0.18]];
  addTone(buffer, 0.0, 0.2, 196.0, 0.42, buzz);
  addTone(buffer, 0.2, 0.26, 146.83, 0.42, buzz);
  writeWav('wrong.wav', buffer);
}

function generateVictory() {
  const buffer = makeBuffer(1.05);
  const shimmer = [[1, 1], [2, 0.22], [3, 0.08]];
  addTone(buffer, 0.0, 0.18, 523.25, 0.5, shimmer);
  addTone(buffer, 0.18, 0.18, 659.25, 0.5, shimmer);
  addTone(buffer, 0.36, 0.18, 783.99, 0.5, shimmer);
  addTone(buffer, 0.54, 0.46, 1046.5, 0.5, shimmer);
  writeWav('victory.wav', buffer);
}

function generateMusic() {
  const step = 0.2;
  const totalSteps = 32;
  const buffer = makeBuffer(step * totalSteps);
  const melody = [
    523.25, 659.25, 783.99, 880.0,
    783.99, 659.25, 587.33, 523.25,
    659.25, 783.99, 880.0, 1046.5,
    880.0, 783.99, 659.25, 523.25,
  ];
  const tone = [[1, 1], [2, 0.16], [3, 0.06]];
  for (let pass = 0; pass < 2; pass++) {
    melody.forEach((frequency, noteIndex) => {
      const offset = (noteIndex + pass * melody.length) * step;
      addTone(buffer, offset, step * 0.92, frequency, 0.16, tone);
    });
  }
  const bass = [130.81, 196.0, 174.61, 196.0];
  for (let pass = 0; pass < 4; pass++) {
    bass.forEach((frequency, bassIndex) => {
      const offset = (bassIndex + pass * bass.length) * step * 2;
      addTone(buffer, offset, step * 1.85, frequency, 0.14, [[1, 1], [2, 0.1]]);
    });
  }
  writeWav('music.wav', buffer);
}

generateFlip();
generateClick();
generateMatch();
generateWrong();
generateVictory();
generateMusic();

console.log('Generated sounds in', OUT_DIR);
