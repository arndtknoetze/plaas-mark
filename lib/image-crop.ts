export type CropAspect = "square" | "productPortrait";

type CropOptions = {
  aspect: CropAspect;
  /**
   * Max output dimension (largest side). Keeps payload reasonable for data URLs.
   * Default: 1200
   */
  maxSize?: number;
  /**
   * Output mime type. Default: image/webp (falls back to image/jpeg if unsupported).
   */
  mimeType?: "image/webp" | "image/jpeg" | "image/png";
  /**
   * Output quality for lossy formats. Default: 0.9
   */
  quality?: number;
};

function aspectRatio(aspect: CropAspect) {
  if (aspect === "square") return 1;
  // 4:5 is a common product portrait ratio (works well for lists/grids).
  return 4 / 5;
}

function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Kon nie prent laai nie."));
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function cropRectToAspect(srcW: number, srcH: number, targetAspect: number) {
  // Center-crop to the desired aspect.
  const srcAspect = srcW / srcH;
  if (srcAspect > targetAspect) {
    // Too wide → crop left/right.
    const cropH = srcH;
    const cropW = cropH * targetAspect;
    const sx = (srcW - cropW) / 2;
    const sy = 0;
    return { sx, sy, sw: cropW, sh: cropH };
  }
  // Too tall → crop top/bottom.
  const cropW = srcW;
  const cropH = cropW / targetAspect;
  const sx = 0;
  const sy = (srcH - cropH) / 2;
  return { sx, sy, sw: cropW, sh: cropH };
}

function pickMimeType(preferred: CropOptions["mimeType"]) {
  // Some browsers may not support webp encode; attempt and fall back.
  return preferred ?? "image/webp";
}

export async function fileToCroppedDataUrl(file: File, opts: CropOptions) {
  const img = await loadImageFromFile(file);
  const targetAspect = aspectRatio(opts.aspect);
  const rect = cropRectToAspect(
    img.naturalWidth,
    img.naturalHeight,
    targetAspect,
  );

  const maxSize = typeof opts.maxSize === "number" ? opts.maxSize : 1200;
  const quality = typeof opts.quality === "number" ? opts.quality : 0.9;

  // Compute output canvas size (limit largest side to maxSize).
  const scale = Math.min(1, maxSize / Math.max(rect.sw, rect.sh));
  const outW = clampInt(rect.sw * scale, 1, maxSize);
  const outH = clampInt(rect.sh * scale, 1, maxSize);

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Kon nie prent verwerk nie.");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, rect.sx, rect.sy, rect.sw, rect.sh, 0, 0, outW, outH);

  const preferred = pickMimeType(opts.mimeType);
  const tryEncode = (mime: string) => canvas.toDataURL(mime, quality);
  const out =
    preferred === "image/webp"
      ? (() => {
          const data = tryEncode("image/webp");
          // Some browsers return "data:image/png" even if asked for webp.
          return data.startsWith("data:image/webp")
            ? data
            : tryEncode("image/jpeg");
        })()
      : tryEncode(preferred);

  return out;
}
