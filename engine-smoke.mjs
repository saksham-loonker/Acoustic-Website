import create from './assets/engine.js';
import { readFileSync } from 'fs';

const wasmBinary = readFileSync('./assets/engine.wasm');
const engine = await create({
  wasmBinary,
  locateFile: (p) => p,
});

console.log('rate', engine._acoustic_demo_rate(), 'frames', engine._acoustic_demo_frames(), 'channels', engine._acoustic_demo_channels());
for (const scene of [0, 1, 2]) {
  const t0 = Date.now();
  const rc = engine._acoustic_demo_render(scene);
  const ms = Date.now() - t0;
  const ptr = engine._acoustic_demo_out();
  const pcm = new Float32Array(engine.HEAPF32.buffer, ptr, engine._acoustic_demo_frames() * 2);
  let peak = 0, sum = 0;
  for (let i = 0; i < pcm.length; i += 16) { const a = Math.abs(pcm[i]); sum += a; if (a > peak) peak = a; }
  const applied = Array.from({ length: 8 }, (_, i) => engine._acoustic_demo_applied(i).toFixed(3)).join(' ');
  console.log(`scene ${scene}: rc=${rc} peak=${peak.toFixed(3)} mean|x|=${(sum / (pcm.length / 16)).toFixed(4)} render=${ms}ms`);
  console.log(`  applied layers: ${applied}`);
}
