import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const argv = new Set(process.argv.slice(2));
const write = argv.has('--write');
const force = argv.has('--force');

const MAP_PATH = path.resolve(repoRoot, 'cloudinary-migration-map.json');
const REPORT_PATH = path.resolve(repoRoot, 'cloudinary-reference-report.json');

const FILE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.scss', '.html', '.md', '.mdx', '.webmanifest']);
const EXCLUDE_DIR = new Set(['node_modules', 'dist', '.git']);
const LOCAL_ICON_FILES = new Set([
  'public/favicon.ico',
  'public/favicon-16x16.png',
  'public/favicon-32x32.png',
  'public/apple-touch-icon.png',
  'public/android-chrome-192x192.png',
  'public/android-chrome-512x512.png'
]);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const shouldIgnorePath = (absolute) => {
  const rel = path.relative(repoRoot, absolute);
  return rel.split(path.sep).some((segment) => EXCLUDE_DIR.has(segment));
};

const walkFiles = async (dir, result = []) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    if (shouldIgnorePath(absolute)) continue;
    if (entry.isDirectory()) {
      // eslint-disable-next-line no-await-in-loop
      await walkFiles(absolute, result);
      continue;
    }
    if (FILE_EXT.has(path.extname(entry.name).toLowerCase())) result.push(absolute);
  }
  return result;
};

const decodeHtmlAmp = (value) => value.replace(/&amp;/gi, '&');
const encodeHtmlAmp = (value) => value.replace(/&/g, '&amp;');

const IMAGE_REF_REGEX =
  /(?:https?:\/\/[^\s"'`)\]]+|(?:\/|\.\.?\/)[^\s"'`)\]]+)\.(?:png|jpe?g|webp|gif|svg|avif)(?:\?[^\s"'`)\]]*)?/gi;
const GITHUB_BLOB_REGEX = /https?:\/\/github\.com\/[^\s"'`)\]]+\/blob\/[^\s"'`)\]]+(?:\?raw=1)?/gi;
const RAW_GITHUB_REGEX = /https?:\/\/raw\.githubusercontent\.com\/[^\s"'`)\]]+/gi;
const NEW_URL_REGEX =
  /new\s+URL\(\s*(['"`])([^'"`]+\.(?:png|jpe?g|webp|gif|svg|avif)(?:\?[^'"`]*)?)\1\s*,\s*import\.meta\.url\s*\)/gi;

const parseImageRefs = (content) => {
  const refs = [];

  for (const regex of [IMAGE_REF_REGEX, GITHUB_BLOB_REGEX, RAW_GITHUB_REGEX]) {
    let match = regex.exec(content);
    while (match) {
      refs.push(match[0]);
      match = regex.exec(content);
    }
    regex.lastIndex = 0;
  }

  let urlMatch = NEW_URL_REGEX.exec(content);
  while (urlMatch) {
    refs.push(urlMatch[2]);
    urlMatch = NEW_URL_REGEX.exec(content);
  }
  NEW_URL_REGEX.lastIndex = 0;

  return refs;
};

const mapRaw = JSON.parse(await fs.readFile(MAP_PATH, 'utf8'));
const mapEntries = mapRaw.entries || {};
const mapAssets = Array.isArray(mapRaw.assets) ? mapRaw.assets : [];
const nonKeepLocalAssets = mapAssets.filter((asset) => !asset.keepLocal);
const unconfirmedAssets = nonKeepLocalAssets.filter(
  (asset) => !asset.confirmedRemote || asset.status === 'failed'
);

if (write && !force) {
  if (!mapRaw?.summary?.uploadEnabled) {
    console.error(
      'Refusing to apply replacements: map summary shows uploadEnabled=false. Run `npm run images:upload` with Cloudinary credentials first, or pass --force.'
    );
    process.exit(1);
  }

  if (unconfirmedAssets.length > 0) {
    const sample = unconfirmedAssets
      .slice(0, 5)
      .map((asset) => `${asset.sourceFile} [status=${asset.status || 'unknown'}]`)
      .join(', ');
    console.error(
      `Refusing to apply replacements: ${unconfirmedAssets.length} non-keepLocal assets are not confirmed remote. Examples: ${sample}. Re-run uploads or pass --force.`
    );
    process.exit(1);
  }
}

const replacementKeys = Object.keys(mapEntries)
  .filter((key) => {
    const record = mapEntries[key];
    if (!record?.url) return false;
    if (record.keepLocal) return false;
    if (record.sourceFile && LOCAL_ICON_FILES.has(record.sourceFile)) return false;
    return true;
  })
  .sort((a, b) => b.length - a.length);

const files = await walkFiles(repoRoot);
const replacementLog = [];
const unmatched = [];
const detectedReferences = [];
let replacementCount = 0;

for (const absolute of files) {
  const rel = path.relative(repoRoot, absolute).replace(/\\/g, '/');
  const original = await fs.readFile(absolute, 'utf8');
  const originalRefs = parseImageRefs(original);
  for (const ref of originalRefs) {
    detectedReferences.push({ file: rel, reference: decodeHtmlAmp(ref) });
  }
  let updated = original;
  let fileReplacements = 0;

  for (const key of replacementKeys) {
    const record = mapEntries[key];
    if (!record?.url) continue;

    const keyVariants = new Set([key, decodeHtmlAmp(key), encodeHtmlAmp(key)]);
    for (const candidate of keyVariants) {
      if (!candidate) continue;
      const escaped = escapeRegex(candidate);
      const hasQueryInKey = decodeHtmlAmp(candidate).includes('?');
      const regex = hasQueryInKey
        ? new RegExp(escaped, 'g')
        : new RegExp(`${escaped}(?:\\?[^"'\\s)\\]]*)?`, 'g');

      updated = updated.replace(regex, () => {
        fileReplacements += 1;
        replacementCount += 1;
        return record.url;
      });
    }
  }

  if (fileReplacements > 0) {
    replacementLog.push({ file: rel, replacements: fileReplacements });
    if (write) await fs.writeFile(absolute, updated, 'utf8');
  }

  const refs = parseImageRefs(updated);
  for (const ref of refs) {
    const normalized = decodeHtmlAmp(ref);
    if (normalized.includes('res.cloudinary.com')) continue;
    if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
      if (!normalized.includes('raw.githubusercontent.com') && !normalized.includes('/blob/')) continue;
    }
    unmatched.push({ file: rel, reference: normalized });
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  mode: write ? 'write' : 'dry-run',
  totals: {
    filesScanned: files.length,
    filesChanged: replacementLog.length,
    replacements: replacementCount,
    detectedReferences: detectedReferences.length,
    unmatchedReferences: unmatched.length
  },
  detectedReferences,
  changedFiles: replacementLog,
  unmatched
};

await fs.writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log(
  `${write ? 'Applied' : 'Planned'} ${replacementCount} replacements across ${replacementLog.length} files.`
);
console.log(`Reference report: ${path.relative(repoRoot, REPORT_PATH)}`);
if (unmatched.length > 0) {
  console.log(`Unmatched references found: ${unmatched.length}`);
}
