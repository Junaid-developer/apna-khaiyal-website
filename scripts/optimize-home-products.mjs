import fs from 'node:fs';

const file = 'src/App.tsx';
const marker = '/* Slider Core Frame */';
const source = fs.readFileSync(file, 'utf8');
const markerIndex = source.indexOf(marker);

if (markerIndex === -1) {
  throw new Error('Home Featured Products marker not found');
}

const before = source.slice(0, markerIndex + marker.length);
const after = source.slice(markerIndex + marker.length);

if (!after.includes('if (isDataLoading) {')) {
  console.log('Home Featured Products loading condition already optimized.');
  process.exit(0);
}

const optimized = after.replace('if (isDataLoading) {', 'if (false) {', 1);
fs.writeFileSync(file, before + optimized, 'utf8');
console.log('Optimized Home Featured Products: removed blocking loading skeleton.');
