/** Resize and compress images in the browser before upload (Mac photos are often 5–15 MB). */
export async function compressImageForUpload(
  file: File,
  maxWidth = 1200,
  quality = 0.78,
): Promise<{ data: string; contentType: string; filename: string }> {
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  // Skip compression for small files already under ~300 KB
  if (file.size < 300_000) {
    const data = await readFileAsBase64(file);
    return { data, contentType: file.type || "image/jpeg", filename: file.name };
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not prepare image canvas");

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Image compression failed"))),
      "image/jpeg",
      quality,
    );
  });

  const data = await readBlobAsBase64(blob);
  const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
  return { data, contentType: "image/jpeg", filename: `${baseName}.jpg` };
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read image file"));
        return;
      }
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

function readBlobAsBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read compressed image"));
        return;
      }
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read compressed image"));
    reader.readAsDataURL(blob);
  });
}
