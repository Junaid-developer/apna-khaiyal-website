import fs from 'node:fs';

const file = 'src/App.tsx';
const marker = '/* Slider Core Frame */';
const source = fs.readFileSync(file, 'utf8');
const markerIndex = source.indexOf(marker);

// The Featured Products section has been removed from the Home page.
// Nothing needs to be optimized when its old marker no longer exists.
if (markerIndex === -1) {
  console.log('Home Featured Products section is removed; skipping legacy optimization.');
  process.exit(0);
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
