import fs from 'node:fs';
import path from 'node:path';

const appPath = path.resolve('src/App.tsx');
let source = fs.readFileSync(appPath, 'utf8');

const beforeState = 'const [isDataLoading, setIsDataLoading] = useState<boolean>(true);';
const afterState = 'const [isDataLoading, setIsDataLoading] = useState<boolean>(false);';

if (source.includes(beforeState)) {
  source = source.replace(beforeState, afterState);
}

const beforeSync = `const initSync = async () => {\n      setIsDataLoading(true);\n      const liveData = await syncAllFromSupabase();`;
const afterSync = `const initSync = async () => {\n      const liveData = await syncAllFromSupabase();`;

if (source.includes(beforeSync)) {
  source = source.replace(beforeSync, afterSync);
}

fs.writeFileSync(appPath, source, 'utf8');
console.log('[instant-home-load] Home now renders cached/local data immediately while Supabase sync runs in the background.');
