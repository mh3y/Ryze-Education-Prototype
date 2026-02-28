import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|svg|avif)$/i;
const MAP_PATH = path.resolve(repoRoot, 'cloudinary-migration-map.json');
const LOCAL_ICON_FILES = new Set([
  'public/favicon.ico',
  'public/favicon-16x16.png',
  'public/favicon-32x32.png',
  'public/apple-touch-icon.png',
  'public/android-chrome-192x192.png',
  'public/android-chrome-512x512.png'
]);

const argv = new Set(process.argv.slice(2));
const dryRun = argv.has('--dry-run');
const forceUpload = argv.has('--upload');

const normalizePosix = (value) => value.replace(/\\/g, '/');
const withoutExt = (value) => value.replace(IMAGE_EXT, '');
const trimSlashes = (value) => value.replace(/^\/+|\/+$/g, '');

const cloudName =
  process.env.VITE_CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUDINARY_CLOUD_NAME ||
  '';
const folder = trimSlashes(process.env.VITE_CLOUDINARY_FOLDER || 'ryze');

if (!cloudName) {
  console.error('Missing CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_CLOUD_NAME');
  process.exit(1);
}

const sourceDirs = ['public', 'src/assets']
  .map((dir) => path.resolve(repoRoot, dir))
  .filter(Boolean);

const exists = async (targetPath) => {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
};

const activeSourceDirs = [];
for (const dir of sourceDirs) {
  // eslint-disable-next-line no-await-in-loop
  if (await exists(dir)) activeSourceDirs.push(dir);
}

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // eslint-disable-next-line no-await-in-loop
      files.push(...(await walk(absolute)));
      continue;
    }
    if (IMAGE_EXT.test(entry.name)) files.push(absolute);
  }
  return files;
};

const allFiles = [];
for (const dir of activeSourceDirs) {
  // eslint-disable-next-line no-await-in-loop
  allFiles.push(...(await walk(dir)));
}

const uploadEnabled =
  !dryRun &&
  (forceUpload || Boolean(process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)));

if (uploadEnabled) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || cloudName,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

const cloudBase = cloudName ? `https://res.cloudinary.com/${cloudName}/image/upload` : '';

const resourceExists = async (publicId) => {
  try {
    await cloudinary.api.resource(publicId, { resource_type: 'image' });
    return true;
  } catch (error) {
    const status = error?.http_code || error?.error?.http_code;
    if (status === 404 || /not found/i.test(error?.message || '')) return false;
    throw error;
  }
};

const entries = {};
const assets = [];
let uploaded = 0;
let existed = 0;
let failed = 0;
let keepLocalSkipped = 0;
let confirmedRemoteCount = 0;

const addAlias = (aliases, alias) => {
  if (!alias) return;
  aliases.add(normalizePosix(alias));
};

for (const absoluteFile of allFiles.sort()) {
  const relRepo = normalizePosix(path.relative(repoRoot, absoluteFile));
  const inPublic = relRepo.startsWith('public/');
  const sourceNoExt = withoutExt(relRepo);
  const publicRelative = inPublic ? relRepo.slice('public/'.length) : '';
  const publicRelativeNoExt = inPublic ? withoutExt(publicRelative) : '';
  const sourcePathNoExt = inPublic ? publicRelativeNoExt : sourceNoExt;
  const webPath = inPublic ? `/${publicRelative}` : null;

  const publicId = folder ? `${folder}/${sourcePathNoExt}` : sourcePathNoExt;
  const url = cloudBase ? `${cloudBase}/f_auto,q_auto,dpr_auto/${publicId}` : '';
  const legacyPublicId = folder ? `${folder}/${sourceNoExt}` : sourceNoExt;
  const legacyUrl = inPublic && cloudBase ? `${cloudBase}/f_auto,q_auto,dpr_auto/${legacyPublicId}` : '';
  const keepLocal = LOCAL_ICON_FILES.has(relRepo);

  let status = keepLocal ? 'local-only' : 'pending';
  let confirmedRemote = false;
  let errorMessage = '';
  if (uploadEnabled && keepLocal) {
    keepLocalSkipped += 1;
  } else if (uploadEnabled && !keepLocal) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const alreadyThere = await resourceExists(publicId);
      if (alreadyThere) {
        status = 'exists';
        confirmedRemote = true;
        existed += 1;
      } else {
        // eslint-disable-next-line no-await-in-loop
        await cloudinary.uploader.upload(absoluteFile, {
          public_id: publicId,
          resource_type: 'image',
          overwrite: false,
          unique_filename: false,
          use_filename: false
        });
        // eslint-disable-next-line no-await-in-loop
        const verifiedAfterUpload = await resourceExists(publicId);
        if (verifiedAfterUpload) {
          status = 'uploaded';
          confirmedRemote = true;
          uploaded += 1;
        } else {
          status = 'failed';
          errorMessage = 'Upload completed but remote verification failed.';
          failed += 1;
        }
      }
    } catch (error) {
      status = 'failed';
      errorMessage = error?.message || String(error);
      failed += 1;
    }
  }

  if (confirmedRemote) {
    confirmedRemoteCount += 1;
  }

  const record = {
    sourceFile: relRepo,
    webPath,
    publicId,
    url,
    keepLocal,
    status,
    confirmedRemote,
    errorMessage
  };

  assets.push(record);

  const aliases = new Set();
  addAlias(aliases, relRepo);
  addAlias(aliases, `./${relRepo}`);

  if (inPublic) {
    addAlias(aliases, webPath);
    addAlias(aliases, publicRelative);
    addAlias(aliases, `./${publicRelative}`);
    addAlias(aliases, `public/${publicRelative}`);
    if (legacyUrl) addAlias(aliases, legacyUrl);
  }

  for (const alias of aliases) {
    entries[alias] = { ...record, matchedAlias: alias };
  }
}

const map = {
  generatedAt: new Date().toISOString(),
  cloudName,
  folder,
  defaults: {
    transformations: 'f_auto,q_auto,dpr_auto'
  },
  summary: {
    totalAssets: assets.length,
    nonKeepLocalAssets: assets.filter((asset) => !asset.keepLocal).length,
    keepLocalAssets: assets.filter((asset) => asset.keepLocal).length,
    uploadEnabled,
    uploaded,
    existed,
    failed,
    keepLocalSkipped,
    confirmedRemote: confirmedRemoteCount,
    unconfirmedNonKeepLocal:
      assets.filter((asset) => !asset.keepLocal).length - confirmedRemoteCount,
    readyForReplacement:
      uploadEnabled &&
      failed === 0 &&
      assets.filter((asset) => !asset.keepLocal).length - confirmedRemoteCount === 0
  },
  assets,
  entries
};

await fs.writeFile(MAP_PATH, `${JSON.stringify(map, null, 2)}\n`, 'utf8');

console.log(`cloudinary-migration-map.json written (${assets.length} assets).`);
if (uploadEnabled) {
  console.log(
    `Upload complete. uploaded=${uploaded}, existed=${existed}, failed=${failed}, keepLocalSkipped=${keepLocalSkipped}`
  );
} else {
  console.log('Upload skipped (dry-run or missing credentials).');
}
