type CloudinaryOpts = {
  w?: number;
  h?: number;
  crop?: string;
  format?: string;
  quality?: string;
  dpr?: string;
};

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, '');

const toPublicId = (assetPath: string) => {
  const clean = trimSlashes(assetPath.split('?')[0]);
  const withoutPublicPrefix = clean.startsWith('public/') ? clean.slice('public/'.length) : clean;
  return withoutPublicPrefix.replace(/\.(png|jpe?g|webp|gif|svg|avif)$/i, '');
};

export const cldUrl = (publicId: string, opts: CloudinaryOpts = {}) => {
  if (!publicId) return '';
  if (/^https?:\/\//i.test(publicId)) return publicId;

  const cloudName = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '').trim();
  if (!cloudName) return publicId;

  const folder = trimSlashes((import.meta.env.VITE_CLOUDINARY_FOLDER || '').trim());
  const id = toPublicId(publicId);
  const fullId = folder ? `${folder}/${id}` : id;

  const transforms: string[] = [];
  transforms.push(`f_${opts.format || 'auto'}`);
  transforms.push(`q_${opts.quality || 'auto'}`);
  transforms.push(`dpr_${opts.dpr || 'auto'}`);
  if (typeof opts.w === 'number') transforms.push(`w_${opts.w}`);
  if (typeof opts.h === 'number') transforms.push(`h_${opts.h}`);
  if (opts.crop) transforms.push(`c_${opts.crop}`);

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms.join(',')}/${fullId}`;
};

