type CloudinaryOpts = {
  w?: number;
  h?: number;
  crop?: string;
  gravity?: string;
  format?: string;
  quality?: string;
  dpr?: string;
};

type ResponsiveCloudinaryOpts = {
  widths?: number[];
  aspectRatio?: [number, number];
  sizes?: string;
  crop?: string;
  gravity?: string;
  format?: string;
  quality?: string;
  dpr?: string;
};

type ResponsiveCloudinaryImage = {
  src: string;
  srcSet: string;
  sizes: string;
  width: number;
  height: number;
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
  if (opts.crop) transforms.push(`c_${opts.crop}`);
  if (opts.gravity) transforms.push(`g_${opts.gravity}`);
  if (typeof opts.w === 'number') transforms.push(`w_${opts.w}`);
  if (typeof opts.h === 'number') transforms.push(`h_${opts.h}`);

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms.join(',')}/${fullId}`;
};

const versionSegmentRegex = /^v\d+$/;
const transformKeyRegex = /^(w|h|c|g|f|q|dpr)_.+/i;

const isTransformSegment = (segment: string) => {
  if (!segment || versionSegmentRegex.test(segment)) return false;
  return segment.includes(',') || transformKeyRegex.test(segment);
};

const buildCloudinaryUrlFromSource = (sourceUrl: string, opts: CloudinaryOpts) => {
  if (!sourceUrl.includes('/res.cloudinary.com/') || !sourceUrl.includes('/image/upload/')) {
    return sourceUrl;
  }

  const [baseUrl, query = ''] = sourceUrl.split('?');
  const uploadMarker = '/image/upload/';
  const markerIndex = baseUrl.indexOf(uploadMarker);
  if (markerIndex === -1) return sourceUrl;

  const prefix = baseUrl.slice(0, markerIndex + uploadMarker.length);
  const afterUpload = baseUrl.slice(markerIndex + uploadMarker.length);
  const segments = afterUpload.split('/').filter(Boolean);
  let publicIdStart = 0;
  while (publicIdStart < segments.length && isTransformSegment(segments[publicIdStart])) {
    publicIdStart += 1;
  }
  if (publicIdStart < segments.length && versionSegmentRegex.test(segments[publicIdStart])) {
    publicIdStart += 1;
  }

  const publicId = segments.slice(publicIdStart).join('/');
  if (!publicId) return sourceUrl;

  const transforms: string[] = [];
  transforms.push(`f_${opts.format || 'auto'}`);
  transforms.push(`q_${opts.quality || 'auto'}`);
  transforms.push(`dpr_${opts.dpr || 'auto'}`);
  if (opts.crop) transforms.push(`c_${opts.crop}`);
  if (opts.gravity) transforms.push(`g_${opts.gravity}`);
  if (typeof opts.w === 'number') transforms.push(`w_${opts.w}`);
  if (typeof opts.h === 'number') transforms.push(`h_${opts.h}`);

  const querySuffix = query ? `?${query}` : '';
  return `${prefix}${transforms.join(',')}/${publicId}${querySuffix}`;
};

export const responsiveCloudinaryImage = (
  sourceUrl: string,
  opts: ResponsiveCloudinaryOpts = {},
): ResponsiveCloudinaryImage => {
  const widths = opts.widths && opts.widths.length > 0 ? opts.widths : [320, 480, 640];
  const [ratioW, ratioH] = opts.aspectRatio || [3, 4];
  const sizes = opts.sizes || '(max-width: 640px) 88vw, (max-width: 1024px) 42vw, 312px';

  const buildDims = (width: number) => ({
    w: width,
    h: Math.round((width * ratioH) / ratioW),
  });

  const srcWidth = widths[widths.length - 1];
  const srcDims = buildDims(srcWidth);
  const transformBase = {
    crop: opts.crop || 'fill',
    gravity: opts.gravity || 'auto',
    format: opts.format || 'auto',
    quality: opts.quality || 'auto',
    dpr: opts.dpr || 'auto',
  };

  const src = buildCloudinaryUrlFromSource(sourceUrl, { ...transformBase, ...srcDims });
  const srcSet = widths
    .map((width) => {
      const dims = buildDims(width);
      const url = buildCloudinaryUrlFromSource(sourceUrl, { ...transformBase, ...dims });
      return `${url} ${width}w`;
    })
    .join(', ');

  return {
    src,
    srcSet,
    sizes,
    width: srcDims.w,
    height: srcDims.h,
  };
};
